// src/lib/standards/din-data.ts - Complete normative DIN matrices and dimensional datasets for DeltaFix
import { EngineeringStandard, StandardDimension } from './types';

export const DIN_STANDARDS: EngineeringStandard[] = [
  {
    id: 'std-din-933',
    code: 'DIN 933',
    family: 'parafuso',
    system: 'metrico',
    description: 'Parafuso sextavado com rosca total métrica grossa (ISO 4017 / NBR ISO 4017)',
    calculation_formulas: { rosca: 'total', formula_b: 'L' }
  },
  {
    id: 'std-din-931',
    code: 'DIN 931',
    family: 'parafuso',
    system: 'metrico',
    description: 'Parafuso sextavado com rosca parcial métrica grossa (ISO 4014 / NBR ISO 4014)',
    calculation_formulas: {
      rosca: 'parcial',
      formula_b: 'L <= 125 ? 2*d + 6 : L <= 200 ? 2*d + 12 : 2*d + 25'
    }
  },
  {
    id: 'std-din-912',
    code: 'DIN 912',
    family: 'parafuso',
    system: 'metrico',
    description: 'Parafuso sextavado interno (Allen) cabeça cilíndrica métrica grossa (ISO 4762)',
    calculation_formulas: {
      rosca: 'parcial_ou_total',
      formula_b: 'L <= 125 ? 2*d + 12 : 2*d + 18'
    }
  },
  {
    id: 'std-din-934',
    code: 'DIN 934',
    family: 'porca',
    system: 'metrico',
    description: 'Porca sextavada métrica padrão (ISO 4032 / NBR ISO 4032)',
    calculation_formulas: { tipo: 'porca_padrao' }
  },
  {
    id: 'std-din-125a',
    code: 'DIN 125A',
    family: 'arruela',
    system: 'metrico',
    description: 'Arruela lisa métrica sem chanfro Forma A (ISO 7089)',
    calculation_formulas: { tipo: 'arruela_lisa' }
  },
  {
    id: 'std-din-127b',
    code: 'DIN 127B',
    family: 'arruela',
    system: 'metrico',
    description: 'Arruela de pressão helicoidal com pontas retangulares Forma B',
    calculation_formulas: { tipo: 'pressao_helicoidal' }
  }
];

// Helper to compute standard thread length b according to DIN 931
export function calculateDIN931ThreadLength(d: number, L: number): number {
  let b = 0;
  if (L <= 125) {
    b = 2 * d + 6;
  } else if (L <= 200) {
    b = 2 * d + 12;
  } else {
    b = 2 * d + 25;
  }
  return Math.min(b, L);
}

// Helper to compute standard thread length b for DIN 912 (socket head)
export function calculateDIN912ThreadLength(d: number, L: number): number {
  if (L <= 30) return L; // Often fully threaded for short lengths
  let b = 0;
  if (L <= 125) {
    b = 2 * d + 12;
  } else {
    b = 2 * d + 18;
  }
  return Math.min(b, L);
}

