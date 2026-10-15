// src/lib/services/productCatalogService.ts - Serviço de Catálogo de Produtos e Peças Especiais Livres
import { ProductItem } from '../standards/types';

export const DEFAULT_CATALOG_PRODUCTS: ProductItem[] = [
  {
    id: 'prod-01',
    sku_gerado: 'PF-DIN933-M20-80-8.8-ZB',
    codigo_interno_delta: 'DELTA-933-2080',
    standard_code: 'DIN 933',
    family: 'parafuso',
    bitola: 'M20',
    passo: 2.5,
    comprimento: 80,
    classe_resistencia: '8.8',
    material_base: 'Aço Médio Carbono SAE 1045',
    tratamento_superficial: 'Zincado Branco (ZB)',
    peso_liquido_kg: 0.285,
    peso_bruto_kg: 0.315,
    fator_perda_percentual: 10.5,
    comprimento_rosca_b: 80,
    sobremetal_corte: 5.0,
    is_custom_special: false,
    created_at: '2026-03-01T10:00:00Z'
  },
  {
    id: 'prod-02',
    sku_gerado: 'PF-DIN912-M16-60-10.9-OX',
    codigo_interno_delta: 'DELTA-912-1660',
    standard_code: 'DIN 912',
    family: 'parafuso',
    bitola: 'M16',
    passo: 2.0,
    comprimento: 60,
    classe_resistencia: '10.9',
    material_base: 'Aço Liga SAE 4140',
    tratamento_superficial: 'Enegrecido de Têmpera',
    peso_liquido_kg: 0.145,
    peso_bruto_kg: 0.165,
    fator_perda_percentual: 13.8,
    comprimento_rosca_b: 44,
    sobremetal_corte: 4.5,
    is_custom_special: false,
    created_at: '2026-03-05T14:30:00Z'
  },
  {
    id: 'prod-03',
    sku_gerado: 'PC-DIN934-M20-CL8-ZB',
    codigo_interno_delta: 'DELTA-934-M20',
    standard_code: 'DIN 934',
    family: 'porca',
    bitola: 'M20',
    passo: 2.5,
    classe_resistencia: 'Classe 8',
    material_base: 'Aço Médio Carbono SAE 1045',
    tratamento_superficial: 'Zincado Branco (ZB)',
    peso_liquido_kg: 0.064,
    peso_bruto_kg: 0.075,
    fator_perda_percentual: 17.2,
    is_custom_special: false,
    created_at: '2026-03-08T09:15:00Z'
  },
  {
    id: 'prod-04',
    sku_gerado: 'ESP-MARTELO-M24-180-4340-GF',
    codigo_interno_delta: 'VALE-ESP-M24-180',
    standard_code: 'ESPECIAL LIVRE',
    family: 'parafuso',
    bitola: 'M24-ESP',
    passo: 3.0,
    comprimento: 180,
    classe_resistencia: '12.9',
    material_base: 'Aço Liga SAE 4340',
    tratamento_superficial: 'Galvanizado a Fogo (GF)',
    peso_liquido_kg: 0.89,
    peso_bruto_kg: 0.98,
    fator_perda_percentual: 10.1,
    comprimento_rosca_b: 90,
    sobremetal_corte: 6.0,
    is_custom_special: true,
    desenho_cliente_ref: 'DWG-VALE-4982-REV2',
    observacoes_especiais: 'Parafuso cabeça martelo especial para fixação de revestimento de moinho SAG. Cabeça usinada sob desenho com cantos arredondados.',
    created_at: '2026-03-12T11:20:00Z'
  },
  {
    id: 'prod-05',
    sku_gerado: 'ESP-EIXO-ROSC-D30-240-4140',
    codigo_interno_delta: 'USIMINAS-ESP-EIXO-30',
    standard_code: 'ESPECIAL LIVRE',
    family: 'prisioneiro',
    bitola: 'Ø30-ESP',
    passo: 3.5,
    comprimento: 240,
    classe_resistencia: '10.9',
    material_base: 'Aço Liga SAE 4140',
    tratamento_superficial: 'Polido / Oleado',
    peso_liquido_kg: 1.34,
    peso_bruto_kg: 1.48,
    fator_perda_percentual: 10.4,
    comprimento_rosca_b: 70,
    sobremetal_corte: 8.0,
    is_custom_special: true,
    desenho_cliente_ref: 'DWG-USIMINAS-LAM-774',
    observacoes_especiais: 'Eixo prisioneiro especial com rebaixo central e roscas assimétricas nas extremidades para laminador de tiras a quente.',
    created_at: '2026-03-14T16:45:00Z'
  },
  {
    id: 'prod-06',
    sku_gerado: 'ESP-CHUMBADOR-J-1POL-450-1045',
    codigo_interno_delta: 'PETRO-CHUMB-J1',
    standard_code: 'ESPECIAL LIVRE',
    family: 'barra_roscada',
    bitola: '1"-ESP',
    passo: 3.175, // 8 fios/pol UNC
    comprimento: 450,
    classe_resistencia: '8.8',
    material_base: 'Aço Médio Carbono SAE 1045',
    tratamento_superficial: 'Galvanizado a Fogo (GF)',
    peso_liquido_kg: 2.15,
    peso_bruto_kg: 2.35,
    fator_perda_percentual: 9.3,
    comprimento_rosca_b: 120,
    sobremetal_corte: 10.0,
    is_custom_special: true,
    desenho_cliente_ref: 'PETROBRAS-REGAP-ENG-902',
    observacoes_especiais: 'Chumbador tipo J de ancoragem pesada para base de bombas e turbogeradores da refinaria.',
    created_at: '2026-03-15T08:10:00Z'
  }
];

export function getSavedCatalogProducts(): ProductItem[] {
  if (typeof window === 'undefined') return DEFAULT_CATALOG_PRODUCTS;
  try {
    const raw = localStorage.getItem('deltafix_catalog_products');
    if (!raw) {
      localStorage.setItem('deltafix_catalog_products', JSON.stringify(DEFAULT_CATALOG_PRODUCTS));
      return DEFAULT_CATALOG_PRODUCTS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_CATALOG_PRODUCTS;
  }
}

export function saveCatalogProduct(product: ProductItem): ProductItem[] {
  const list = getSavedCatalogProducts();
  const idx = list.findIndex((p) => p.sku_gerado === product.sku_gerado || (product.id && p.id === product.id));
  let updated: ProductItem[];
  if (idx >= 0) {
    updated = [...list];
    updated[idx] = { ...product, id: product.id || list[idx].id };
  } else {
    updated = [{ ...product, id: product.id || `prod-${Date.now()}` }, ...list];
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem('deltafix_catalog_products', JSON.stringify(updated));
  }

  // Tenta sincronizar assincronamente com o banco de dados
  fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product)
  }).catch((err) => console.log('Sync to db skipped/fallback:', err));

  return updated;
}

export function deleteCatalogProduct(sku: string): ProductItem[] {
  const list = getSavedCatalogProducts();
  const filtered = list.filter((p) => p.sku_gerado !== sku);
  if (typeof window !== 'undefined') {
    localStorage.setItem('deltafix_catalog_products', JSON.stringify(filtered));
  }
  return filtered;
}
