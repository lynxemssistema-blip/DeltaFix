// src/lib/calculators/weight-calculator.ts - Physical-mathematical weight and material yield calculation engine
import { BaseMaterial, StandardFamily, StandardDimension } from '../standards/types';
import { calculateDIN931ThreadLength, calculateDIN912ThreadLength } from '../standards/din-data';

export interface WeightCalculationResult {
  pesoLiquidoKg: number;
  pesoBrutoKg: number;
  fatorPerdaPercentual: number;
  pesoMilheiroLiquidoKg: number;
  pesoMilheiroBrutoKg: number;
  pecasPorTonelada: number;
  comprimentoRoscaB: number;
  detalhesVolume: {
    volumeLiquidoMm3: number;
    volumeBrutoMm3: number;
    densidadeKgMm3: number;
  };
}

export function getMaterialDensityKgMm3(material: BaseMaterial): number {
  // Density in g/cm3 converted to kg/mm3 (divide by 1,000,000)
  if (material.includes('Inoxidável')) {
    return 0.00000793; // 7.93 g/cm3
  }
  if (material.includes('Latão')) {
    return 0.00000850; // 8.50 g/cm3
  }
  // Default carbon/alloy steel (SAE 1020, 1045, 4140, 4340)
  return 0.00000785; // 7.85 g/cm3
}

