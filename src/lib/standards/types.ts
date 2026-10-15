// src/lib/standards/types.ts - Type definitions for DeltaFix Core Engine

export type StandardFamily = 'parafuso' | 'porca' | 'arruela' | 'prisioneiro' | 'barra_roscada';
export type StandardSystem = 'metrico' | 'polegada';

export type GeometricArchetype =
  | 'hex_bolt'
  | 'heavy_hex_bolt'
  | 'socket_head_allen'
  | 'countersunk_allen'
  | 'stud_bolt'
  | 'hex_nut'
  | 'washer_plain'
  | 'washer_spring';

export interface EngineeringStandard {
  id?: string;
  code: string; // 'DIN 933', 'DIN 931', 'ASTM A325', etc.
  family: StandardFamily;
  system: StandardSystem;
  description: string;
  geometric_archetype?: GeometricArchetype;
  calculation_formulas?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export interface DimensionTolerance {
  nominal: number;
  passo?: number;
  min?: number;
  max?: number;
  classe?: string;
  formula?: string;
  instrumento: string;
  observacao?: string;
}

export interface StandardDimension {
  id?: string;
  standard_id?: string;
  bitola: string; // 'M6', 'M8', ...
  diametro_nominal: number; // d
  passo: number; // P
  chave?: number | null; // s
  altura_cabeca?: number | null; // k (parafuso) ou m (porca)
  diametro_cabeca?: number | null; // dk (allen)
  vertice?: number | null; // e
  diametro_interno?: number | null; // d1 (arruela)
  diametro_externo?: number | null; // d2 (arruela)
  espessura?: number | null; // s (arruela)
  comprimentos_validos?: number[];
  tolerancias?: Record<string, DimensionTolerance>;
}

export type ResistanceClass =
  | '4.6'
  | '5.8'
  | '8.8'
  | '10.9'
  | '12.9'
  | 'Classe 6'
  | 'Classe 8'
  | 'Classe 10'
  | 'Classe 12'
  | 'Inox A2-70'
  | 'Inox A4-80'
  | 'Latão CLA 360';

export type BaseMaterial =
  | 'Aço Carbono SAE 1010/1020'
  | 'Aço Médio Carbono SAE 1045'
  | 'Aço Liga SAE 4140'
  | 'Aço Liga SAE 4340'
  | 'Aço Inoxidável AISI 304 (A2)'
  | 'Aço Inoxidável AISI 316 (A4)'
  | 'Latão CLA 360';

export type SurfaceFinish =
  | 'Polido / Oleado'
  | 'Enegrecido de Têmpera'
  | 'Zincado Branco (ZB)'
  | 'Zincado Amarelo (Bicromatizado)'
  | 'Galvanizado a Fogo (GF)'
  | 'Geomet 321 / 500'
  | 'Fosfatizado';

export interface ProductItem {
  id?: string;
  sku_gerado: string;
  codigo_interno_delta?: string;
  standard_id?: string;
  standard_code: string;
  family: StandardFamily;
  bitola: string;
  passo: number;
  comprimento?: number;
  classe_resistencia: ResistanceClass;
  material_base: BaseMaterial;
  tratamento_superficial: SurfaceFinish;
  peso_liquido_kg: number;
  peso_bruto_kg: number;
  fator_perda_percentual: number;
  comprimento_rosca_b?: number;
  sobremetal_corte?: number; // Sobremetal de corte em mm (paramétrico)
  geometric_archetype?: GeometricArchetype;
  especificacoes_adicionais?: Record<string, unknown>;
  created_at?: string;
}

export interface ResourceGroup {
  id: string;
  code: string;
  name: string;
  description: string;
}

export interface Resource {
  id: string;
  group_id: string;
  code: string;
  name: string;
  hourly_rate: number;
  capacity_units_per_hour: number;
}

export interface ProductBOMItem {
  id?: string;
  product_id?: string;
  item_type: 'materia_prima' | 'insumo_quimico' | 'embalagem';
  description: string;
  consumption_per_thousand: number;
  unit: string;
  loss_factor_percentage: number;
}

export interface ProductRoutingItem {
  id?: string;
  product_id?: string;
  operation_seq: number;
  operation_name: string;
  resource_code?: string;
  resource_name?: string;
  setup_time_minutes: number;
  cycle_time_seconds: number;
  description: string;
}