// Full bolt nominal array (M6 to M64)
const BOLT_DATA: Array<{
  bitola: string;
  d: number;
  p: number;
  s: number;
  k: number;
  e: number;
  lengths: number[];
}> = [
  { bitola: 'M6',  d: 6,  p: 1.0,  s: 10, k: 4.0,  e: 11.05, lengths: [10, 12, 16, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80] },
  { bitola: 'M8',  d: 8,  p: 1.25, s: 13, k: 5.3,  e: 14.38, lengths: [16, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 80, 90, 100] },
  { bitola: 'M10', d: 10, p: 1.5,  s: 17, k: 6.4,  e: 18.90, lengths: [20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 80, 90, 100, 110, 120] },
  { bitola: 'M12', d: 12, p: 1.75, s: 19, k: 7.5,  e: 21.10, lengths: [25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 80, 90, 100, 110, 120, 130, 140, 150] },
  { bitola: 'M14', d: 14, p: 2.0,  s: 22, k: 8.8,  e: 24.49, lengths: [30, 35, 40, 45, 50, 55, 60, 65, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160] },
  { bitola: 'M16', d: 16, p: 2.0,  s: 24, k: 10.0, e: 26.75, lengths: [35, 40, 45, 50, 55, 60, 65, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 180, 200] },
  { bitola: 'M18', d: 18, p: 2.5,  s: 27, k: 11.5, e: 30.14, lengths: [40, 45, 50, 55, 60, 65, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 180, 200, 220] },
  { bitola: 'M20', d: 20, p: 2.5,  s: 30, k: 12.5, e: 33.53, lengths: [45, 50, 55, 60, 65, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 180, 200, 220, 240, 260] },
  { bitola: 'M22', d: 22, p: 2.5,  s: 32, k: 14.0, e: 35.72, lengths: [50, 55, 60, 65, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 180, 200, 220, 240, 260, 280] },
  { bitola: 'M24', d: 24, p: 3.0,  s: 36, k: 15.0, e: 39.98, lengths: [55, 60, 65, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 180, 200, 220, 240, 260, 280, 300] },
  { bitola: 'M27', d: 27, p: 3.0,  s: 41, k: 17.0, e: 45.63, lengths: [60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 180, 200, 220, 240, 260, 280, 300, 320] },
  { bitola: 'M30', d: 30, p: 3.5,  s: 46, k: 18.7, e: 51.28, lengths: [70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 180, 200, 220, 240, 260, 280, 300, 320, 350, 400] },
  { bitola: 'M33', d: 33, p: 3.5,  s: 50, k: 21.0, e: 55.80, lengths: [80, 90, 100, 110, 120, 130, 140, 150, 160, 180, 200, 220, 240, 260, 280, 300, 350, 400] },
  { bitola: 'M36', d: 36, p: 4.0,  s: 55, k: 22.5, e: 61.31, lengths: [90, 100, 110, 120, 130, 140, 150, 160, 180, 200, 220, 240, 260, 280, 300, 350, 400, 450] },
  { bitola: 'M39', d: 39, p: 4.0,  s: 60, k: 25.0, e: 66.96, lengths: [100, 110, 120, 130, 140, 150, 160, 180, 200, 220, 240, 260, 280, 300, 350, 400, 450, 500] },
  { bitola: 'M42', d: 42, p: 4.5,  s: 65, k: 26.0, e: 72.61, lengths: [100, 120, 130, 140, 150, 160, 180, 200, 220, 240, 260, 280, 300, 350, 400, 450, 500] },
  { bitola: 'M45', d: 45, p: 4.5,  s: 70, k: 28.0, e: 78.26, lengths: [110, 120, 140, 150, 160, 180, 200, 220, 240, 260, 280, 300, 350, 400, 450, 500] },
  { bitola: 'M48', d: 48, p: 5.0,  s: 75, k: 30.0, e: 83.91, lengths: [120, 140, 150, 160, 180, 200, 220, 240, 260, 280, 300, 350, 400, 450, 500, 550, 600] },
  { bitola: 'M52', d: 52, p: 5.0,  s: 80, k: 33.0, e: 89.56, lengths: [130, 140, 160, 180, 200, 220, 240, 260, 280, 300, 350, 400, 450, 500, 550, 600] },
  { bitola: 'M56', d: 56, p: 5.5,  s: 85, k: 35.0, e: 95.21, lengths: [140, 160, 180, 200, 220, 240, 260, 280, 300, 350, 400, 450, 500, 550, 600] },
  { bitola: 'M64', d: 64, p: 6.0,  s: 95, k: 40.0, e: 106.51, lengths: [160, 180, 200, 220, 240, 260, 280, 300, 350, 400, 450, 500, 550, 600] }
];

export const DIMENSIONS_MAP: Record<string, Record<string, StandardDimension>> = {
  'DIN 933': {},
  'DIN 931': {},
  'DIN 912': {},
  'DIN 934': {},
  'DIN 125A': {},
  'DIN 127B': {}
};

// Populate DIN 933
for (const b of BOLT_DATA) {
  DIMENSIONS_MAP['DIN 933'][b.bitola] = {
    bitola: b.bitola,
    diametro_nominal: b.d,
    passo: b.p,
    chave: b.s,
    altura_cabeca: b.k,
    vertice: b.e,
    comprimentos_validos: b.lengths,
    tolerancias: {
      diametro: { nominal: b.d, min: Number((b.d - 0.28).toFixed(3)), max: b.d, instrumento: 'Micrômetro externo digital 0.001mm', observacao: 'Tolerância dimensional h13 no corpo' },
      chave_s: { nominal: b.s, min: Number((b.s - 0.35).toFixed(3)), max: b.s, instrumento: 'Paquímetro universal digital Mitutoyo', observacao: 'Afastamento h13 para largura sextavada' },
      altura_k: { nominal: b.k, min: Number((b.k - 0.25).toFixed(3)), max: Number((b.k + 0.25).toFixed(3)), instrumento: 'Paquímetro de profundidade / relógio apalpador', observacao: 'Tolerância js15' },
      rosca: { nominal: b.d, classe: '6g', instrumento: 'Calibrador anel passa/não-passa', observacao: 'Rosca métrica ISO 965-2' }
    }
  };
}

