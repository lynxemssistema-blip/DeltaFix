// src/app/api/ai/suggest-standard/route.ts - AI-Powered Fastener Technical Standard Matrix Generator
import { NextRequest, NextResponse } from 'next/server';

const VPS_AI_BASE_URL = process.env.VPS_AI_URL || 'http://85.31.60.68:11434';
const VPS_AI_TOKEN = process.env.VPS_AI_TOKEN || 'lynx-vps-ollama-secure-2025';

// Pre-indexed expert matrices for immediate lightning-fast response for common standards
const PRESET_STANDARDS: Record<string, any> = {
  'ABNT NBR 10115': {
    code: 'ABNT NBR 10115',
    family: 'parafuso',
    system: 'metrico',
    description: 'Parafusos de Cabeça Sextavada - Grau de Produto C (Rosca Grossa M5 a M48 - ABNT/ISO 4016/DIN 601)',
    geometric_archetype: 'hex_bolt',
    cad_conception: {
      cad_title: 'Parafuso Sextavado Médio / Grau C (ISO 4016 / DIN 601 / ABNT NBR 10115)',
      projection_2d: 'Vista principal longitudinal com linha de centro frontal contínua. Cabeça sextavada com chanfro superior de 30° a 15° e raio sob a cabeça r = 0.4 a 1.2 mm. Haste com transição de rosca em crista espessa e ponta chanfrada a 45° (z).',
      isometric_3d: 'Projeção axonométrica isométrica 30° com 3 facetas visíveis da cabeça sextavada, colar de assentamento cilíndrico e corpo com hachura helicoidal 3D.',
      dimensioning_rules: 'Cotas principais: Altura da cabeça (k), Comprimento da haste (L), Comprimento de rosca (b), Diâmetro nominal (d) e Cota de Corte do Tarugo Bruto L_tarugo = (k + L) + sobremetal.',
      raw_envelope_formula: 'L_tarugo = (k + L) + sobremetal',
      thread_formula: 'L <= 125: b = 2d + 6; 125 < L <= 200: b = 2d + 12; L > 200: b = 2d + 25',
      notes: 'Norma Brasileira ABNT NBR 10115 Grau C. Aço carbono classes 4.6, 4.8 e 8.8. Roscas métricas ISO passo grosso.'
    },
    calculation_formulas: {
      formula_b: 'Para L <= 125: b = 2d + 6; Para 125 < L <= 200: b = 2d + 12; Para L > 200: b = 2d + 25',
      head_type: 'hex_standard',
      notes: 'Norma Brasileira ABNT NBR 10115 (Grau de Produto C, equivalente à ISO 4016 e DIN 601).'
    },
    dimensions: [
      { bitola: 'M5',  diametro_nominal: 5,  passo: 0.8,  chave: 8,  altura_cabeca: 3.5,  vertice: 8.87,  diametro_assentamento: 7.5,  comprimentos_validos: [16, 20, 25, 30, 35, 40, 45, 50] },
      { bitola: 'M6',  diametro_nominal: 6,  passo: 1.0,  chave: 10, altura_cabeca: 4.0,  vertice: 11.05, diametro_assentamento: 9.5,  comprimentos_validos: [16, 20, 25, 30, 35, 40, 45, 50, 60] },
      { bitola: 'M8',  diametro_nominal: 8,  passo: 1.25, chave: 13, altura_cabeca: 5.3,  vertice: 14.38, diametro_assentamento: 12.5, comprimentos_validos: [20, 25, 30, 35, 40, 45, 50, 60, 70, 80] },
      { bitola: 'M10', diametro_nominal: 10, passo: 1.5,  chave: 16, altura_cabeca: 6.4,  vertice: 17.77, diametro_assentamento: 15.5, comprimentos_validos: [25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100] },
      { bitola: 'M12', diametro_nominal: 12, passo: 1.75, chave: 18, altura_cabeca: 7.5,  vertice: 20.03, diametro_assentamento: 17.5, comprimentos_validos: [30, 35, 40, 45, 50, 60, 70, 80, 90, 100, 120] },
      { bitola: 'M14', diametro_nominal: 14, passo: 2.0,  chave: 21, altura_cabeca: 8.8,  vertice: 23.35, diametro_assentamento: 20.5, comprimentos_validos: [35, 40, 45, 50, 60, 70, 80, 90, 100, 120, 140] },
      { bitola: 'M16', diametro_nominal: 16, passo: 2.0,  chave: 24, altura_cabeca: 10.0, vertice: 26.75, diametro_assentamento: 23.5, comprimentos_validos: [40, 45, 50, 60, 70, 80, 90, 100, 120, 140, 160] },
      { bitola: 'M18', diametro_nominal: 18, passo: 2.5,  chave: 27, altura_cabeca: 11.5, vertice: 30.14, diametro_assentamento: 26.5, comprimentos_validos: [45, 50, 60, 70, 80, 90, 100, 120, 140, 160, 180] },
      { bitola: 'M20', diametro_nominal: 20, passo: 2.5,  chave: 30, altura_cabeca: 12.5, vertice: 33.53, diametro_assentamento: 29.5, comprimentos_validos: [50, 60, 70, 80, 90, 100, 120, 140, 160, 180, 200] },
      { bitola: 'M22', diametro_nominal: 22, passo: 2.5,  chave: 34, altura_cabeca: 14.0, vertice: 37.72, diametro_assentamento: 33.5, comprimentos_validos: [55, 60, 70, 80, 90, 100, 120, 140, 160, 180, 200, 220] },
      { bitola: 'M24', diametro_nominal: 24, passo: 3.0,  chave: 36, altura_cabeca: 15.0, vertice: 39.98, diametro_assentamento: 35.5, comprimentos_validos: [60, 70, 80, 90, 100, 120, 140, 160, 180, 200, 220, 240] },
      { bitola: 'M27', diametro_nominal: 27, passo: 3.0,  chave: 41, altura_cabeca: 17.0, vertice: 45.63, diametro_assentamento: 40.5, comprimentos_validos: [70, 80, 90, 100, 120, 140, 160, 180, 200, 220, 240, 260] },
      { bitola: 'M30', diametro_nominal: 30, passo: 3.5,  chave: 46, altura_cabeca: 18.7, vertice: 51.28, diametro_assentamento: 45.5, comprimentos_validos: [80, 90, 100, 120, 140, 160, 180, 200, 220, 240, 260, 300] },
      { bitola: 'M33', diametro_nominal: 33, passo: 3.5,  chave: 50, altura_cabeca: 21.0, vertice: 55.80, diametro_assentamento: 49.5, comprimentos_validos: [90, 100, 120, 140, 160, 180, 200, 220, 240, 260, 300, 320] },
      { bitola: 'M36', diametro_nominal: 36, passo: 4.0,  chave: 55, altura_cabeca: 22.5, vertice: 61.31, diametro_assentamento: 54.5, comprimentos_validos: [90, 100, 120, 140, 160, 180, 200, 220, 240, 260, 300, 350] },
      { bitola: 'M42', diametro_nominal: 42, passo: 4.5,  chave: 65, altura_cabeca: 26.0, vertice: 72.09, diametro_assentamento: 64.0, comprimentos_validos: [100, 120, 140, 160, 180, 200, 240, 280, 320, 360, 400] },
      { bitola: 'M48', diametro_nominal: 48, passo: 5.0,  chave: 75, altura_cabeca: 30.0, vertice: 83.91, diametro_assentamento: 74.0, comprimentos_validos: [120, 140, 160, 180, 200, 240, 280, 320, 360, 400] }
    ]
  },
  'ASTM A325': {
    code: 'ASTM A325',
    family: 'parafuso',
    system: 'polegada',
    description: 'Parafuso Estrutural Sextavado Pesado de Alta Resistência Mecânica (Heavy Hex Structural Bolt - ASTM F3125 Grade A325)',
    geometric_archetype: 'heavy_hex_bolt',
    cad_conception: {
      cad_title: 'Parafuso Sextavado Pesado Estrutural (ASTM A325 / F3125 / ASME B18.2.6)',
      projection_2d: 'Cabeça Heavy Hex com chave sobredimensionada (s maior que parafusos normais). Raio sob a cabeça generoso r = 0.8 a 1.6 mm para evitar concentração de tensões de fadiga. Face de assentamento usinada com ressalto circular dw.',
      isometric_3d: 'Vista axonométrica isométrica 30° com cabeça prismática pesada de cantos vivos chanfrados, marcação de cabeça "A325" em relevo e rosca curta estrutural padronizada.',
      dimensioning_rules: 'Cotas: Chave Heavy Hex (s), Altura (k), Comprimento da haste (L), Rosca curta (b), Tarugo bruto L_tarugo = (k + L) + sobremetal.',
      raw_envelope_formula: 'L_tarugo = (k + L) + sobremetal',
      thread_formula: 'Rosca curta estrutural para não interceptar o plano de cisalhamento da junta estrutural (conforme AISC/RCSC).',
      notes: 'Aço médio carbono ou boro temperado e revenido. Limite de tração mín. 830 MPa (120 ksi).'
    },
    calculation_formulas: {
      formula_b: 'Rosca curta estrutural para juntas por atrito conforme AISC / RCSC',
      head_type: 'heavy_hex',
      notes: 'Tratamento térmico de têmpera e revenimento conforme ASTM F3125/F3125M Grade A325.'
    },
    dimensions: [
      {
        bitola: '1/2"-13',
        diametro_nominal: 12.7,
        passo: 1.954, // 13 TPI
        chave: 22.22, // 7/8"
        altura_cabeca: 7.94, // 5/16"
        vertice: 25.65,
        diametro_assentamento: 21.0,
        comprimentos_validos: [38, 45, 50, 60, 65, 75, 90, 100],
        tolerancias: {
          d: { nominal: 12.7, min: 12.4, max: 12.7, instrumento: 'Micrômetro 0.001mm', observacao: 'Corpo h13' },
          s: { nominal: 22.22, min: 21.8, max: 22.22, instrumento: 'Paquímetro Digital', observacao: 'Chave 7/8"' },
          k: { nominal: 7.94, min: 7.6, max: 8.3, instrumento: 'Paquímetro Digital', observacao: 'Altura Cabeça' }
        }
      },
      {
        bitola: '5/8"-11',
        diametro_nominal: 15.88,
        passo: 2.309, // 11 TPI
        chave: 26.99, // 1.1/16"
        altura_cabeca: 9.92, // 25/64"
        vertice: 31.15,
        diametro_assentamento: 25.8,
        comprimentos_validos: [45, 50, 60, 65, 75, 90, 100, 120],
        tolerancias: {
          d: { nominal: 15.88, min: 15.5, max: 15.88, instrumento: 'Micrômetro 0.001mm', observacao: 'Corpo h13' },
          s: { nominal: 26.99, min: 26.5, max: 26.99, instrumento: 'Paquímetro Digital', observacao: 'Chave 1.1/16"' },
          k: { nominal: 9.92, min: 9.5, max: 10.3, instrumento: 'Paquímetro Digital', observacao: 'Altura Cabeça' }
        }
      },
      {
        bitola: '3/4"-10',
        diametro_nominal: 19.05,
        passo: 2.54, // 10 TPI
        chave: 31.75, // 1.1/4"
        altura_cabeca: 11.91, // 15/32"
        vertice: 36.65,
        diametro_assentamento: 30.5,
        comprimentos_validos: [50, 60, 65, 75, 90, 100, 120, 150],
        tolerancias: {
          d: { nominal: 19.05, min: 18.7, max: 19.05, instrumento: 'Micrômetro 0.001mm', observacao: 'Corpo h13' },
          s: { nominal: 31.75, min: 31.2, max: 31.75, instrumento: 'Paquímetro Digital', observacao: 'Chave 1.1/4"' },
          k: { nominal: 11.91, min: 11.5, max: 12.3, instrumento: 'Paquímetro Digital', observacao: 'Altura Cabeça' }
        }
      },
      {
        bitola: '7/8"-9',
        diametro_nominal: 22.23,
        passo: 2.822, // 9 TPI
        chave: 36.51, // 1.7/16"
        altura_cabeca: 13.89, // 35/64"
        vertice: 42.15,
        diametro_assentamento: 35.0,
        comprimentos_validos: [60, 65, 75, 90, 100, 120, 150, 180],
        tolerancias: {
          d: { nominal: 22.23, min: 21.8, max: 22.23, instrumento: 'Micrômetro 0.001mm', observacao: 'Corpo h13' },
          s: { nominal: 36.51, min: 35.9, max: 36.51, instrumento: 'Paquímetro Digital', observacao: 'Chave 1.7/16"' },
          k: { nominal: 13.89, min: 13.4, max: 14.3, instrumento: 'Paquímetro Digital', observacao: 'Altura Cabeça' }
        }
      },
      {
        bitola: '1"-8',
        diametro_nominal: 25.4,
        passo: 3.175, // 8 TPI
        chave: 41.28, // 1.5/8"
        altura_cabeca: 15.88, // 39/64"
        vertice: 47.65,
        diametro_assentamento: 39.8,
        comprimentos_validos: [65, 75, 90, 100, 120, 150, 180, 200],
        tolerancias: {
          d: { nominal: 25.4, min: 25.0, max: 25.4, instrumento: 'Micrômetro 0.001mm', observacao: 'Corpo h13' },
          s: { nominal: 41.28, min: 40.6, max: 41.28, instrumento: 'Paquímetro Digital', observacao: 'Chave 1.5/8"' },
          k: { nominal: 15.88, min: 15.3, max: 16.3, instrumento: 'Paquímetro Digital', observacao: 'Altura Cabeça' }
        }
      },
      {
        bitola: '1.1/8"-7',
        diametro_nominal: 28.58,
        passo: 3.629, // 7 TPI
        chave: 46.04, // 1.13/16"
        altura_cabeca: 17.86,
        vertice: 53.15,
        diametro_assentamento: 44.5,
        comprimentos_validos: [75, 90, 100, 120, 150, 180, 200, 240]
      },
      {
        bitola: '1.1/4"-7',
        diametro_nominal: 31.75,
        passo: 3.629, // 7 TPI
        chave: 50.80, // 2"
        altura_cabeca: 20.64,
        vertice: 58.65,
        diametro_assentamento: 49.0,
        comprimentos_validos: [90, 100, 120, 150, 180, 200, 240, 280]
      },
      {
        bitola: '1.3/8"-6',
        diametro_nominal: 34.93,
        passo: 4.233, // 6 TPI
        chave: 55.56, // 2.3/16"
        altura_cabeca: 22.62,
        vertice: 64.15,
        diametro_assentamento: 53.5,
        comprimentos_validos: [100, 120, 150, 180, 200, 240, 280, 320]
      },
      {
        bitola: '1.1/2"-6',
        diametro_nominal: 38.10,
        passo: 4.233, // 6 TPI
        chave: 60.32, // 2.3/8"
        altura_cabeca: 25.40,
        vertice: 69.65,
        diametro_assentamento: 58.0,
        comprimentos_validos: [100, 120, 150, 180, 200, 240, 280, 320, 360]
      }
    ]
  },
  'DIN 912': {
    code: 'DIN 912',
    family: 'parafuso',
    system: 'metrico',
    description: 'Parafuso com Cabeça Cilíndrica e Sextavado Interno Allen (Socket Head Cap Screw - ISO 4762)',
    geometric_archetype: 'socket_head_allen',
    cad_conception: {
      cad_title: 'Parafuso Allen Cabeça Cilíndrica (DIN 912 / ISO 4762)',
      projection_2d: 'Cabeça cilíndrica de diâmetro dk e altura k com recartilhado perimétrico. Cavidade interna sextavada de chave s e profundidade t com linhas tracejadas ocultas e espessura remanescente de parede de fundo w = k - t. Raio sob a cabeça r e chanfro z.',
      isometric_3d: 'Vista axonométrica 30° mostrando cavidade 3D hexagonal profunda na face frontal, textura recartilhada na lateral da cabeça e haste roscada.',
      dimensioning_rules: 'Cotas: Diâmetro da cabeça (dk), Altura da cabeça (k), Chave interna (s), Profundidade de encaixe (t), Comprimento (L), Tarugo bruto L_tarugo = (k + L) + sobremetal.',
      raw_envelope_formula: 'L_tarugo = (k + L) + sobremetal',
      thread_formula: 'b = 2d + 12 (para L intermediário) ou rosca total em parafusos curtos.',
      notes: 'Classes de resistência 8.8, 10.9 e 12.9. Aço liga com têmpera e revenimento.'
    },
    calculation_formulas: {
      formula_b: 'Rosca parcial ou total conforme comprimento nominal ISO 4762',
      head_type: 'socket_cylindrical',
      notes: 'Encaixe sextavado interno de alta precisão.'
    },
    dimensions: [
      { bitola: 'M3',  diametro_nominal: 3,  passo: 0.5,  chave: 2.5, altura_cabeca: 3.0,  diametro_cabeca: 5.5,  profundidade_sextavado: 1.3, raio_transicao: 0.2, comprimentos_validos: [8, 10, 12, 16, 20, 25] },
      { bitola: 'M4',  diametro_nominal: 4,  passo: 0.7,  chave: 3.0, altura_cabeca: 4.0,  diametro_cabeca: 7.0,  profundidade_sextavado: 2.0, raio_transicao: 0.3, comprimentos_validos: [10, 12, 16, 20, 25, 30] },
      { bitola: 'M5',  diametro_nominal: 5,  passo: 0.8,  chave: 4.0, altura_cabeca: 5.0,  diametro_cabeca: 8.5,  profundidade_sextavado: 2.5, raio_transicao: 0.3, comprimentos_validos: [12, 16, 20, 25, 30, 35, 40] },
      { bitola: 'M6',  diametro_nominal: 6,  passo: 1.0,  chave: 5.0, altura_cabeca: 6.0,  diametro_cabeca: 10.0, profundidade_sextavado: 3.0, raio_transicao: 0.4, comprimentos_validos: [16, 20, 25, 30, 35, 40, 50] },
      { bitola: 'M8',  diametro_nominal: 8,  passo: 1.25, chave: 6.0, altura_cabeca: 8.0,  diametro_cabeca: 13.0, profundidade_sextavado: 4.0, raio_transicao: 0.6, comprimentos_validos: [20, 25, 30, 35, 40, 45, 50, 60] },
      { bitola: 'M10', diametro_nominal: 10, passo: 1.5,  chave: 8.0, altura_cabeca: 10.0, diametro_cabeca: 16.0, profundidade_sextavado: 5.0, raio_transicao: 0.6, comprimentos_validos: [25, 30, 35, 40, 45, 50, 60, 70, 80] },
      { bitola: 'M12', diametro_nominal: 12, passo: 1.75, chave: 10.0,altura_cabeca: 12.0, diametro_cabeca: 18.0, profundidade_sextavado: 6.0, raio_transicao: 0.8, comprimentos_validos: [30, 35, 40, 45, 50, 60, 70, 80, 90, 100] },
      { bitola: 'M14', diametro_nominal: 14, passo: 2.0,  chave: 12.0,altura_cabeca: 14.0, diametro_cabeca: 21.0, profundidade_sextavado: 7.0, raio_transicao: 0.8, comprimentos_validos: [35, 40, 45, 50, 60, 70, 80, 90, 100, 120] },
      { bitola: 'M16', diametro_nominal: 16, passo: 2.0,  chave: 14.0,altura_cabeca: 16.0, diametro_cabeca: 24.0, profundidade_sextavado: 8.0, raio_transicao: 1.0, comprimentos_validos: [40, 45, 50, 60, 70, 80, 90, 100, 120, 140] },
      { bitola: 'M18', diametro_nominal: 18, passo: 2.5,  chave: 14.0,altura_cabeca: 18.0, diametro_cabeca: 27.0, profundidade_sextavado: 9.0, raio_transicao: 1.0, comprimentos_validos: [45, 50, 60, 70, 80, 90, 100, 120, 140, 160] },
      { bitola: 'M20', diametro_nominal: 20, passo: 2.5,  chave: 17.0,altura_cabeca: 20.0, diametro_cabeca: 30.0, profundidade_sextavado: 10.0,raio_transicao: 1.2, comprimentos_validos: [50, 60, 70, 80, 90, 100, 120, 140, 160, 180, 200] },
      { bitola: 'M24', diametro_nominal: 24, passo: 3.0,  chave: 19.0,altura_cabeca: 24.0, diametro_cabeca: 36.0, profundidade_sextavado: 12.0,raio_transicao: 1.6, comprimentos_validos: [60, 70, 80, 90, 100, 120, 140, 160, 180, 200, 240] },
      { bitola: 'M30', diametro_nominal: 30, passo: 3.5,  chave: 22.0,altura_cabeca: 30.0, diametro_cabeca: 45.0, profundidade_sextavado: 15.5,raio_transicao: 2.0, comprimentos_validos: [80, 90, 100, 120, 140, 160, 180, 200, 240, 280] },
      { bitola: 'M36', diametro_nominal: 36, passo: 4.0,  chave: 27.0,altura_cabeca: 36.0, diametro_cabeca: 54.0, profundidade_sextavado: 19.0,raio_transicao: 2.4, comprimentos_validos: [90, 100, 120, 140, 160, 180, 200, 240, 280, 320] }
    ]
  },
  'DIN 7991': {
    code: 'DIN 7991',
    family: 'parafuso',
    system: 'metrico',
    description: 'Parafuso de Cabeça Escareada com Sextavado Interno (Countersunk Socket Flat Head - ISO 10642)',
    geometric_archetype: 'countersunk_allen',
    cad_conception: {
      cad_title: 'Parafuso Allen Escareado 90° (DIN 7991 / ISO 10642)',
      projection_2d: 'Cabeça cônica plana de ângulo 90° embutida. NOTA CRÍTICA DE PROJEÇÃO: O comprimento nominal L inclui a cabeça cônica (mede da face plana superior até a ponta da haste). Encaixe sextavado interno s e profundidade t.',
      isometric_3d: 'Vista axonométrica 30° mostrando cabeça tronco-cônica 90° com sextavado interno nivelado com a face plana frontal.',
      dimensioning_rules: 'Cotas: Diâmetro maior da cabeça (dk), Ângulo 90°, Comprimento Total (L), Chave (s), Tarugo bruto L_tarugo = L + sobremetal.',
      raw_envelope_formula: 'L_tarugo = L + sobremetal (na norma DIN 7991 L já abrange a cabeça cônica total)',
      thread_formula: 'Rosca total ou parcial conforme ISO 10642.',
      notes: 'Aço liga classes 8.8, 10.9. Não indicado para aplicações de cisalhamento puro.'
    },
    calculation_formulas: {
      formula_b: 'Rosca total ou parcial conforme ISO 10642',
      countersunk_angle: 90,
      notes: 'Cabeça cônica com ângulo de 90°. Encaixe sextavado interno normalizado.'
    },
    dimensions: [
      { bitola: 'M3',  diametro_nominal: 3,  passo: 0.5,  chave: 2.0, altura_cabeca: 1.7,  diametro_cabeca: 6.0,  profundidade_sextavado: 0.95, comprimentos_validos: [8, 10, 12, 16, 20] },
      { bitola: 'M4',  diametro_nominal: 4,  passo: 0.7,  chave: 2.5, altura_cabeca: 2.3,  diametro_cabeca: 8.0,  profundidade_sextavado: 1.55, comprimentos_validos: [10, 12, 16, 20, 25] },
      { bitola: 'M5',  diametro_nominal: 5,  passo: 0.8,  chave: 3.0, altura_cabeca: 2.8,  diametro_cabeca: 10.0, profundidade_sextavado: 1.9,  comprimentos_validos: [12, 16, 20, 25, 30] },
      { bitola: 'M6',  diametro_nominal: 6,  passo: 1.0,  chave: 4.0, altura_cabeca: 3.3,  diametro_cabeca: 12.0, profundidade_sextavado: 2.2,  comprimentos_validos: [16, 20, 25, 30, 35, 40, 50] },
      { bitola: 'M8',  diametro_nominal: 8,  passo: 1.25, chave: 5.0, altura_cabeca: 4.4,  diametro_cabeca: 16.0, profundidade_sextavado: 3.0,  comprimentos_validos: [20, 25, 30, 35, 40, 50, 60] },
      { bitola: 'M10', diametro_nominal: 10, passo: 1.5,  chave: 6.0, altura_cabeca: 5.5,  diametro_cabeca: 20.0, profundidade_sextavado: 3.6,  comprimentos_validos: [25, 30, 35, 40, 50, 60, 70, 80] },
      { bitola: 'M12', diametro_nominal: 12, passo: 1.75, chave: 8.0, altura_cabeca: 6.5,  diametro_cabeca: 24.0, profundidade_sextavado: 4.3,  comprimentos_validos: [30, 35, 40, 50, 60, 70, 80, 100] },
      { bitola: 'M14', diametro_nominal: 14, passo: 2.0,  chave: 10.0,altura_cabeca: 7.0,  diametro_cabeca: 27.0, profundidade_sextavado: 4.8,  comprimentos_validos: [35, 40, 50, 60, 70, 80, 100] },
      { bitola: 'M16', diametro_nominal: 16, passo: 2.0,  chave: 10.0,altura_cabeca: 7.5,  diametro_cabeca: 30.0, profundidade_sextavado: 5.3,  comprimentos_validos: [40, 50, 60, 70, 80, 100, 120] },
      { bitola: 'M20', diametro_nominal: 20, passo: 2.5,  chave: 12.0,altura_cabeca: 8.5,  diametro_cabeca: 36.0, profundidade_sextavado: 5.9,  comprimentos_validos: [50, 60, 70, 80, 100, 120, 140] },
      { bitola: 'M24', diametro_nominal: 24, passo: 3.0,  chave: 14.0,altura_cabeca: 14.0, diametro_cabeca: 39.0, profundidade_sextavado: 7.5,  comprimentos_validos: [60, 70, 80, 100, 120, 140, 160] }
    ]
  },
  'ASTM A193 B7': {
    code: 'ASTM A193 B7',
    family: 'prisioneiro',
    system: 'polegada',
    description: 'Prisioneiro / Barra de Aço Liga Cromo-Molibdênio AISI 4140 para Vasos de Pressão e Alta Temperatura',
    geometric_archetype: 'stud_bolt',
    cad_conception: {
      cad_title: 'Prisioneiro de Alta Resistência para Flanges (ASTM A193 Grade B7 / ASME B16.5)',
      projection_2d: 'Corpo cilíndrico sem cabeça com roscas contínuas em toda a extensão ou extremidades simétricas. Extremidades com chanfros de 45° aprofundados para permitir montagem suave de porcas pesadas ASTM A194 2H sob alta pré-carga.',
      isometric_3d: 'Cilindro roscado contínuo em perspectiva axonométrica 30° com filetes helicoidais e chanfros nas duas pontas.',
      dimensioning_rules: 'Cotas: Comprimento total da barra (L), Diâmetro externo (d), Cota de corte do tarugo bruto L_tarugo = L + sobremetal.',
      raw_envelope_formula: 'L_tarugo = L + sobremetal',
      thread_formula: 'Roscas UNC até 1" e 8-UN para bitolas superiores a 1", passo uniforme.',
      notes: 'Tratamento térmico: têmpera em óleo e revenimento a mín. 593°C (1100°F). Dureza 28-32 HRC.'
    },
    calculation_formulas: {
      formula_b: 'Rosca contínua total ou pontas roscadas simétricas',
      notes: 'Aço liga temperado e revenido. Limite de escoamento mín 720 MPa.'
    },
    dimensions: [
      { bitola: '1/2"-13',  diametro_nominal: 12.7,  passo: 1.954, comprimentos_validos: [65, 75, 90, 100, 120, 150, 200] },
      { bitola: '5/8"-11',  diametro_nominal: 15.88, passo: 2.309, comprimentos_validos: [75, 90, 100, 120, 150, 180, 220] },
      { bitola: '3/4"-10',  diametro_nominal: 19.05, passo: 2.54,  comprimentos_validos: [90, 100, 120, 150, 180, 220, 250, 300] },
      { bitola: '7/8"-9',   diametro_nominal: 22.23, passo: 2.822, comprimentos_validos: [100, 120, 150, 180, 220, 250, 300, 350] },
      { bitola: '1"-8',     diametro_nominal: 25.4,  passo: 3.175, comprimentos_validos: [120, 150, 180, 220, 250, 300, 350, 400] },
      { bitola: '1.1/8"-8', diametro_nominal: 28.58, passo: 3.175, comprimentos_validos: [140, 160, 180, 220, 260, 300, 350, 420] },
      { bitola: '1.1/4"-8', diametro_nominal: 31.75, passo: 3.175, comprimentos_validos: [150, 180, 220, 260, 300, 350, 400, 450] },
      { bitola: '1.3/8"-8', diametro_nominal: 34.93, passo: 3.175, comprimentos_validos: [160, 200, 240, 280, 320, 380, 450, 500] },
      { bitola: '1.1/2"-8', diametro_nominal: 38.10, passo: 3.175, comprimentos_validos: [180, 220, 260, 300, 350, 400, 480, 550] },
      { bitola: '1.3/4"-8', diametro_nominal: 44.45, passo: 3.175, comprimentos_validos: [200, 250, 300, 350, 400, 480, 550, 600] },
      { bitola: '2"-8',     diametro_nominal: 50.80, passo: 3.175, comprimentos_validos: [220, 280, 350, 400, 480, 550, 650, 700] }
    ]
  },
  'DIN 934': {
    code: 'DIN 934',
    family: 'porca',
    system: 'metrico',
    description: 'Porca Sextavada Padrão Métrica (Hexagon Nuts - ISO 4032)',
    geometric_archetype: 'hex_nut',
    cad_conception: {
      cad_title: 'Porca Sextavada Normal (DIN 934 / ISO 4032)',
      projection_2d: 'Vista frontal sextavada com chanfros bilaterais de 15° a 30° e face de assentamento usinada dw. Furo passante rosqueado métrico ISO com linhas finas tracejadas do diâmetro menor e maior.',
      isometric_3d: 'Prisma hexagonal vazado em perspectiva isométrica 30° com rosca interna visível.',
      dimensioning_rules: 'Cotas: Chave (s), Altura da porca (m), Diâmetro nominal de rosca (d), Diâmetro do vértice (e).',
      raw_envelope_formula: 'Estampagem a quente/frio ou usinagem de barra sextavada de chave s',
      notes: 'Classes de resistência 6, 8, 10 e 12. Tratamento térmico de alívio ou têmpera.'
    },
    calculation_formulas: {
      notes: 'Porca sextavada métrica padrão ISO 4032.'
    },
    dimensions: [
      { bitola: 'M3',  diametro_nominal: 3,  passo: 0.5,  chave: 5.5, altura_cabeca: 2.4,  vertice: 6.01,  diametro_assentamento: 5.0 },
      { bitola: 'M4',  diametro_nominal: 4,  passo: 0.7,  chave: 7.0, altura_cabeca: 3.2,  vertice: 7.66,  diametro_assentamento: 6.5 },
      { bitola: 'M5',  diametro_nominal: 5,  passo: 0.8,  chave: 8.0, altura_cabeca: 4.0,  vertice: 8.79,  diametro_assentamento: 7.5 },
      { bitola: 'M6',  diametro_nominal: 6,  passo: 1.0,  chave: 10,  altura_cabeca: 5.0,  vertice: 11.05, diametro_assentamento: 9.5 },
      { bitola: 'M8',  diametro_nominal: 8,  passo: 1.25, chave: 13,  altura_cabeca: 6.5,  vertice: 14.38, diametro_assentamento: 12.5 },
      { bitola: 'M10', diametro_nominal: 10, passo: 1.5,  chave: 17,  altura_cabeca: 8.0,  vertice: 18.90, diametro_assentamento: 16.0 },
      { bitola: 'M12', diametro_nominal: 12, passo: 1.75, chave: 19,  altura_cabeca: 10.0, vertice: 21.10, diametro_assentamento: 18.0 },
      { bitola: 'M14', diametro_nominal: 14, passo: 2.0,  chave: 22,  altura_cabeca: 11.0, vertice: 24.49, diametro_assentamento: 21.0 },
      { bitola: 'M16', diametro_nominal: 16, passo: 2.0,  chave: 24,  altura_cabeca: 13.0, vertice: 26.75, diametro_assentamento: 23.0 },
      { bitola: 'M18', diametro_nominal: 18, passo: 2.5,  chave: 27,  altura_cabeca: 15.0, vertice: 30.14, diametro_assentamento: 26.0 },
      { bitola: 'M20', diametro_nominal: 20, passo: 2.5,  chave: 30,  altura_cabeca: 16.0, vertice: 33.53, diametro_assentamento: 29.0 },
      { bitola: 'M22', diametro_nominal: 22, passo: 2.5,  chave: 32,  altura_cabeca: 18.0, vertice: 35.72, diametro_assentamento: 31.0 },
      { bitola: 'M24', diametro_nominal: 24, passo: 3.0,  chave: 36,  altura_cabeca: 19.0, vertice: 39.98, diametro_assentamento: 35.0 },
      { bitola: 'M27', diametro_nominal: 27, passo: 3.0,  chave: 41,  altura_cabeca: 22.0, vertice: 45.63, diametro_assentamento: 40.0 },
      { bitola: 'M30', diametro_nominal: 30, passo: 3.5,  chave: 46,  altura_cabeca: 24.0, vertice: 51.28, diametro_assentamento: 45.0 },
      { bitola: 'M36', diametro_nominal: 36, passo: 4.0,  chave: 55,  altura_cabeca: 29.0, vertice: 61.31, diametro_assentamento: 54.0 }
    ]
  },
  'DIN 985': {
    code: 'DIN 985',
    family: 'porca',
    system: 'metrico',
    description: 'Porca Sextavada Auto-travante com Anel de Nylon / Poliamida (Prevailing Torque Hex Nut - ISO 10511)',
    geometric_archetype: 'hex_nut',
    cad_conception: {
      cad_title: 'Porca Auto-travante com Inserto Elástico (DIN 985 / ISO 10511)',
      projection_2d: 'Corpo sextavado com colarinho cônico/cilíndrico superior prensado sobre anel de nylon azul ou natural. Altura total h e altura da parte sextavada m.',
      isometric_3d: 'Porca sextavada isométrica 30° com borda superior prensada circularmente retendo o anel elástico interno.',
      dimensioning_rules: 'Cotas: Chave (s), Altura total (h/m), Diâmetro do colarinho, Diâmetro nominal de rosca (d).',
      raw_envelope_formula: 'Usinagem/estampagem de corpo de aço e cravamento posterior do anel não metálico.',
      notes: 'Anel não metálico para torque prevalente antivibração de acordo com ISO 2320.'
    },
    calculation_formulas: {
      notes: 'Anel não metálico de poliamida/nylon para torque de travamento antivibratório.'
    },
    dimensions: [
      { bitola: 'M3',  diametro_nominal: 3,  passo: 0.5,  chave: 5.5, altura_cabeca: 4.0,  vertice: 6.01,  diametro_assentamento: 5.0 },
      { bitola: 'M4',  diametro_nominal: 4,  passo: 0.7,  chave: 7.0, altura_cabeca: 5.0,  vertice: 7.66,  diametro_assentamento: 6.5 },
      { bitola: 'M5',  diametro_nominal: 5,  passo: 0.8,  chave: 8.0, altura_cabeca: 5.0,  vertice: 8.79,  diametro_assentamento: 7.5 },
      { bitola: 'M6',  diametro_nominal: 6,  passo: 1.0,  chave: 10,  altura_cabeca: 6.0,  vertice: 11.05, diametro_assentamento: 9.5 },
      { bitola: 'M8',  diametro_nominal: 8,  passo: 1.25, chave: 13,  altura_cabeca: 8.0,  vertice: 14.38, diametro_assentamento: 12.5 },
      { bitola: 'M10', diametro_nominal: 10, passo: 1.5,  chave: 17,  altura_cabeca: 10.0, vertice: 18.9,  diametro_assentamento: 16.0 },
      { bitola: 'M12', diametro_nominal: 12, passo: 1.75, chave: 19,  altura_cabeca: 12.0, vertice: 21.1,  diametro_assentamento: 18.0 },
      { bitola: 'M14', diametro_nominal: 14, passo: 2.0,  chave: 22,  altura_cabeca: 14.0, vertice: 24.49, diametro_assentamento: 21.0 },
      { bitola: 'M16', diametro_nominal: 16, passo: 2.0,  chave: 24,  altura_cabeca: 16.0, vertice: 26.75, diametro_assentamento: 23.0 },
      { bitola: 'M18', diametro_nominal: 18, passo: 2.5,  chave: 27,  altura_cabeca: 18.5, vertice: 30.14, diametro_assentamento: 26.0 },
      { bitola: 'M20', diametro_nominal: 20, passo: 2.5,  chave: 30,  altura_cabeca: 20.0, vertice: 33.53, diametro_assentamento: 29.0 },
      { bitola: 'M22', diametro_nominal: 22, passo: 2.5,  chave: 32,  altura_cabeca: 22.0, vertice: 35.72, diametro_assentamento: 31.0 },
      { bitola: 'M24', diametro_nominal: 24, passo: 3.0,  chave: 36,  altura_cabeca: 24.0, vertice: 39.98, diametro_assentamento: 35.0 },
      { bitola: 'M27', diametro_nominal: 27, passo: 3.0,  chave: 41,  altura_cabeca: 27.0, vertice: 45.63, diametro_assentamento: 40.0 },
      { bitola: 'M30', diametro_nominal: 30, passo: 3.5,  chave: 46,  altura_cabeca: 30.0, vertice: 51.28, diametro_assentamento: 45.0 }
    ]
  },
  'DIN 125': {
    code: 'DIN 125',
    family: 'arruela',
    system: 'metrico',
    description: 'Arruela Lisa de Formato A / B (Plain Washers - ISO 7089)',
    geometric_archetype: 'washer_plain',
    cad_conception: {
      cad_title: 'Arruela Plana Redonda (DIN 125 / ISO 7089)',
      projection_2d: 'Vista em corte transversal mostrando espessura uniforme s e furo concêntrico d1 com diâmetro externo d2. Chanfro perimétrico de 45° em formato B.',
      isometric_3d: 'Disco plano concêntrico vazado em perspectiva isométrica 30°.',
      dimensioning_rules: 'Cotas: Diâmetro interno (d1), Diâmetro externo (d2), Espessura nominal (s/h).',
      raw_envelope_formula: 'Estampagem de chapa de espessura h com estampo e matriz de corte concêntrico.',
      notes: 'Dureza 140 HV ou 200 HV/300 HV para aço temperado.'
    },
    calculation_formulas: {
      notes: 'Arruela lisa para distribuição uniforme de carga de aperto sob cabeças de parafusos e porcas.'
    },
    dimensions: [
      { bitola: 'M3',  diametro_nominal: 3,  passo: 0.5,  diametro_interno: 3.2,  diametro_externo: 7.0,  espessura: 0.5 },
      { bitola: 'M4',  diametro_nominal: 4,  passo: 0.7,  diametro_interno: 4.3,  diametro_externo: 9.0,  espessura: 0.8 },
      { bitola: 'M5',  diametro_nominal: 5,  passo: 0.8,  diametro_interno: 5.3,  diametro_externo: 10.0, espessura: 1.0 },
      { bitola: 'M6',  diametro_nominal: 6,  passo: 1.0,  diametro_interno: 6.4,  diametro_externo: 12.0, espessura: 1.6 },
      { bitola: 'M8',  diametro_nominal: 8,  passo: 1.25, diametro_interno: 8.4,  diametro_externo: 16.0, espessura: 1.6 },
      { bitola: 'M10', diametro_nominal: 10, passo: 1.5,  diametro_interno: 10.5, diametro_externo: 20.0, espessura: 2.0 },
      { bitola: 'M12', diametro_nominal: 12, passo: 1.75, diametro_interno: 13.0, diametro_externo: 24.0, espessura: 2.5 },
      { bitola: 'M14', diametro_nominal: 14, passo: 2.0,  diametro_interno: 15.0, diametro_externo: 28.0, espessura: 2.5 },
      { bitola: 'M16', diametro_nominal: 16, passo: 2.0,  diametro_interno: 17.0, diametro_externo: 30.0, espessura: 3.0 },
      { bitola: 'M18', diametro_nominal: 18, passo: 2.5,  diametro_interno: 19.0, diametro_externo: 34.0, espessura: 3.0 },
      { bitola: 'M20', diametro_nominal: 20, passo: 2.5,  diametro_interno: 21.0, diametro_externo: 37.0, espessura: 3.0 },
      { bitola: 'M22', diametro_nominal: 22, passo: 2.5,  diametro_interno: 23.0, diametro_externo: 39.0, espessura: 3.0 },
      { bitola: 'M24', diametro_nominal: 24, passo: 3.0,  diametro_interno: 25.0, diametro_externo: 44.0, espessura: 4.0 },
      { bitola: 'M27', diametro_nominal: 27, passo: 3.0,  diametro_interno: 28.0, diametro_externo: 50.0, espessura: 4.0 },
      { bitola: 'M30', diametro_nominal: 30, passo: 3.5,  diametro_interno: 31.0, diametro_externo: 56.0, espessura: 4.0 },
      { bitola: 'M36', diametro_nominal: 36, passo: 4.0,  diametro_interno: 37.0, diametro_externo: 66.0, espessura: 5.0 }
    ]
  },
  'DIN 127': {
    code: 'DIN 127',
    family: 'arruela',
    system: 'metrico',
    description: 'Arruela de Pressão Helicoidal com Pontas Chanfradas ou Retas (Spring Lock Washers)',
    geometric_archetype: 'washer_spring',
    cad_conception: {
      cad_title: 'Arruela de Pressão Helicoidal (DIN 127)',
      projection_2d: 'Anel cortado em espiral aberta com deflexão axial. Pontas cortadas a 45° ou 90° para travamento por penetração elástica.',
      isometric_3d: 'Hélice plana aberta com pontas desencontradas e espessura retangular.',
      dimensioning_rules: 'Cotas: Diâmetro interno (d1), Diâmetro externo (d2), Espessura retangular (s), Altura livre (h).',
      raw_envelope_formula: 'Enrolamento helicoidal de arame trefilado retangular seguido de corte e têmpera.',
      notes: 'Aço mola 65Mn ou SAE 1070 temperado e revenido. Dureza 44-51 HRC.'
    },
    calculation_formulas: {
      notes: 'Arruela de pressão para compensação de relaxamento de tensão em uniões parafusadas.'
    },
    dimensions: [
      { bitola: 'M3',  diametro_nominal: 3,  passo: 0.5,  diametro_interno: 3.1,  diametro_externo: 6.2,  espessura: 0.8 },
      { bitola: 'M4',  diametro_nominal: 4,  passo: 0.7,  diametro_interno: 4.1,  diametro_externo: 7.6,  espessura: 0.9 },
      { bitola: 'M5',  diametro_nominal: 5,  passo: 0.8,  diametro_interno: 5.1,  diametro_externo: 9.2,  espessura: 1.2 },
      { bitola: 'M6',  diametro_nominal: 6,  passo: 1.0,  diametro_interno: 6.1,  diametro_externo: 11.8, espessura: 1.6 },
      { bitola: 'M8',  diametro_nominal: 8,  passo: 1.25, diametro_interno: 8.1,  diametro_externo: 14.8, espessura: 2.0 },
      { bitola: 'M10', diametro_nominal: 10, passo: 1.5,  diametro_interno: 10.2, diametro_externo: 18.1, espessura: 2.2 },
      { bitola: 'M12', diametro_nominal: 12, passo: 1.75, diametro_interno: 12.2, diametro_externo: 21.1, espessura: 2.5 },
      { bitola: 'M16', diametro_nominal: 16, passo: 2.0,  diametro_interno: 16.2, diametro_externo: 27.4, espessura: 3.5 },
      { bitola: 'M20', diametro_nominal: 20, passo: 2.5,  diametro_interno: 20.2, diametro_externo: 33.6, espessura: 4.0 },
      { bitola: 'M24', diametro_nominal: 24, passo: 3.0,  diametro_interno: 24.5, diametro_externo: 40.0, espessura: 5.0 },
      { bitola: 'M30', diametro_nominal: 30, passo: 3.5,  diametro_interno: 30.5, diametro_externo: 48.2, espessura: 6.0 }
    ]
  }
};

