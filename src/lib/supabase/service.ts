// src/lib/supabase/service.ts - Server-side Supabase operations for DeltaFix
import { createClient } from '@supabase/supabase-js';
import { ProductItem, ProductBOMItem, ProductRoutingItem } from '../standards/types';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://supabase-supabasedeltafix.1cnep6.easypanel.host';
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJzZXJ2aWNlX3JvbGUiLAogICAgImlzcyI6ICJzdXBhYmFzZS1kZW1vIiwKICAgICJpYXQiOiAxNjQxNzY5MjAwLAogICAgImV4cCI6IDE3OTk1MzU2MDAKfQ.DaYlNEoUrrEn2Ig7tqibS-PHK5vgusbcbo7X36XVt4Q';

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

export async function saveProductToDatabase(product: ProductItem): Promise<{ data: any; error: any }> {
  try {
    // 1. Get standard_id from engineering_standards
    const { data: stdData } = await supabaseAdmin
      .from('engineering_standards')
      .select('id')
      .eq('code', product.standard_code)
      .single();

    const standard_id = stdData?.id || null;

    // 2. Upsert product
    const { data: savedProduct, error: prodErr } = await supabaseAdmin
      .from('products')
      .upsert(
        {
          sku_gerado: product.sku_gerado,
          codigo_interno_delta: product.codigo_interno_delta || null,
          standard_id,
          bitola: product.bitola,
          passo: product.passo,
          comprimento: product.comprimento || null,
          classe_resistencia: product.classe_resistencia,
          material_base: product.material_base,
          tratamento_superficial: product.tratamento_superficial,
          peso_liquido_kg: product.peso_liquido_kg,
          peso_bruto_kg: product.peso_bruto_kg,
          fator_perda_percentual: product.fator_perda_percentual,
          especificacoes_adicionais: {
            comprimento_rosca_b: product.comprimento_rosca_b,
            ...product.especificacoes_adicionais
          }
        },
        { onConflict: 'sku_gerado' }
      )
      .select()
      .single();

    if (prodErr) throw prodErr;

    // 3. Generate default BOM items
    if (savedProduct?.id) {
      await supabaseAdmin.from('product_bom').delete().eq('product_id', savedProduct.id);

      const bomItems = [
        {
          product_id: savedProduct.id,
          item_type: 'materia_prima',
          description: `Barra / Tarugo Bruto (${product.material_base})`,
          consumption_per_thousand: Number((product.peso_bruto_kg * 1000).toFixed(3)),
          unit: 'kg',
          loss_factor_percentage: product.fator_perda_percentual
        },
        {
          product_id: savedProduct.id,
          item_type: 'insumo_quimico',
          description: `Tratamento Superficial (${product.tratamento_superficial})`,
          consumption_per_thousand: Number((product.peso_liquido_kg * 1000 * 0.035).toFixed(3)),
          unit: 'kg',
          loss_factor_percentage: 2.0
        },
        {
          product_id: savedProduct.id,
          item_type: 'embalagem',
          description: 'Caixa de Papelão Reforçada DeltaFix 25kg + Saco Plástico VCI Anti-corrosão',
          consumption_per_thousand: Number(Math.ceil((product.peso_liquido_kg * 1000) / 25)),
          unit: 'un',
          loss_factor_percentage: 1.0
        }
      ];
      await supabaseAdmin.from('product_bom').insert(bomItems);

      // 4. Generate default Routings
      await supabaseAdmin.from('product_routings').delete().eq('product_id', savedProduct.id);

      const routings = [
        {
          product_id: savedProduct.id,
          operation_seq: 10,
          operation_name: 'Corte de Tarugo em Serra de Fita CNC',
          setup_time_minutes: 20.0,
          cycle_time_seconds: 15.0,
          description: `Corte no comprimento de ${((product.comprimento || 50) + 15)}mm com tolerância ±0.5mm`
        },
        {
          product_id: savedProduct.id,
          operation_seq: 20,
          operation_name: 'Usinagem CNC de Cabeceamento / Sextavado',
          setup_time_minutes: 45.0,
          cycle_time_seconds: 40.0,
          description: 'Usinagem de corpo, faceamento, chanfro 45° e cabeceamento'
        },
        {
          product_id: savedProduct.id,
          operation_seq: 30,
          operation_name: 'Laminação de Rosca por Conformação Mecânica',
          setup_time_minutes: 30.0,
          cycle_time_seconds: 8.0,
          description: `Laminação de rosca métrica grossa passo ${product.passo}mm com matriz cilíndrica classe 6g`
        },
        {
          product_id: savedProduct.id,
          operation_seq: 40,
          operation_name: 'Tratamento Térmico (Têmpera & Revenimento)',
          setup_time_minutes: 60.0,
          cycle_time_seconds: 4.0,
          description: `Tratamento para atingir propriedades mecânicas da Classe ${product.classe_resistencia}`
        },
        {
          product_id: savedProduct.id,
          operation_seq: 50,
          operation_name: `Tratamento Superficial: ${product.tratamento_superficial}`,
          setup_time_minutes: 15.0,
          cycle_time_seconds: 2.0,
          description: 'Banho protetivo e passivação conforme especificação automotiva/industrial'
        },
        {
          product_id: savedProduct.id,
          operation_seq: 60,
          operation_name: 'Controle de Qualidade Final (CQ) & Embalagem',
          setup_time_minutes: 10.0,
          cycle_time_seconds: 5.0,
          description: 'Inspeção dimensional por amostragem AQL 0.65 e ensaios de dureza'
        }
      ];
      await supabaseAdmin.from('product_routings').insert(routings);
    }

    return { data: savedProduct, error: null };
  } catch (err: any) {
    console.error('Error saving product:', err);
    return { data: null, error: err.message || err };
  }
}

export async function fetchRecentProducts(): Promise<ProductItem[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*, engineering_standards(code, family)')
      .order('created_at', { ascending: false })
      .limit(25);

    if (error) throw error;

    return (data || []).map((row: any) => ({
      id: row.id,
      sku_gerado: row.sku_gerado,
      codigo_interno_delta: row.codigo_interno_delta,
      standard_id: row.standard_id,
      standard_code: row.engineering_standards?.code || 'DIN 933',
      family: row.engineering_standards?.family || 'parafuso',
      bitola: row.bitola,
      passo: Number(row.passo),
      comprimento: row.comprimento ? Number(row.comprimento) : undefined,
      classe_resistencia: row.classe_resistencia,
      material_base: row.material_base,
      tratamento_superficial: row.tratamento_superficial,
      peso_liquido_kg: Number(row.peso_liquido_kg),
      peso_bruto_kg: Number(row.peso_bruto_kg),
      fator_perda_percentual: Number(row.fator_perda_percentual),
      comprimento_rosca_b: row.especificacoes_adicionais?.comprimento_rosca_b,
      especificacoes_adicionais: row.especificacoes_adicionais,
      created_at: row.created_at
    }));
  } catch (err) {
    console.error('Failed to fetch products:', err);
    return [];
  }
}