// Populate DIN 931
for (const b of BOLT_DATA) {
  DIMENSIONS_MAP['DIN 931'][b.bitola] = {
    bitola: b.bitola,
    diametro_nominal: b.d,
    passo: b.p,
    chave: b.s,
    altura_cabeca: b.k,
    vertice: b.e,
    comprimentos_validos: b.lengths.filter((l) => l >= 30),
    tolerancias: {
      diametro: { nominal: b.d, min: Number((b.d - 0.28).toFixed(3)), max: b.d, instrumento: 'Micrômetro externo digital 0.001mm', observacao: 'Tolerância h13' },
      chave_s: { nominal: b.s, min: Number((b.s - 0.35).toFixed(3)), max: b.s, instrumento: 'Paquímetro universal digital', observacao: 'Afastamento h13' },
      altura_k: { nominal: b.k, min: Number((b.k - 0.25).toFixed(3)), max: Number((b.k + 0.25).toFixed(3)), instrumento: 'Paquímetro de profundidade', observacao: 'Tolerância js15' },
      comprimento_rosca_b: { nominal: 0, formula: 'L<=125: 2d+6, L<=200: 2d+12, L>200: 2d+25', instrumento: 'Escala métrica de precisão / Paquímetro', observacao: 'Comprimento mínimo de rosca útil' },
      rosca: { nominal: b.d, classe: '6g', instrumento: 'Calibrador anel rosca 6g', observacao: 'Conforme ISO 965' }
    }
  };
}

// Populate DIN 912
const ALLEN_DATA = [
  { bitola: 'M6',  d: 6,  p: 1.0,  dk: 10, k: 6,  s: 5,  lengths: [10, 12, 16, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80] },
  { bitola: 'M8',  d: 8,  p: 1.25, dk: 13, k: 8,  s: 6,  lengths: [16, 20, 25, 30, 35, 40, 45, 50, 55, 60, 70, 80, 90, 100] },
  { bitola: 'M10', d: 10, p: 1.5,  dk: 16, k: 10, s: 8,  lengths: [20, 25, 30, 35, 40, 45, 50, 55, 60, 70, 80, 90, 100, 120] },
  { bitola: 'M12', d: 12, p: 1.75, dk: 18, k: 12, s: 10, lengths: [25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100, 120, 140, 150] },
  { bitola: 'M14', d: 14, p: 2.0,  dk: 21, k: 14, s: 12, lengths: [30, 35, 40, 45, 50, 60, 70, 80, 90, 100, 120, 140, 160] },
  { bitola: 'M16', d: 16, p: 2.0,  dk: 24, k: 16, s: 14, lengths: [35, 40, 45, 50, 60, 70, 80, 90, 100, 120, 140, 160, 180, 200] },
  { bitola: 'M18', d: 18, p: 2.5,  dk: 27, k: 18, s: 14, lengths: [40, 45, 50, 60, 70, 80, 90, 100, 120, 140, 160, 180, 200] },
  { bitola: 'M20', d: 20, p: 2.5,  dk: 30, k: 20, s: 17, lengths: [45, 50, 60, 70, 80, 90, 100, 120, 140, 160, 180, 200, 220, 240] },
  { bitola: 'M22', d: 22, p: 2.5,  dk: 33, k: 22, s: 17, lengths: [50, 60, 70, 80, 90, 100, 120, 140, 160, 180, 200, 220, 240] },
  { bitola: 'M24', d: 24, p: 3.0,  dk: 36, k: 24, s: 19, lengths: [55, 60, 70, 80, 90, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300] },
  { bitola: 'M27', d: 27, p: 3.0,  dk: 40, k: 27, s: 19, lengths: [60, 70, 80, 90, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300] },
  { bitola: 'M30', d: 30, p: 3.5,  dk: 45, k: 30, s: 22, lengths: [70, 80, 90, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300, 320, 350] },
  { bitola: 'M36', d: 36, p: 4.0,  dk: 54, k: 36, s: 27, lengths: [90, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300, 350, 400] }
];