export async function POST(req: NextRequest) {
  try {
    const { standardCode, system = 'metrico' } = await req.json();

    if (!standardCode) {
      return NextResponse.json({ error: 'Código da norma é obrigatório.' }, { status: 400 });
    }

    const cleanCode = standardCode.trim().toUpperCase();

    // 1. Check presets first for instantaneous response
    for (const [key, preset] of Object.entries(PRESET_STANDARDS)) {
      if (cleanCode === key.toUpperCase() || cleanCode.includes(key.toUpperCase()) || key.toUpperCase().includes(cleanCode)) {
        return NextResponse.json({
          source: 'preset',
          data: preset
        });
      }
    }

    // 2. Query VPS AI (Ollama)
    const prompt = `Você é um Engenheiro Mecânico Senior Especialista em Normas Técnicas Internacionais de Fixadores Industriais (DIN, ISO, ASTM, ASME, ABNT).
Gere uma especificação técnica e matriz dimensional COMPLETA e RIGOROSA para a norma: "${cleanCode}".
Retorne ESTRITAMENTE um objeto JSON (sem markdown, sem explicações extras) com a seguinte estrutura:
{
  "code": "${cleanCode}",
  "family": "parafuso" | "porca" | "arruela" | "prisioneiro",
  "system": "${cleanCode.includes('ASTM') || cleanCode.includes('ASME') ? 'polegada' : system}",
  "description": "descrição técnica formal de alta precisão em português",
  "geometric_archetype": "hex_bolt" | "heavy_hex_bolt" | "socket_head_allen" | "countersunk_allen" | "stud_bolt" | "hex_nut" | "washer_plain" | "washer_spring",
  "cad_conception": {
    "cad_title": "título técnico do modelo CAD",
    "projection_2d": "descrição técnica detalhada da projeção ortogonal 2D (cabeça, haste, rosca, chanfros, raios)",
    "isometric_3d": "descrição da projeção axonométrica isométrica 30 graus com facetas e representação 3D",
    "dimensioning_rules": "regras de cotas e dimensionamento na folha A3",
    "raw_envelope_formula": "fórmula de corte do tarugo bruto",
    "notes": "notas de usinagem, conformação e tratamento térmico"
  },
  "calculation_formulas": {
    "formula_b": "fórmula técnica de comprimento de rosca",
    "notes": "especificação mecânica e metalúrgica"
  },
  "dimensions": [
    {
      "bitola": "M10 ou 1/2-13",
      "diametro_nominal": 10,
      "passo": 1.5,
      "chave": 16,
      "altura_cabeca": 6.4,
      "diametro_cabeca": 16,
      "vertice": 17.77,
      "diametro_assentamento": 15.5,
      "profundidade_sextavado": 5.0,
      "diametro_interno": 10.5,
      "diametro_externo": 20.0,
      "espessura": 2.0,
      "comprimentos_validos": [25, 30, 40, 50, 60, 80],
      "tolerancias": {
        "d": { "nominal": 10, "min": 9.78, "max": 10.0, "instrumento": "Micrômetro 0.001mm" }
      }
    }
  ]
}
Forneça a tabela dimensional completa com pelo menos 8 a 14 bitolas normalizadas sem deixar campos numéricos nulos ou texto "dk".`;

    try {
      const aiResponse = await fetch(`${VPS_AI_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${VPS_AI_TOKEN}`
        },
        body: JSON.stringify({
          model: 'qwen2.5-coder:1.5b',
          prompt,
          stream: false,
          format: 'json',
          options: {
            temperature: 0.1
          }
        }),
        signal: AbortSignal.timeout(12000)
      });

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        const parsed = JSON.parse(aiData.response);
        return NextResponse.json({
          source: 'vps_ai',
          data: parsed
        });
      }
    } catch (aiErr) {
      console.warn('VPS AI query failed, generating procedural standard matrix:', aiErr);
    }

    // 3. Fallback procedural engineering matrix generator
    const isAstm = cleanCode.includes('ASTM') || cleanCode.includes('ASME');
    const isNut = cleanCode.includes('PORCA') || cleanCode.includes('934') || cleanCode.includes('563') || cleanCode.includes('985');
    const isWasher = cleanCode.includes('ARRUELA') || cleanCode.includes('125') || cleanCode.includes('127') || cleanCode.includes('436');
    const isStud = cleanCode.includes('PRISIONEIRO') || cleanCode.includes('938') || cleanCode.includes('975') || cleanCode.includes('B7');
    const isAllen = cleanCode.includes('912') || cleanCode.includes('ALLEN') || cleanCode.includes('SOCKET');
    const isCountersunk = cleanCode.includes('7991') || cleanCode.includes('ESCAREADO');

    const family = isNut ? 'porca' : isWasher ? 'arruela' : isStud ? 'prisioneiro' : 'parafuso';
    const archetype = isNut
      ? 'hex_nut'
      : isWasher
      ? cleanCode.includes('127') ? 'washer_spring' : 'washer_plain'
      : isStud
      ? 'stud_bolt'
      : isCountersunk
      ? 'countersunk_allen'
      : isAllen
      ? 'socket_head_allen'
      : isAstm
      ? 'heavy_hex_bolt'
      : 'hex_bolt';

    const fallbackData = {
      code: cleanCode,
      family,
      system: isAstm ? 'polegada' : 'metrico',
      description: `Norma Industrial ${cleanCode} (${family.toUpperCase()})`,
      geometric_archetype: archetype,
      cad_conception: {
        cad_title: `Modelo Paramétrico CAD - ${cleanCode}`,
        projection_2d: `Representação técnica ortográfica bidimensional normalizada conforme ABNT NBR ISO 128 para família ${family}.`,
        isometric_3d: 'Visualização axonométrica isométrica a 30 graus com representação volumétrica.',
        dimensioning_rules: 'Cotas principais normalizadas com tolerâncias ISO e controle de corte de tarugo bruto L_tarugo.',
        raw_envelope_formula: archetype === 'countersunk_allen' ? 'L_tarugo = L + sobremetal' : 'L_tarugo = (k + L) + sobremetal',
        notes: 'Fabricação e ensaios mecânicos de acordo com a norma industrial correspondente.'
      },
      calculation_formulas: {
        formula_b: 'Rosca padronizada',
        notes: 'Fabricação conforme especificação técnica industrial.'
      },
      dimensions: isWasher
        ? [
            { bitola: 'M4',  diametro_nominal: 4,  passo: 0.7,  diametro_interno: 4.3,  diametro_externo: 9.0,  espessura: 0.8 },
            { bitola: 'M5',  diametro_nominal: 5,  passo: 0.8,  diametro_interno: 5.3,  diametro_externo: 10.0, espessura: 1.0 },
            { bitola: 'M6',  diametro_nominal: 6,  passo: 1.0,  diametro_interno: 6.4,  diametro_externo: 12.0, espessura: 1.6 },
            { bitola: 'M8',  diametro_nominal: 8,  passo: 1.25, diametro_interno: 8.4,  diametro_externo: 16.0, espessura: 1.6 },
            { bitola: 'M10', diametro_nominal: 10, passo: 1.5,  diametro_interno: 10.5, diametro_externo: 20.0, espessura: 2.0 },
            { bitola: 'M12', diametro_nominal: 12, passo: 1.75, diametro_interno: 13.0, diametro_externo: 24.0, espessura: 2.5 },
            { bitola: 'M16', diametro_nominal: 16, passo: 2.0,  diametro_interno: 17.0, diametro_externo: 30.0, espessura: 3.0 },
            { bitola: 'M20', diametro_nominal: 20, passo: 2.5,  diametro_interno: 21.0, diametro_externo: 37.0, espessura: 3.0 },
            { bitola: 'M24', diametro_nominal: 24, passo: 3.0,  diametro_interno: 25.0, diametro_externo: 44.0, espessura: 4.0 },
            { bitola: 'M30', diametro_nominal: 30, passo: 3.5,  diametro_interno: 31.0, diametro_externo: 56.0, espessura: 4.0 }
          ]
        : isNut
        ? [
            { bitola: 'M6',  diametro_nominal: 6,  passo: 1.0,  chave: 10,  altura_cabeca: 5.0,  vertice: 11.05, diametro_assentamento: 9.5 },
            { bitola: 'M8',  diametro_nominal: 8,  passo: 1.25, chave: 13,  altura_cabeca: 6.5,  vertice: 14.38, diametro_assentamento: 12.5 },
            { bitola: 'M10', diametro_nominal: 10, passo: 1.5,  chave: 17,  altura_cabeca: 8.0,  vertice: 18.90, diametro_assentamento: 16.0 },
            { bitola: 'M12', diametro_nominal: 12, passo: 1.75, chave: 19,  altura_cabeca: 10.0, vertice: 21.10, diametro_assentamento: 18.0 },
            { bitola: 'M16', diametro_nominal: 16, passo: 2.0,  chave: 24,  altura_cabeca: 13.0, vertice: 26.75, diametro_assentamento: 23.0 },
            { bitola: 'M20', diametro_nominal: 20, passo: 2.5,  chave: 30,  altura_cabeca: 16.0, vertice: 33.53, diametro_assentamento: 29.0 },
            { bitola: 'M24', diametro_nominal: 24, passo: 3.0,  chave: 36,  altura_cabeca: 19.0, vertice: 39.98, diametro_assentamento: 35.0 },
            { bitola: 'M30', diametro_nominal: 30, passo: 3.5,  chave: 46,  altura_cabeca: 24.0, vertice: 51.28, diametro_assentamento: 45.0 }
          ]
        : isAstm
        ? [
            { bitola: '1/4"-20',  diametro_nominal: 6.35,  passo: 1.27,  chave: 11.11, altura_cabeca: 4.14,  vertice: 12.83, diametro_assentamento: 10.5, comprimentos_validos: [19, 25, 32, 38, 50, 63] },
            { bitola: '5/16"-18', diametro_nominal: 7.94,  passo: 1.411, chave: 12.7,  altura_cabeca: 5.36,  vertice: 14.67, diametro_assentamento: 12.0, comprimentos_validos: [25, 32, 38, 50, 63, 75] },
            { bitola: '3/8"-16',  diametro_nominal: 9.53,  passo: 1.587, chave: 14.29, altura_cabeca: 6.17,  vertice: 16.5,  diametro_assentamento: 13.5, comprimentos_validos: [25, 32, 38, 50, 63, 75, 90] },
            { bitola: '1/2"-13',  diametro_nominal: 12.7,  passo: 1.954, chave: 19.05, altura_cabeca: 8.13,  vertice: 22.0,  diametro_assentamento: 18.0, comprimentos_validos: [38, 45, 50, 63, 75, 90, 100] },
            { bitola: '5/8"-11',  diametro_nominal: 15.88, passo: 2.309, chave: 23.81, altura_cabeca: 10.16, vertice: 27.5,  diametro_assentamento: 22.5, comprimentos_validos: [45, 50, 63, 75, 90, 100, 120] },
            { bitola: '3/4"-10',  diametro_nominal: 19.05, passo: 2.54,  chave: 28.58, altura_cabeca: 12.19, vertice: 33.0,  diametro_assentamento: 27.0, comprimentos_validos: [50, 63, 75, 90, 100, 120, 150] },
            { bitola: '7/8"-9',   diametro_nominal: 22.23, passo: 2.822, chave: 33.34, altura_cabeca: 14.22, vertice: 38.5,  diametro_assentamento: 31.5, comprimentos_validos: [63, 75, 90, 100, 120, 150, 180] },
            { bitola: '1"-8',     diametro_nominal: 25.4,  passo: 3.175, chave: 38.1,  altura_cabeca: 15.65, vertice: 44.0,  diametro_assentamento: 36.0, comprimentos_validos: [75, 90, 100, 120, 150, 180, 200] },
            { bitola: '1.1/8"-7', diametro_nominal: 28.58, passo: 3.629, chave: 42.86, altura_cabeca: 18.69, vertice: 49.5,  diametro_assentamento: 40.5, comprimentos_validos: [90, 100, 120, 150, 180, 200, 250] },
            { bitola: '1.1/4"-7', diametro_nominal: 31.75, passo: 3.629, chave: 47.63, altura_cabeca: 20.62, vertice: 55.0,  diametro_assentamento: 45.0, comprimentos_validos: [100, 120, 150, 180, 200, 250, 300] }
          ]
        : [
            { bitola: 'M6',  diametro_nominal: 6,  passo: 1.0,  chave: 10, altura_cabeca: 4.0,  vertice: 11.05, diametro_assentamento: 9.5, comprimentos_validos: [16, 20, 25, 30, 35, 40, 45, 50] },
            { bitola: 'M8',  diametro_nominal: 8,  passo: 1.25, chave: 13, altura_cabeca: 5.3,  vertice: 14.38, diametro_assentamento: 12.5, comprimentos_validos: [20, 25, 30, 35, 40, 45, 50, 60, 70] },
            { bitola: 'M10', diametro_nominal: 10, passo: 1.5,  chave: 16, altura_cabeca: 6.4,  vertice: 17.77, diametro_assentamento: 15.5, comprimentos_validos: [25, 30, 35, 40, 45, 50, 60, 70, 80] },
            { bitola: 'M12', diametro_nominal: 12, passo: 1.75, chave: 18, altura_cabeca: 7.5,  vertice: 20.03, diametro_assentamento: 17.5, comprimentos_validos: [30, 35, 40, 50, 60, 70, 80, 90, 100] },
            { bitola: 'M14', diametro_nominal: 14, passo: 2.0,  chave: 21, altura_cabeca: 8.8,  vertice: 23.35, diametro_assentamento: 20.5, comprimentos_validos: [35, 40, 50, 60, 70, 80, 90, 100, 120] },
            { bitola: 'M16', diametro_nominal: 16, passo: 2.0,  chave: 24, altura_cabeca: 10.0, vertice: 26.75, diametro_assentamento: 23.5, comprimentos_validos: [40, 50, 60, 70, 80, 90, 100, 120, 140] },
            { bitola: 'M18', diametro_nominal: 18, passo: 2.5,  chave: 27, altura_cabeca: 11.5, vertice: 30.14, diametro_assentamento: 26.5, comprimentos_validos: [45, 50, 60, 70, 80, 90, 100, 120, 140, 160] },
            { bitola: 'M20', diametro_nominal: 20, passo: 2.5,  chave: 30, altura_cabeca: 12.5, vertice: 33.53, diametro_assentamento: 29.5, comprimentos_validos: [50, 60, 70, 80, 90, 100, 120, 140, 160, 180] },
            { bitola: 'M22', diametro_nominal: 22, passo: 2.5,  chave: 34, altura_cabeca: 14.0, vertice: 37.72, diametro_assentamento: 33.5, comprimentos_validos: [55, 60, 70, 80, 90, 100, 120, 140, 160, 180, 200] },
            { bitola: 'M24', diametro_nominal: 24, passo: 3.0,  chave: 36, altura_cabeca: 15.0, vertice: 39.98, diametro_assentamento: 35.5, comprimentos_validos: [60, 70, 80, 90, 100, 120, 140, 160, 180, 200, 220] },
            { bitola: 'M27', diametro_nominal: 27, passo: 3.0,  chave: 41, altura_cabeca: 17.0, vertice: 45.63, diametro_assentamento: 40.5, comprimentos_validos: [70, 80, 90, 100, 120, 140, 160, 180, 200, 220, 240] },
            { bitola: 'M30', diametro_nominal: 30, passo: 3.5,  chave: 46, altura_cabeca: 18.7, vertice: 51.28, diametro_assentamento: 45.5, comprimentos_validos: [80, 90, 100, 120, 140, 160, 180, 200, 220, 240, 260] },
            { bitola: 'M36', diametro_nominal: 36, passo: 4.0,  chave: 55, altura_cabeca: 22.5, vertice: 61.31, diametro_assentamento: 54.5, comprimentos_validos: [90, 100, 120, 140, 160, 180, 200, 220, 240, 260, 300] }
          ]
    };

    return NextResponse.json({
      source: 'procedural_fallback',
      data: fallbackData
    });
  } catch (err: any) {
    console.error('Error suggesting standard:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
