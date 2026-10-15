// scripts/migrate.mjs - Database migration and seed script for DeltaFix on Supabase PostgreSQL
import fs from 'fs';

const SUPABASE_PG_QUERY_URL = 'https://supabase-supabasedeltafix.1cnep6.easypanel.host/pg/query';
const BASIC_AUTH = Buffer.from('supabase:this_password_is_insecure_and_should_be_updated').toString('base64');
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJzZXJ2aWNlX3JvbGUiLAogICAgImlzcyI6ICJzdXBhYmFzZS1kZW1vIiwKICAgICJpYXQiOiAxNjQxNzY5MjAwLAogICAgImV4cCI6IDE3OTk1MzU2MDAKfQ.DaYlNEoUrrEn2Ig7tqibS-PHK5vgusbcbo7X36XVt4Q';

async function runQuery(sql, description) {
  console.log(`\n⏳ Executing: ${description}...`);
  try {
    const res = await fetch(SUPABASE_PG_QUERY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${BASIC_AUTH}`,
        'apikey': SERVICE_KEY
      },
      body: JSON.stringify({ query: sql })
    });

    const bodyText = await res.text();
    if (!res.ok) {
      console.error(`❌ Error in ${description} (HTTP ${res.status}):`, bodyText);
      return false;
    }
    console.log(`✅ Success: ${description}`);
    return true;
  } catch (err) {
    console.error(`❌ Exception in ${description}:`, err.message);
    return false;
  }
}

const SCHEMA_SQL = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Standards Table
CREATE TABLE IF NOT EXISTS public.engineering_standards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  family VARCHAR(50) NOT NULL CHECK (family IN ('parafuso', 'porca', 'arruela')),
  system VARCHAR(20) NOT NULL DEFAULT 'metrico',
  description TEXT,
  calculation_formulas JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Standard Dimensions Table
CREATE TABLE IF NOT EXISTS public.standard_dimensions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  standard_id UUID NOT NULL REFERENCES public.engineering_standards(id) ON DELETE CASCADE,
  bitola VARCHAR(20) NOT NULL,
  diametro_nominal NUMERIC(10,3) NOT NULL, -- d
  passo NUMERIC(10,3) NOT NULL,            -- P
  chave NUMERIC(10,3),                     -- s
  altura_cabeca NUMERIC(10,3),             -- k (parafuso) ou m (porca)
  diametro_cabeca NUMERIC(10,3),           -- dk (Allen) ou d2 (arruela)
  vertice NUMERIC(10,3),                   -- e
  diametro_interno NUMERIC(10,3),          -- d1 (arruela)
  diametro_externo NUMERIC(10,3),          -- d2 (arruela)
  espessura NUMERIC(10,3),                 -- s (arruela)
  comprimentos_validos JSONB DEFAULT '[]'::jsonb,
  tolerancias JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unq_standard_bitola UNIQUE (standard_id, bitola)
);

-- 3. Products Table (Finished goods / Engineered items)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku_gerado VARCHAR(120) UNIQUE NOT NULL,
  codigo_interno_delta VARCHAR(100),
  standard_id UUID REFERENCES public.engineering_standards(id),
  bitola VARCHAR(20) NOT NULL,
  passo NUMERIC(10,3) NOT NULL,
  comprimento NUMERIC(10,3),
  classe_resistencia VARCHAR(50) NOT NULL,
  material_base VARCHAR(100) NOT NULL,
  tratamento_superficial VARCHAR(100) NOT NULL,
  peso_liquido_kg NUMERIC(12,5) NOT NULL,
  peso_bruto_kg NUMERIC(12,5) NOT NULL,
  fator_perda_percentual NUMERIC(6,2) NOT NULL,
  especificacoes_adicionais JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku_gerado);
CREATE INDEX IF NOT EXISTS idx_products_cod_delta ON public.products(codigo_interno_delta);

-- 4. Resource Groups Table (MES / Industrial routing groups)
CREATE TABLE IF NOT EXISTS public.resource_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Resources Table (Workstations / Machines)
CREATE TABLE IF NOT EXISTS public.resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES public.resource_groups(id) ON DELETE SET NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  hourly_rate NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  capacity_units_per_hour NUMERIC(10,2) NOT NULL DEFAULT 100.00,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Product BOM (Bill of Materials)
CREATE TABLE IF NOT EXISTS public.product_bom (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  item_type VARCHAR(50) NOT NULL, -- 'materia_prima', 'insumo_quimico', 'embalagem'
  description TEXT NOT NULL,
  consumption_per_thousand NUMERIC(12,4) NOT NULL,
  unit VARCHAR(20) NOT NULL DEFAULT 'kg',
  loss_factor_percentage NUMERIC(6,2) NOT NULL DEFAULT 5.00,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Product Routings (Operational sequence / Roteiro de produção)
CREATE TABLE IF NOT EXISTS public.product_routings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  operation_seq INT NOT NULL,
  operation_name VARCHAR(100) NOT NULL,
  resource_id UUID REFERENCES public.resources(id) ON DELETE SET NULL,
  setup_time_minutes NUMERIC(8,2) NOT NULL DEFAULT 0,
  cycle_time_seconds NUMERIC(8,2) NOT NULL DEFAULT 0,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS and create open policy for public access during core development
ALTER TABLE public.engineering_standards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.standard_dimensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_bom ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_routings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'allow_all_standards') THEN
    CREATE POLICY allow_all_standards ON public.engineering_standards FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'allow_all_dimensions') THEN
    CREATE POLICY allow_all_dimensions ON public.standard_dimensions FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'allow_all_products') THEN
    CREATE POLICY allow_all_products ON public.products FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'allow_all_groups') THEN
    CREATE POLICY allow_all_groups ON public.resource_groups FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'allow_all_resources') THEN
    CREATE POLICY allow_all_resources ON public.resources FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'allow_all_bom') THEN
    CREATE POLICY allow_all_bom ON public.product_bom FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'allow_all_routings') THEN
    CREATE POLICY allow_all_routings ON public.product_routings FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
`;

async function main() {
  console.log('🚀 Starting Supabase PostgreSQL Migration for DeltaFix...');
  const ok = await runQuery(SCHEMA_SQL, 'Create DeltaFix Schema & Tables');
  if (!ok) {
    console.error('Migration failed');
    process.exit(1);
  }
  console.log('🎉 Migration applied successfully!');
}

main();
