// scripts/update_standards_schema.mjs
const SUPABASE_PG_QUERY_URL = 'https://supabase-supabasedeltafix.1cnep6.easypanel.host/pg/query';
const BASIC_AUTH = Buffer.from('supabase:this_password_is_insecure_and_should_be_updated').toString('base64');
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJzZXJ2aWNlX3JvbGUiLAogICAgImlzcyI6ICJzdXBhYmFzZS1kZW1vIiwKICAgICJpYXQiOiAxNjQxNzY5MjAwLAogICAgImV4cCI6IDE3OTk1MzU2MDAKfQ.DaYlNEoUrrEn2Ig7tqibS-PHK5vgusbcbo7X36XVt4Q';

async function updateSchema() {
  const sql = `
    -- Relax constraints to allow unlimited standards, families and systems (DIN, ISO, ASTM, ASME)
    ALTER TABLE public.engineering_standards DROP CONSTRAINT IF EXISTS engineering_standards_family_check;
    ALTER TABLE public.engineering_standards ALTER COLUMN system DROP DEFAULT;
    ALTER TABLE public.engineering_standards ALTER COLUMN system SET DEFAULT 'metrico';

    -- Ensure geometric_archetype column or indexing in calculation_formulas
    COMMENT ON TABLE public.engineering_standards IS 'Dynamic Technical Standards (DIN, ISO, ASTM, ASME, ANSI, Custom)';
  `;

  console.log('Relaxing constraints on engineering_standards table...');
  const res = await fetch(SUPABASE_PG_QUERY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${BASIC_AUTH}`,
      'apikey': SERVICE_KEY
    },
    body: JSON.stringify({ query: sql })
  });

  const text = await res.text();
  console.log('Result:', res.status, text);
}

updateSchema();
