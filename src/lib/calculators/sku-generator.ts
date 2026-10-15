// src/lib/calculators/sku-generator.ts - Standardized industrial SKU generator for DeltaFix
import { StandardFamily, ResistanceClass, SurfaceFinish } from '../standards/types';

export interface SkuParameters {
  family: StandardFamily;
  standardCode: string; // e.g., 'DIN 933', 'DIN 931', 'DIN 912', 'DIN 934', 'DIN 125A', 'DIN 127B'
  bitola: string; // e.g., 'M30'
  passo?: number; // e.g., 3.5 -> 350
  comprimento?: number; // e.g., 250
  classeResistencia: ResistanceClass; // e.g., '8.8', 'Classe 8', '10.9'
  tratamentoSuperficial: SurfaceFinish; // e.g., 'Zincado Branco (ZB)'
}

export function getFinishCode(finish: SurfaceFinish): string {
  switch (finish) {
    case 'Zincado Branco (ZB)':
      return 'ZB';
    case 'Zincado Amarelo (Bicromatizado)':
      return 'ZA';
    case 'Galvanizado a Fogo (GF)':
      return 'GF';
    case 'Geomet 321 / 500':
      return 'GEO';
    case 'Enegrecido de Têmpera':
      return 'OX';
    case 'Fosfatizado':
      return 'FOS';
    case 'Polido / Oleado':
    default:
      return 'POL';
  }
}

export function getClassCode(classe: ResistanceClass): string {
  switch (classe) {
    case '4.6':
      return '46';
    case '5.8':
      return '58';
    case '8.8':
      return '88';
    case '10.9':
      return '109';
    case '12.9':
      return '129';
    case 'Classe 6':
      return 'CL6';
    case 'Classe 8':
      return 'CL8';
    case 'Classe 10':
      return 'CL10';
    case 'Classe 12':
      return 'CL12';
    case 'Inox A2-70':
      return 'A270';
    case 'Inox A4-80':
      return 'A480';
    case 'Latão CLA 360':
      return 'LAT';
    default:
      return (classe as string).replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  }
}

export function getStandardCleanCode(standardCode: string): string {
  // 'DIN 933' -> '933', 'DIN 125A' -> '125A', 'DIN 127B' -> '127B'
  return standardCode.replace(/^DIN\s*/i, '').trim();
}

/**
 * Intelligent SKU Generator
 * Pattern:
 *   Screws:  PS-[NORMA]-[BITOLA]-[PASSO*100]-[COMPRIMENTO]-[CLASSE]-[ACABAMENTO]
 *   Nuts:    PC-[NORMA]-[BITOLA]-[PASSO*100]-[CLASSE]-[ACABAMENTO]
 *   Washers: AR-[NORMA]-[BITOLA]-[ACABAMENTO]
 */
export function generateIndustrialSku(params: SkuParameters): string {
  const normClean = getStandardCleanCode(params.standardCode);
  const finishCode = getFinishCode(params.tratamentoSuperficial);
  const classCode = getClassCode(params.classeResistencia);
  const bitolaClean = params.bitola.toUpperCase();

  if (params.family === 'parafuso') {
    const passoCode = Math.round((params.passo || 1.0) * 100);
    const compCode = Math.round(params.comprimento || 50);
    return `PS-${normClean}-${bitolaClean}-${passoCode}-${compCode}-${classCode}-${finishCode}`;
  }

  if (params.family === 'porca') {
    const passoCode = Math.round((params.passo || 1.0) * 100);
    return `PC-${normClean}-${bitolaClean}-${passoCode}-${classCode}-${finishCode}`;
  }

  if (params.family === 'arruela') {
    return `AR-${normClean}-${bitolaClean}-${finishCode}`;
  }

  return `DF-${normClean}-${bitolaClean}-${finishCode}`;
}