for (const a of ALLEN_DATA) {
  DIMENSIONS_MAP['DIN 912'][a.bitola] = {
    bitola: a.bitola,
    diametro_nominal: a.d,
    passo: a.p,
    chave: a.s,
    altura_cabeca: a.k,
    diametro_cabeca: a.dk,
    comprimentos_validos: a.lengths,
    tolerancias: {
      diametro_corpo: { nominal: a.d, min: Number((a.d - 0.22).toFixed(3)), max: a.d, instrumento: 'Micrômetro externo 0.001mm', observacao: 'Tolerância h13' },
      diametro_cabeca_dk: { nominal: a.dk, min: Number((a.dk - 0.30).toFixed(3)), max: a.dk, instrumento: 'Paquímetro universal digital', observacao: 'Tolerância h14 na cabeça' },
      altura_cabeca_k: { nominal: a.k, min: Number((a.k - 0.25).toFixed(3)), max: a.k, instrumento: 'Paquímetro de profundidade', observacao: 'Tolerância h14' },
      chave_allen_s: { nominal: a.s, min: a.s, max: Number((a.s + 0.12).toFixed(3)), instrumento: 'Calibrador sextavado passa/não-passa', observacao: 'Sextavado interno ISO' }
    }
  };
}

// Populate DIN 934 (Nuts)
for (const b of BOLT_DATA) {
  const nutHeights: Record<string, number> = {
    M6: 5.0, M8: 6.5, M10: 8.0, M12: 10.0, M14: 11.0, M16: 13.0, M18: 15.0, M20: 16.0,
    M22: 18.0, M24: 19.0, M27: 22.0, M30: 24.0, M33: 26.0, M36: 29.0, M39: 31.0,
    M42: 34.0, M45: 36.0, M48: 38.0, M52: 42.0, M56: 45.0, M64: 51.0
  };
  const m = nutHeights[b.bitola] || (b.d * 0.8);
  DIMENSIONS_MAP['DIN 934'][b.bitola] = {
    bitola: b.bitola,
    diametro_nominal: b.d,
    passo: b.p,
    chave: b.s,
    altura_cabeca: m,
    vertice: b.e,
    comprimentos_validos: [],
    tolerancias: {
      rosca_interna: { nominal: b.d, passo: b.p, classe: '6H', instrumento: 'Calibrador tampão roscado passa/não-passa', observacao: 'Campo de tolerância 6H' },
      chave_s: { nominal: b.s, min: Number((b.s - 0.35).toFixed(3)), max: b.s, instrumento: 'Paquímetro universal digital', observacao: 'Afastamento h13' },
      altura_m: { nominal: m, min: Number((m - 0.25).toFixed(3)), max: m, instrumento: 'Paquímetro / micrômetro externo', observacao: 'Altura nominal da porca' }
    }
  };
}

// Populate DIN 125A (Washers)
const WASHER_125_DATA = [
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

for (const w of WASHER_125_DATA) {
  DIMENSIONS_MAP['DIN 125A'][w.bitola] = {
    bitola: w.bitola,
    diametro_nominal: w.d,
    passo: 0,
    diametro_interno: w.d1,
    diametro_externo: w.d2,
    espessura: w.s,
    comprimentos_validos: [],
    tolerancias: {
      diametro_interno_d1: { nominal: w.d1, min: w.d1, max: Number((w.d1 + 0.36).toFixed(3)), instrumento: 'Paquímetro digital / Tampão liso', observacao: 'Folga normativa H13' },
      diametro_externo_d2: { nominal: w.d2, min: Number((w.d2 - 0.50).toFixed(3)), max: w.d2, instrumento: 'Paquímetro digital', observacao: 'Tolerância h14' },
      espessura_s: { nominal: w.s, min: Number((w.s - 0.20).toFixed(3)), max: Number((w.s + 0.20).toFixed(3)), instrumento: 'Micrômetro externo', observacao: 'Espessura de chapa estampada' }
    }
  };
}

// Populate DIN 127B (Spring Washers)
const WASHER_127_DATA = [
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

for (const w of WASHER_127_DATA) {
  DIMENSIONS_MAP['DIN 127B'][w.bitola] = {
    bitola: w.bitola,
    diametro_nominal: w.d,
    passo: 0,
    diametro_interno: w.d1,
    diametro_externo: w.d2,
    espessura: w.s,
    comprimentos_validos: [],
    tolerancias: {
      diametro_interno_d1: { nominal: w.d1, min: w.d1, max: Number((w.d1 + 0.30).toFixed(3)), instrumento: 'Paquímetro digital / Tampão liso', observacao: 'Furo interno helicoidal' },
      diametro_externo_d2: { nominal: w.d2, min: Number((w.d2 - 0.40).toFixed(3)), max: w.d2, instrumento: 'Paquímetro digital', observacao: 'Diâmetro externo total' },
      espessura_s: { nominal: w.s, min: Number((w.s - 0.15).toFixed(3)), max: Number((w.s + 0.15).toFixed(3)), instrumento: 'Micrômetro externo', observacao: 'Espessura da seção' }
    }
  };
}
