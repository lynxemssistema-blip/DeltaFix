// scripts/seed_standards.mjs - Seed DIN Standards and Parametric Matrices into Supabase PostgreSQL
const SUPABASE_PG_QUERY_URL = 'https://supabase-supabasedeltafix.1cnep6.easypanel.host/pg/query';
const BASIC_AUTH = Buffer.from('supabase:this_password_is_insecure_and_should_be_updated').toString('base64');
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJzZXJ2aWNlX3JvbGUiLAogICAgImlzcyI6ICJzdXBhYmFzZS1kZW1vIiwKICAgICJpYXQiOiAxNjQxNzY5MjAwLAogICAgImV4cCI6IDE3OTk1MzU2MDAKfQ.DaYlNEoUrrEn2Ig7tqibS-PHK5vgusbcbo7X36XVt4Q';

async function runQuery(sql, description) {
  console.log(`⏳ ${description}...`);
  const res = await fetch(SUPABASE_PG_QUERY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${BASIC_AUTH}`,
      'apikey': SERVICE_KEY
    },
    body: JSON.stringify({ query: sql })
  });

  if (!res.ok) {
    const txt = await res.text();
    console.error(`❌ Error in ${description}:`, txt);
    throw new Error(txt);
  }
  console.log(`✅ ${description}`);
}

async function main() {
  console.log('📦 Seeding DeltaFix Engineering Standards & Resource Groups...');

  // 1. Resource Groups & Workstations (MES)
  const resourcesSQL = `
  INSERT INTO public.resource_groups (code, name, description) VALUES
    ('CORTE', 'Corte & Preparação de Tarugo', 'Serras de fita automáticas, cisalhamento e corte por bedame CNC'),
    ('USINAGEM', 'Usinagem CNC & Cabeceamento', 'Tornos CNC industriais, prensas de forjamento a quente/frio'),
    ('LAMINACAO', 'Laminação de Rosca', 'Laminadoras de rosca por conformação mecânica (alta tenacidade à fadiga)'),
    ('TRAT_TERM', 'Tratamento Térmico', 'Fornos contínuos de têmpera e revenimento sob atmosfera controlada'),
    ('TRAT_SUP', 'Tratamento Superficial', 'Linhas de galvanoplastia: Zincagem Eletrolítica, Fogo, Bicromatização, Geomet'),
    ('CQ', 'Controle de Qualidade & Metrologia', 'Projetor de perfil, durômetro Rockwell/Brinell, ensaio de tração')
  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

  INSERT INTO public.resources (group_id, code, name, hourly_rate, capacity_units_per_hour)
  SELECT id, 'SERRA-CNC-01', 'Serra de Fita Automática CNC Kasto', 120.00, 350.00 FROM public.resource_groups WHERE code = 'CORTE'
  ON CONFLICT (code) DO NOTHING;

  INSERT INTO public.resources (group_id, code, name, hourly_rate, capacity_units_per_hour)
  SELECT id, 'TORNO-CNC-01', 'Torno CNC Romi Centur 35D', 180.00, 150.00 FROM public.resource_groups WHERE code = 'USINAGEM'
  ON CONFLICT (code) DO NOTHING;

  INSERT INTO public.resources (group_id, code, name, hourly_rate, capacity_units_per_hour)
  SELECT id, 'LAMIN-01', 'Laminadora Hidráulica de Rosca 30T', 160.00, 400.00 FROM public.resource_groups WHERE code = 'LAMINACAO'
  ON CONFLICT (code) DO NOTHING;

  INSERT INTO public.resources (group_id, code, name, hourly_rate, capacity_units_per_hour)
  SELECT id, 'FORNO-CONT-01', 'Forno Contínuo de Têmpera & Revenimento', 220.00, 800.00 FROM public.resource_groups WHERE code = 'TRAT_TERM'
  ON CONFLICT (code) DO NOTHING;

  INSERT INTO public.resources (group_id, code, name, hourly_rate, capacity_units_per_hour)
  SELECT id, 'LINHA-ZINC-01', 'Linha Automática de Zincagem Eletrolítica ZB', 95.00, 1200.00 FROM public.resource_groups WHERE code = 'TRAT_SUP'
  ON CONFLICT (code) DO NOTHING;

  INSERT INTO public.resources (group_id, code, name, hourly_rate, capacity_units_per_hour)
  SELECT id, 'POSTO-CQ-01', 'Bancada Metrológica Mitutoyo & Ensaio Tração', 110.00, 200.00 FROM public.resource_groups WHERE code = 'CQ'
  ON CONFLICT (code) DO NOTHING;
  `;
  await runQuery(resourcesSQL, 'Seed Resource Groups & Machines');

  // 2. Standards
  const standardsSQL = `
  INSERT INTO public.engineering_standards (code, family, system, description, calculation_formulas) VALUES
    ('DIN 933', 'parafuso', 'metrico', 'Parafuso de cabeça sextavada com rosca total métrica grossa (ISO 4017)', '{"rosca": "total", "tolerancia_haste": "h13", "tolerancia_rosca": "6g"}'),
    ('DIN 931', 'parafuso', 'metrico', 'Parafuso de cabeça sextavada com rosca parcial métrica grossa (ISO 4014)', '{"rosca": "parcial", "formula_b": "L <= 125 ? 2*d + 6 : L <= 200 ? 2*d + 12 : 2*d + 25"}'),
    ('DIN 912', 'parafuso', 'metrico', 'Parafuso sextavado interno (Allen) cabeça cilíndrica (ISO 4762)', '{"rosca": "parcial_ou_total", "formula_b": "L <= 125 ? 2*d + 12 : 2*d + 18"}'),
    ('DIN 934', 'porca', 'metrico', 'Porca sextavada métrica padrão (ISO 4032)', '{"tipo": "porca_padrao", "tolerancia_rosca": "6H"}'),
    ('DIN 125A', 'arruela', 'metrico', 'Arruela lisa métrica sem chanfro Forma A (ISO 7089)', '{"tipo": "arruela_lisa", "dureza": "140HV / 200HV / 300HV"}'),
    ('DIN 127B', 'arruela', 'metrico', 'Arruela de pressão helicoidal de extremidades planas Forma B', '{"tipo": "pressao_helicoidal", "dureza": "44-51 HRC"}')
  ON CONFLICT (code) DO UPDATE SET
    description = EXCLUDED.description,
    calculation_formulas = EXCLUDED.calculation_formulas;
  `;
  await runQuery(standardsSQL, 'Seed Engineering Standards');

  // 3. Dimensional Matrices for DIN 933, DIN 931, DIN 912, DIN 934, DIN 125A, DIN 127B
  const metricBolts = [
    { bitola: 'M6',  d: 6,  p: 1.0,  s: 10, k: 4.0,  e: 11.05, lengths: [10,12,16,20,25,30,35,40,45,50,60,70,80] },
    { bitola: 'M8',  d: 8,  p: 1.25, s: 13, k: 5.3,  e: 14.38, lengths: [16,20,25,30,35,40,45,50,55,60,65,70,80,90,100] },
    { bitola: 'M10', d: 10, p: 1.5,  s: 17, k: 6.4,  e: 18.90, lengths: [20,25,30,35,40,45,50,55,60,65,70,80,90,100,110,120] },
    { bitola: 'M12', d: 12, p: 1.75, s: 19, k: 7.5,  e: 21.10, lengths: [25,30,35,40,45,50,55,60,65,70,80,90,100,110,120,130,140,150] },
    { bitola: 'M14', d: 14, p: 2.0,  s: 22, k: 8.8,  e: 24.49, lengths: [30,35,40,45,50,55,60,65,70,80,90,100,110,120,130,140,150,160] },
    { bitola: 'M16', d: 16, p: 2.0,  s: 24, k: 10.0, e: 26.75, lengths: [35,40,45,50,55,60,65,70,80,90,100,110,120,130,140,150,160,180,200] },
    { bitola: 'M18', d: 18, p: 2.5,  s: 27, k: 11.5, e: 30.14, lengths: [40,45,50,55,60,65,70,80,90,100,110,120,130,140,150,160,180,200,220] },
    { bitola: 'M20', d: 20, p: 2.5,  s: 30, k: 12.5, e: 33.53, lengths: [45,50,55,60,65,70,80,90,100,110,120,130,140,150,160,180,200,220,240,260] },
    { bitola: 'M22', d: 22, p: 2.5,  s: 32, k: 14.0, e: 35.72, lengths: [50,55,60,65,70,80,90,100,110,120,130,140,150,160,180,200,220,240,260,280] },
    { bitola: 'M24', d: 24, p: 3.0,  s: 36, k: 15.0, e: 39.98, lengths: [55,60,65,70,80,90,100,110,120,130,140,150,160,180,200,220,240,260,280,300] },
    { bitola: 'M27', d: 27, p: 3.0,  s: 41, k: 17.0, e: 45.63, lengths: [60,70,80,90,100,110,120,130,140,150,160,180,200,220,240,260,280,300,320] },
    { bitola: 'M30', d: 30, p: 3.5,  s: 46, k: 18.7, e: 51.28, lengths: [70,80,90,100,110,120,130,140,150,160,180,200,220,240,260,280,300,320,350,400] },
    { bitola: 'M33', d: 33, p: 3.5,  s: 50, k: 21.0, e: 55.80, lengths: [80,90,100,110,120,130,140,150,160,180,200,220,240,260,280,300,350,400] },
    { bitola: 'M36', d: 36, p: 4.0,  s: 55, k: 22.5, e: 61.31, lengths: [90,100,110,120,130,140,150,160,180,200,220,240,260,280,300,350,400,450] },
    { bitola: 'M39', d: 39, p: 4.0,  s: 60, k: 25.0, e: 66.96, lengths: [100,110,120,130,140,150,160,180,200,220,240,260,280,300,350,400,450,500] },
    { bitola: 'M42', d: 42, p: 4.5,  s: 65, k: 26.0, e: 72.61, lengths: [100,120,130,140,150,160,180,200,220,240,260,280,300,350,400,450,500] },
    { bitola: 'M45', d: 45, p: 4.5,  s: 70, k: 28.0, e: 78.26, lengths: [110,120,140,150,160,180,200,220,240,260,280,300,350,400,450,500] },
    { bitola: 'M48', d: 48, p: 5.0,  s: 75, k: 30.0, e: 83.91, lengths: [120,140,150,160,180,200,220,240,260,280,300,350,400,450,500,550,600] },
    { bitola: 'M52', d: 52, p: 5.0,  s: 80, k: 33.0, e: 89.56, lengths: [130,140,160,180,200,220,240,260,280,300,350,400,450,500,550,600] },
    { bitola: 'M56', d: 56, p: 5.5,  s: 85, k: 35.0, e: 95.21, lengths: [140,160,180,200,220,240,260,280,300,350,400,450,500,550,600] },
    { bitola: 'M64', d: 64, p: 6.0,  s: 95, k: 40.0, e: 106.51, lengths: [160,180,200,220,240,260,280,300,350,400,450,500,550,600] }
  ];

  // Insert DIN 933 dimensions
  let d933Inserts = [];
  for (const b of metricBolts) {
    const tols = JSON.stringify({
      diametro: { nominal: b.d, min: b.d - 0.28, max: b.d, instrumento: 'Micrômetro externo digital 0.001mm' },
      chave_s: { nominal: b.s, min: b.s - 0.35, max: b.s, instrumento: 'Paquímetro universal digital Mitutoyo' },
      altura_k: { nominal: b.k, min: b.k - 0.25, max: b.k + 0.25, instrumento: 'Paquímetro de profundidade / relógio apalpador' },
      rosca: { classe: '6g', instrumento: 'Calibrador anel passa/não-passa' }
    });
    d933Inserts.push(`(
      (SELECT id FROM public.engineering_standards WHERE code = 'DIN 933'),
      '${b.bitola}', ${b.d}, ${b.p}, ${b.s}, ${b.k}, NULL, ${b.e}, NULL, NULL, NULL,
      '${JSON.stringify(b.lengths)}'::jsonb,
      '${tols}'::jsonb
    )`);
  }
  await runQuery(`
    INSERT INTO public.standard_dimensions
      (standard_id, bitola, diametro_nominal, passo, chave, altura_cabeca, diametro_cabeca, vertice, diametro_interno, diametro_externo, espessura, comprimentos_validos, tolerancias)
    VALUES ${d933Inserts.join(',\n')}
    ON CONFLICT (standard_id, bitola) DO UPDATE SET
      diametro_nominal = EXCLUDED.diametro_nominal,
      passo = EXCLUDED.passo,
      chave = EXCLUDED.chave,
      altura_cabeca = EXCLUDED.altura_cabeca,
      vertice = EXCLUDED.vertice,
      comprimentos_validos = EXCLUDED.comprimentos_validos,
      tolerancias = EXCLUDED.tolerancias;
  `, 'Seed DIN 933 Dimensions');

  // Insert DIN 931 dimensions
  let d931Inserts = [];
  for (const b of metricBolts) {
    const tols = JSON.stringify({
      diametro: { nominal: b.d, min: b.d - 0.28, max: b.d, instrumento: 'Micrômetro externo digital 0.001mm' },
      chave_s: { nominal: b.s, min: b.s - 0.35, max: b.s, instrumento: 'Paquímetro universal digital' },
      altura_k: { nominal: b.k, min: b.k - 0.25, max: b.k + 0.25, instrumento: 'Paquímetro de profundidade' },
      comprimento_rosca_b: { formula: 'L<=125: 2d+6, L<=200: 2d+12, L>200: 2d+25', instrumento: 'Escala métrica de precisão / Paquímetro' },
      rosca: { classe: '6g', instrumento: 'Calibrador anel rosca 6g' }
    });
    d931Inserts.push(`(
      (SELECT id FROM public.engineering_standards WHERE code = 'DIN 931'),
      '${b.bitola}', ${b.d}, ${b.p}, ${b.s}, ${b.k}, NULL, ${b.e}, NULL, NULL, NULL,
      '${JSON.stringify(b.lengths.filter(l => l >= 30))}'::jsonb,
      '${tols}'::jsonb
    )`);
  }
  await runQuery(`
    INSERT INTO public.standard_dimensions
      (standard_id, bitola, diametro_nominal, passo, chave, altura_cabeca, diametro_cabeca, vertice, diametro_interno, diametro_externo, espessura, comprimentos_validos, tolerancias)
    VALUES ${d931Inserts.join(',\n')}
    ON CONFLICT (standard_id, bitola) DO UPDATE SET
      diametro_nominal = EXCLUDED.diametro_nominal,
      passo = EXCLUDED.passo,
      chave = EXCLUDED.chave,
      altura_cabeca = EXCLUDED.altura_cabeca,
      vertice = EXCLUDED.vertice,
      comprimentos_validos = EXCLUDED.comprimentos_validos,
      tolerancias = EXCLUDED.tolerancias;
  `, 'Seed DIN 931 Dimensions');

  // Insert DIN 912 (Allen socket head)
  const din912Data = [
    { bitola: 'M6',  d: 6,  p: 1.0,  dk: 10, k: 6,  s: 5,  lengths: [10,12,16,20,25,30,35,40,45,50,60,70,80] },
    { bitola: 'M8',  d: 8,  p: 1.25, dk: 13, k: 8,  s: 6,  lengths: [16,20,25,30,35,40,45,50,55,60,70,80,90,100] },
    { bitola: 'M10', d: 10, p: 1.5,  dk: 16, k: 10, s: 8,  lengths: [20,25,30,35,40,45,50,55,60,70,80,90,100,120] },
    { bitola: 'M12', d: 12, p: 1.75, dk: 18, k: 12, s: 10, lengths: [25,30,35,40,45,50,60,70,80,90,100,120,140,150] },
    { bitola: 'M14', d: 14, p: 2.0,  dk: 21, k: 14, s: 12, lengths: [30,35,40,45,50,60,70,80,90,100,120,140,160] },
    { bitola: 'M16', d: 16, p: 2.0,  dk: 24, k: 16, s: 14, lengths: [35,40,45,50,60,70,80,90,100,120,140,160,180,200] },
    { bitola: 'M18', d: 18, p: 2.5,  dk: 27, k: 18, s: 14, lengths: [40,45,50,60,70,80,90,100,120,140,160,180,200] },
    { bitola: 'M20', d: 20, p: 2.5,  dk: 30, k: 20, s: 17, lengths: [45,50,60,70,80,90,100,120,140,160,180,200,220,240] },
    { bitola: 'M22', d: 22, p: 2.5,  dk: 33, k: 22, s: 17, lengths: [50,60,70,80,90,100,120,140,160,180,200,220,240] },
    { bitola: 'M24', d: 24, p: 3.0,  dk: 36, k: 24, s: 19, lengths: [55,60,70,80,90,100,120,140,160,180,200,220,240,260,280,300] },
    { bitola: 'M27', d: 27, p: 3.0,  dk: 40, k: 27, s: 19, lengths: [60,70,80,90,100,120,140,160,180,200,220,240,260,280,300] },
    { bitola: 'M30', d: 30, p: 3.5,  dk: 45, k: 30, s: 22, lengths: [70,80,90,100,120,140,160,180,200,220,240,260,280,300,320,350] },
    { bitola: 'M36', d: 36, p: 4.0,  dk: 54, k: 36, s: 27, lengths: [90,100,120,140,160,180,200,220,240,260,280,300,350,400] }
  ];

  let d912Inserts = [];
  for (const b of din912Data) {
    const tols = JSON.stringify({
      diametro_corpo: { nominal: b.d, min: b.d - 0.22, max: b.d, instrumento: 'Micrômetro 0-25 / 25-50' },
      diametro_cabeca_dk: { nominal: b.dk, min: b.dk - 0.30, max: b.dk, instrumento: 'Paquímetro universal' },
      altura_cabeca_k: { nominal: b.k, min: b.k - 0.25, max: b.k, instrumento: 'Paquímetro digital' },
      chave_allen_s: { nominal: b.s, min: b.s, max: b.s + 0.12, instrumento: 'Calibrador sextavado passa/não-passa' }
    });
    d912Inserts.push(`(
      (SELECT id FROM public.engineering_standards WHERE code = 'DIN 912'),
      '${b.bitola}', ${b.d}, ${b.p}, ${b.s}, ${b.k}, ${b.dk}, NULL, NULL, NULL, NULL,
      '${JSON.stringify(b.lengths)}'::jsonb,
      '${tols}'::jsonb
    )`);
  }
  await runQuery(`
    INSERT INTO public.standard_dimensions
      (standard_id, bitola, diametro_nominal, passo, chave, altura_cabeca, diametro_cabeca, vertice, diametro_interno, diametro_externo, espessura, comprimentos_validos, tolerancias)
    VALUES ${d912Inserts.join(',\n')}
    ON CONFLICT (standard_id, bitola) DO UPDATE SET
      diametro_nominal = EXCLUDED.diametro_nominal,
      passo = EXCLUDED.passo,
      chave = EXCLUDED.chave,
      altura_cabeca = EXCLUDED.altura_cabeca,
      diametro_cabeca = EXCLUDED.diametro_cabeca,
      comprimentos_validos = EXCLUDED.comprimentos_validos,
      tolerancias = EXCLUDED.tolerancias;
  `, 'Seed DIN 912 Dimensions');

  // Insert DIN 934 (Hex Nuts)
  const din934Nuts = [
    { bitola: 'M6',  d: 6,  p: 1.0,  s: 10, m: 5.0,  e: 11.05 },
    { bitola: 'M8',  d: 8,  p: 1.25, s: 13, m: 6.5,  e: 14.38 },
    { bitola: 'M10', d: 10, p: 1.5,  s: 17, m: 8.0,  e: 18.90 },
    { bitola: 'M12', d: 12, p: 1.75, s: 19, m: 10.0, e: 21.10 },
    { bitola: 'M14', d: 14, p: 2.0,  s: 22, m: 11.0, e: 24.49 },
    { bitola: 'M16', d: 16, p: 2.0,  s: 24, m: 13.0, e: 26.75 },
    { bitola: 'M18', d: 18, p: 2.5,  s: 27, m: 15.0, e: 30.14 },
    { bitola: 'M20', d: 20, p: 2.5,  s: 30, m: 16.0, e: 33.53 },
    { bitola: 'M22', d: 22, p: 2.5,  s: 32, m: 18.0, e: 35.72 },
    { bitola: 'M24', d: 24, p: 3.0,  s: 36, m: 19.0, e: 39.98 },
    { bitola: 'M27', d: 27, p: 3.0,  s: 41, m: 22.0, e: 45.63 },
    { bitola: 'M30', d: 30, p: 3.5,  s: 46, m: 24.0, e: 51.28 },
    { bitola: 'M33', d: 33, p: 3.5,  s: 50, m: 26.0, e: 55.80 },
    { bitola: 'M36', d: 36, p: 4.0,  s: 55, m: 29.0, e: 61.31 },
    { bitola: 'M39', d: 39, p: 4.0,  s: 60, m: 31.0, e: 66.96 },
    { bitola: 'M42', d: 42, p: 4.5,  s: 65, m: 34.0, e: 72.61 },
    { bitola: 'M45', d: 45, p: 4.5,  s: 70, m: 36.0, e: 78.26 },
    { bitola: 'M48', d: 48, p: 5.0,  s: 75, m: 38.0, e: 83.91 },
    { bitola: 'M52', d: 52, p: 5.0,  s: 80, m: 42.0, e: 89.56 },
    { bitola: 'M56', d: 56, p: 5.5,  s: 85, m: 45.0, e: 95.21 },
    { bitola: 'M64', d: 64, p: 6.0,  s: 95, m: 51.0, e: 106.51 }
  ];

  let d934Inserts = [];
  for (const n of din934Nuts) {
    const tols = JSON.stringify({
      rosca_interna: { nominal: n.d, passo: n.p, classe: '6H', instrumento: 'Calibrador tampão rosca passa/não-passa' },
      chave_s: { nominal: n.s, min: n.s - 0.35, max: n.s, instrumento: 'Paquímetro universal digital' },
      altura_m: { nominal: n.m, min: n.m - 0.25, max: n.m, instrumento: 'Paquímetro / micrômetro externo' }
    });
    d934Inserts.push(`(
      (SELECT id FROM public.engineering_standards WHERE code = 'DIN 934'),
      '${n.bitola}', ${n.d}, ${n.p}, ${n.s}, ${n.m}, NULL, ${n.e}, NULL, NULL, NULL,
      '[]'::jsonb,
      '${tols}'::jsonb
    )`);
  }
  await runQuery(`
    INSERT INTO public.standard_dimensions
      (standard_id, bitola, diametro_nominal, passo, chave, altura_cabeca, diametro_cabeca, vertice, diametro_interno, diametro_externo, espessura, comprimentos_validos, tolerancias)
    VALUES ${d934Inserts.join(',\n')}
    ON CONFLICT (standard_id, bitola) DO UPDATE SET
      diametro_nominal = EXCLUDED.diametro_nominal,
      passo = EXCLUDED.passo,
      chave = EXCLUDED.chave,
      altura_cabeca = EXCLUDED.altura_cabeca,
      vertice = EXCLUDED.vertice,
      tolerancias = EXCLUDED.tolerancias;
  `, 'Seed DIN 934 Dimensions');

  // Insert DIN 125A (Washers)
  const din125Washers = [
    { bitola: 'M6',  d: 6,  d1: 6.4,  d2: 12.0, s: 1.6 },
    { bitola: 'M8',  d: 8,  d1: 8.4,  d2: 16.0, s: 1.6 },
    { bitola: 'M10', d: 10, d1: 10.5, d2: 20.0, s: 2.0 },
    { bitola: 'M12', d: 12, d1: 13.0, d2: 24.0, s: 2.5 },
    { bitola: 'M14', d: 14, d1: 15.0, d2: 28.0, s: 2.5 },
    { bitola: 'M16', d: 16, d1: 17.0, d2: 30.0, s: 3.0 },
    { bitola: 'M18', d: 18, d1: 19.0, d2: 34.0, s: 3.0 },
    { bitola: 'M20', d: 20, d1: 21.0, d2: 37.0, s: 3.0 },
    { bitola: 'M22', d: 22, d1: 23.0, d2: 39.0, s: 3.0 },
    { bitola: 'M24', d: 24, d1: 25.0, d2: 44.0, s: 4.0 },
    { bitola: 'M27', d: 27, d1: 28.0, d2: 50.0, s: 4.0 },
    { bitola: 'M30', d: 30, d1: 31.0, d2: 56.0, s: 4.0 },
    { bitola: 'M33', d: 33, d1: 34.0, d2: 60.0, s: 5.0 },
    { bitola: 'M36', d: 36, d1: 37.0, d2: 66.0, s: 5.0 },
    { bitola: 'M39', d: 39, d1: 40.0, d2: 72.0, s: 6.0 },
    { bitola: 'M42', d: 42, d1: 43.0, d2: 78.0, s: 7.0 },
    { bitola: 'M48', d: 48, d1: 50.0, d2: 92.0, s: 8.0 },
    { bitola: 'M56', d: 56, d1: 58.0, d2: 105.0, s: 9.0 },
    { bitola: 'M64', d: 64, d1: 66.0, d2: 115.0, s: 9.0 }
  ];

  let d125Inserts = [];
  for (const w of din125Washers) {
    const tols = JSON.stringify({
      diametro_interno_d1: { nominal: w.d1, min: w.d1, max: w.d1 + 0.36, instrumento: 'Paquímetro digital / Tampão liso' },
      diametro_externo_d2: { nominal: w.d2, min: w.d2 - 0.50, max: w.d2, instrumento: 'Paquímetro digital' },
      espessura_s: { nominal: w.s, min: w.s - 0.20, max: w.s + 0.20, instrumento: 'Micrômetro externo' }
    });
    d125Inserts.push(`(
      (SELECT id FROM public.engineering_standards WHERE code = 'DIN 125A'),
      '${w.bitola}', ${w.d}, 0, NULL, NULL, NULL, NULL, ${w.d1}, ${w.d2}, ${w.s},
      '[]'::jsonb,
      '${tols}'::jsonb
    )`);
  }
  await runQuery(`
    INSERT INTO public.standard_dimensions
      (standard_id, bitola, diametro_nominal, passo, chave, altura_cabeca, diametro_cabeca, vertice, diametro_interno, diametro_externo, espessura, comprimentos_validos, tolerancias)
    VALUES ${d125Inserts.join(',\n')}
    ON CONFLICT (standard_id, bitola) DO UPDATE SET
      diametro_nominal = EXCLUDED.diametro_nominal,
      diametro_interno = EXCLUDED.diametro_interno,
      diametro_externo = EXCLUDED.diametro_externo,
      espessura = EXCLUDED.espessura,
      tolerancias = EXCLUDED.tolerancias;
  `, 'Seed DIN 125A Dimensions');

  // Insert DIN 127B (Spring Washers)
  const din127Washers = [
    { bitola: 'M6',  d: 6,  d1: 6.1,  d2: 11.8, s: 1.6 },
    { bitola: 'M8',  d: 8,  d1: 8.1,  d2: 14.8, s: 2.0 },
    { bitola: 'M10', d: 10, d1: 10.2, d2: 18.1, s: 2.2 },
    { bitola: 'M12', d: 12, d1: 12.2, d2: 21.1, s: 2.5 },
    { bitola: 'M14', d: 14, d1: 14.2, d2: 24.1, s: 3.0 },
    { bitola: 'M16', d: 16, d1: 16.2, d2: 27.4, s: 3.5 },
    { bitola: 'M18', d: 18, d1: 18.2, d2: 29.4, s: 3.5 },
    { bitola: 'M20', d: 20, d1: 20.2, d2: 33.6, s: 4.0 },
    { bitola: 'M22', d: 22, d1: 22.5, d2: 35.9, s: 4.0 },
    { bitola: 'M24', d: 24, d1: 24.5, d2: 40.0, s: 5.0 },
    { bitola: 'M27', d: 27, d1: 27.5, d2: 43.0, s: 5.0 },
    { bitola: 'M30', d: 30, d1: 30.5, d2: 48.2, s: 6.0 },
    { bitola: 'M36', d: 36, d1: 36.5, d2: 60.0, s: 7.0 }
  ];

  let d127Inserts = [];
  for (const w of din127Washers) {
    const tols = JSON.stringify({
      diametro_interno_d1: { nominal: w.d1, min: w.d1, max: w.d1 + 0.30, instrumento: 'Paquímetro digital / Tampão liso' },
      diametro_externo_d2: { nominal: w.d2, min: w.d2 - 0.40, max: w.d2, instrumento: 'Paquímetro digital' },
      espessura_s: { nominal: w.s, min: w.s - 0.15, max: w.s + 0.15, instrumento: 'Micrômetro externo' }
    });
    d127Inserts.push(`(
      (SELECT id FROM public.engineering_standards WHERE code = 'DIN 127B'),
      '${w.bitola}', ${w.d}, 0, NULL, NULL, NULL, NULL, ${w.d1}, ${w.d2}, ${w.s},
      '[]'::jsonb,
      '${tols}'::jsonb
    )`);
  }
  await runQuery(`
    INSERT INTO public.standard_dimensions
      (standard_id, bitola, diametro_nominal, passo, chave, altura_cabeca, diametro_cabeca, vertice, diametro_interno, diametro_externo, espessura, comprimentos_validos, tolerancias)
    VALUES ${d127Inserts.join(',\n')}
    ON CONFLICT (standard_id, bitola) DO UPDATE SET
      diametro_nominal = EXCLUDED.diametro_nominal,
      diametro_interno = EXCLUDED.diametro_interno,
      diametro_externo = EXCLUDED.diametro_externo,
      espessura = EXCLUDED.espessura,
      tolerancias = EXCLUDED.tolerancias;
  `, 'Seed DIN 127B Dimensions');

  console.log('🎉 Standard Engineering Matrices successfully seeded into Supabase!');
}

main().catch(console.error);