export function calculateFastenerWeight(params: {
  family: StandardFamily;
  standardCode: string; // 'DIN 933', 'DIN 931', 'DIN 912', 'DIN 934', 'DIN 125A', 'DIN 127B'
  dimension: StandardDimension;
  comprimento?: number; // L in mm
  material: BaseMaterial;
  sobremetalCorte?: number; // Sobremetal paramétrico em mm
}): WeightCalculationResult {
  const { family, standardCode, dimension, material } = params;
  const L = params.comprimento || 50;
  const allowance = typeof params.sobremetalCorte === 'number' ? params.sobremetalCorte : 5.0;
  const rho = getMaterialDensityKgMm3(material);
  const d = dimension.diametro_nominal;
  const P = dimension.passo || 1.0;

  let volLiquidoMm3 = 0;
  let volBrutoMm3 = 0;
  let b = L;

  // Effective tensile stress area diameter / core diameter
  // As = (pi / 4) * (d - 0.9382 * P)^2
  const dEff = Math.max(d - 0.9382 * P, 1);
  const threadArea = (Math.PI / 4) * Math.pow(dEff, 2);
  const shankArea = (Math.PI / 4) * Math.pow(d, 2);

  if (family === 'parafuso') {
    const s = dimension.chave || d * 1.5;
    const k = dimension.altura_cabeca || d * 0.65;

    // Hexagonal area: (sqrt(3)/2) * s^2 approx 0.866025 * s^2
    const hexArea = 0.8660254 * Math.pow(s, 2);

    if (standardCode === 'DIN 933') {
      // Hex full thread
      b = L;
      const headVol = hexArea * k * 0.96; // 4% reduction for head chamfer
      const shankVol = threadArea * L;
      volLiquidoMm3 = headVol + shankVol;

      // Raw material: Hex bar cut length = L + k + allowance (kerf + facing)
      const rawCutLength = L + k + allowance;
      volBrutoMm3 = hexArea * rawCutLength;
    } else if (standardCode === 'DIN 931') {
      // Hex partial thread
      b = calculateDIN931ThreadLength(d, L);
      const headVol = hexArea * k * 0.96;
      const smoothLength = Math.max(L - b, 0);
      const smoothVol = shankArea * smoothLength;
      const threadVol = threadArea * b;
      volLiquidoMm3 = headVol + smoothVol + threadVol;

      const rawCutLength = L + k + allowance;
      volBrutoMm3 = hexArea * rawCutLength;
    } else if (standardCode === 'DIN 912' || standardCode.includes('7991')) {
      // Socket head cap screw (Allen) or countersunk
      const dk = dimension.diametro_cabeca || d * 1.5;
      b = calculateDIN912ThreadLength(d, L);
      const headCylinderVol = (Math.PI / 4) * Math.pow(dk, 2) * k;
      const socketDepth = 0.55 * k;
      const socketHexArea = 0.8660254 * Math.pow(s, 2);
      const socketVol = socketHexArea * socketDepth;
      const netHeadVol = Math.max(headCylinderVol - socketVol, 0);

      const smoothLength = Math.max(L - b, 0);
      const smoothVol = shankArea * smoothLength;
      const threadVol = threadArea * b;
      volLiquidoMm3 = netHeadVol + smoothVol + threadVol;

      // Raw round bar of diameter dk
      const rawRoundArea = (Math.PI / 4) * Math.pow(dk + 1.0, 2);
      const rawCutLength = L + k + allowance;
      volBrutoMm3 = rawRoundArea * rawCutLength;
    } else {
      // General bolt / ASTM A325 Heavy Hex
      b = L;
      const headVol = hexArea * k * 0.96;
      const shankVol = threadArea * L;
      volLiquidoMm3 = headVol + shankVol;
      const rawCutLength = L + k + allowance;
      volBrutoMm3 = hexArea * rawCutLength;
    }
  } else if (family === 'prisioneiro' || (family as string) === 'barra_roscada') {
    // Stud bolt / Threaded rod
    b = L;
    volLiquidoMm3 = threadArea * L;
    const rawCutLength = L + allowance;
    volBrutoMm3 = shankArea * rawCutLength;
  } else if (family === 'porca') {
    // Nuts (DIN 934, ASTM A563, DIN 985, etc.)
    const s = dimension.chave || d * 1.5;
    const m = dimension.altura_cabeca || d * 0.8;
    b = 0;

    const hexArea = 0.8660254 * Math.pow(s, 2);
    const hexVol = hexArea * m * 0.95; // Chamfered corners
    // Threaded bore volume
    const boreEffD = Math.max(d - 0.54127 * P, 1);
    const boreVol = (Math.PI / 4) * Math.pow(boreEffD, 2) * m;
    volLiquidoMm3 = Math.max(hexVol - boreVol, 10);

    // Raw hex bar cut per piece = m + parting allowance
    const partAllowance = Math.min(allowance * 0.5, 3.0);
    volBrutoMm3 = hexArea * (m + partAllowance);
  } else if (family === 'arruela') {
    // Washers DIN 125A / DIN 127B / ASTM F436
    const d1 = dimension.diametro_interno || d + 0.4;
    const d2 = dimension.diametro_externo || d * 2;
    const s = dimension.espessura || 2.0;
    b = 0;

    const annularArea = (Math.PI / 4) * (Math.pow(d2, 2) - Math.pow(d1, 2));
    volLiquidoMm3 = annularArea * s;

    // Stamping blank strip footprint: (d2 + 2.5mm bridge) square
    const blankSquareArea = Math.pow(d2 + 2.5, 2);
    volBrutoMm3 = blankSquareArea * s;
  }

  // Weight calculations
  const pesoLiquidoKg = Number((volLiquidoMm3 * rho).toFixed(5));
  const pesoBrutoKg = Number((volBrutoMm3 * rho).toFixed(5));
  const fatorPerdaPercentual =
    pesoBrutoKg > 0
      ? Number((((pesoBrutoKg - pesoLiquidoKg) / pesoBrutoKg) * 100).toFixed(2))
      : 0;

  const pesoMilheiroLiquidoKg = Number((pesoLiquidoKg * 1000).toFixed(2));
  const pesoMilheiroBrutoKg = Number((pesoBrutoKg * 1000).toFixed(2));
  const pecasPorTonelada = pesoLiquidoKg > 0 ? Math.floor(1000 / pesoLiquidoKg) : 0;

  return {
    pesoLiquidoKg,
    pesoBrutoKg,
    fatorPerdaPercentual,
    pesoMilheiroLiquidoKg,
    pesoMilheiroBrutoKg,
    pecasPorTonelada,
    comprimentoRoscaB: b,
    detalhesVolume: {
      volumeLiquidoMm3: Math.round(volLiquidoMm3),
      volumeBrutoMm3: Math.round(volBrutoMm3),
      densidadeKgMm3: rho
    }
  };
}
