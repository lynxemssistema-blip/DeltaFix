// src/app/api/ai/suggest-standard/route.ts - AI-Powered Fastener Technical Standard Matrix Generator
import { NextRequest, NextResponse } from 'next/server';

const VPS_AI_BASE_URL = process.env.VPS_AI_URL || 'http://85.31.60.68:11434';
const VPS_AI_TOKEN = process.env.VPS_AI_TOKEN || 'lynx-vps-ollama-secure-2025';

// Pre-indexed expert matrices for immediate lightning-fast response for common standards
const PRESET_STANDARDS: Record<string, any> = {
  'ASTM A325': {
    code: 'ASTM A325',
    family: 'parafuso',
    system: 'polegada',
    description: 'Parafuso Estrutural Sextavado Pesado de Alta Resistência Mecânica (Heavy Hex Bolt)',
    geometric_archetype: 'heavy_hex_bolt',
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
        comprimentos_validos: [65, 75, 90, 100, 120, 150, 180, 200],
        tolerancias: {
          d: { nominal: 25.4, min: 25.0, max: 25.4, instrumento: 'Micrômetro 0.001mm', observacao: 'Corpo h13' },
          s: { nominal: 41.28, min: 40.6, max: 41.28, instrumento: 'Paquímetro Digital', observacao: 'Chave 1.5/8"' },
          k: { nominal: 15.88, min: 15.3, max: 16.3, instrumento: 'Paquímetro Digital', observacao: 'Altura Cabeça' }
        }
      }
    ]
  },
  'DIN 7991': {
    code: 'DIN 7991',
    family: 'parafuso',
    system: 'metrico',
    description: 'Parafuso de Cabeça Escareada com Sextavado Interno (Countersunk Socket Flat Head)',
    geometric_archetype: 'countersunk_allen',
    calculation_formulas: {
      formula_b: 'Rosca total ou parcial conforme ISO 10642',
      countersunk_angle: 90,
      notes: 'Cabeça cônica com ângulo de 90°. Encaixe sextavado interno normalizado.'
    },
    dimensions: [
      {
        bitola: 'M6',
        diametro_nominal: 6,
        passo: 1.0,
        chave: 4.0,
        altura_cabeca: 3.3,
        diametro_cabeca: 12.0,
        comprimentos_validos: [16, 20, 25, 30, 35, 40, 50],
        tolerancias: {
          d: { nominal: 6, min: 5.82, max: 6.0, instrumento: 'Micrômetro', observacao: 'h13' },
          dk: { nominal: 12.0, min: 11.5, max: 12.0, instrumento: 'Paquímetro', observacao: 'Ø Cabeça Escareada' },
          k: { nominal: 3.3, min: 3.0, max: 3.3, instrumento: 'Profundímetro', observacao: 'Altura Total Cabeça' }
        }
      },
      {
        bitola: 'M8',
        diametro_nominal: 8,
        passo: 1.25,
        chave: 5.0,
        altura_cabeca: 4.4,
        diametro_cabeca: 16.0,
        comprimentos_validos: [20, 25, 30, 35, 40, 50, 60],
        tolerancias: {
          d: { nominal: 8, min: 7.78, max: 8.0, instrumento: 'Micrômetro', observacao: 'h13' },
          dk: { nominal: 16.0, min: 15.4, max: 16.0, instrumento: 'Paquímetro', observacao: 'Ø Cabeça Escareada' },
          k: { nominal: 4.4, min: 4.1, max: 4.4, instrumento: 'Profundímetro', observacao: 'Altura Total Cabeça' }
        }
      },
      {
        bitola: 'M10',
        diametro_nominal: 10,
        passo: 1.5,
        chave: 6.0,
        altura_cabeca: 5.5,
        diametro_cabeca: 20.0,
        comprimentos_validos: [25, 30, 35, 40, 50, 60, 70, 80],
        tolerancias: {
          d: { nominal: 10, min: 9.78, max: 10.0, instrumento: 'Micrômetro', observacao: 'h13' },
          dk: { nominal: 20.0, min: 19.4, max: 20.0, instrumento: 'Paquímetro', observacao: 'Ø Cabeça Escareada' },
          k: { nominal: 5.5, min: 5.2, max: 5.5, instrumento: 'Profundímetro', observacao: 'Altura Total Cabeça' }
        }
      },
      {
        bitola: 'M12',
        diametro_nominal: 12,
        passo: 1.75,
        chave: 8.0,
        altura_cabeca: 6.5,
        diametro_cabeca: 24.0,
        comprimentos_validos: [30, 35, 40, 50, 60, 70, 80, 100],
        tolerancias: {
          d: { nominal: 12, min: 11.73, max: 12.0, instrumento: 'Micrômetro', observacao: 'h13' },
          dk: { nominal: 24.0, min: 23.3, max: 24.0, instrumento: 'Paquímetro', observacao: 'Ø Cabeça Escareada' },
          k: { nominal: 6.5, min: 6.2, max: 6.5, instrumento: 'Profundímetro', observacao: 'Altura Total Cabeça' }
        }
      },
      {
        bitola: 'M16',
        diametro_nominal: 16,
        passo: 2.0,
        chave: 10.0,
        altura_cabeca: 7.5,
        diametro_cabeca: 30.0,
        comprimentos_validos: [40, 50, 60, 70, 80, 100, 120],
        tolerancias: {
          d: { nominal: 16, min: 15.73, max: 16.0, instrumento: 'Micrômetro', observacao: 'h13' },
          dk: { nominal: 30.0, min: 29.3, max: 30.0, instrumento: 'Paquímetro', observacao: 'Ø Cabeça Escareada' },
          k: { nominal: 7.5, min: 7.2, max: 7.5, instrumento: 'Profundímetro', observacao: 'Altura Total Cabeça' }
        }
      }
    ]
  },
  'ASTM A193 B7': {
    code: 'ASTM A193 B7',
    family: 'prisioneiro',
    system: 'polegada',
    description: 'Prisioneiro de Aço Liga Cromo-Molibdênio SAE 4140 para Alta Temperatura e Alta Pressão',
    geometric_archetype: 'stud_bolt',
    calculation_formulas: {
      formula_b: 'Rosca contínua total ou pontas roscadas simétricas',
      notes: 'Aço liga temperado e revenido. Limite de escoamento mín 720 MPa.'
    },
    dimensions: [
      {
        bitola: '1/2"-13',
        diametro_nominal: 12.7,
        passo: 1.954,
        comprimentos_validos: [65, 75, 90, 100, 120, 150, 200],
        tolerancias: {
          d: { nominal: 12.7, min: 12.4, max: 12.7, instrumento: 'Micrômetro', observacao: 'Corpo h13' }
        }
      },
      {
        bitola: '5/8"-11',
        diametro_nominal: 15.88,
        passo: 2.309,
        comprimentos_validos: [75, 90, 100, 120, 150, 180, 220],
        tolerancias: {
          d: { nominal: 15.88, min: 15.5, max: 15.88, instrumento: 'Micrômetro', observacao: 'Corpo h13' }
        }
      },
      {
        bitola: '3/4"-10',
        diametro_nominal: 19.05,
        passo: 2.54,
        comprimentos_validos: [90, 100, 120, 150, 180, 220, 250, 300],
        tolerancias: {
          d: { nominal: 19.05, min: 18.7, max: 19.05, instrumento: 'Micrômetro', observacao: 'Corpo h13' }
        }
      },
      {
        bitola: '7/8"-9',
        diametro_nominal: 22.23,
        passo: 2.822,
        comprimentos_validos: [100, 120, 150, 180, 220, 250, 300, 350],
        tolerancias: {
          d: { nominal: 22.23, min: 21.8, max: 22.23, instrumento: 'Micrômetro', observacao: 'Corpo h13' }
        }
      },
      {
        bitola: '1"-8',
        diametro_nominal: 25.4,
        passo: 3.175,
        comprimentos_validos: [120, 150, 180, 220, 250, 300, 350, 400],
        tolerancias: {
          d: { nominal: 25.4, min: 25.0, max: 25.4, instrumento: 'Micrômetro', observacao: 'Corpo h13' }
        }
      }
    ]
  },
  'DIN 985': {
    code: 'DIN 985',
    family: 'porca',
    system: 'metrico',
    description: 'Porca Sextavada Auto-travante com Anel de Nylon (Nyloc / Parlock)',
    geometric_archetype: 'hex_nut',
    calculation_formulas: {
      notes: 'Anel não metálico de poliamida/nylon para torque de travamento antivibratório.'
    },
    dimensions: [
      { bitola: 'M6', diametro_nominal: 6, passo: 1.0, chave: 10, altura_cabeca: 6.0, vertice: 11.05 },
      { bitola: 'M8', diametro_nominal: 8, passo: 1.25, chave: 13, altura_cabeca: 8.0, vertice: 14.38 },
      { bitola: 'M10', diametro_nominal: 10, passo: 1.5, chave: 17, altura_cabeca: 10.0, vertice: 18.9 },
      { bitola: 'M12', diametro_nominal: 12, passo: 1.75, chave: 19, altura_cabeca: 12.0, vertice: 21.1 },
      { bitola: 'M16', diametro_nominal: 16, passo: 2.0, chave: 24, altura_cabeca: 16.0, vertice: 26.75 },
      { bitola: 'M20', diametro_nominal: 20, passo: 2.5, chave: 30, altura_cabeca: 20.0, vertice: 33.53 }
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
      if (cleanCode.includes(key.toUpperCase()) || key.toUpperCase().includes(cleanCode)) {
        return NextResponse.json({
          source: 'preset',
          data: preset
        });
      }
    }

    // 2. Query VPS AI (Ollama)
    const prompt = `Você é um Engenheiro Mecânico Especialista em Fixadores Industriais (DIN, ISO, ASTM, ASME).
Gere uma matriz técnica JSON RIGOROSA para a norma: "${cleanCode}".
Retorne ESTRITAMENTE um objeto JSON (sem markdown, sem explicações ao redor) com a seguinte estrutura:
{
  "code": "${cleanCode}",
  "family": "parafuso" | "porca" | "arruela" | "prisioneiro",
  "system": "${cleanCode.includes('ASTM') ? 'polegada' : system}",
  "description": "descrição técnica formal em português",
  "geometric_archetype": "hex_bolt" | "heavy_hex_bolt" | "socket_head_allen" | "countersunk_allen" | "stud_bolt" | "hex_nut" | "washer_plain" | "washer_spring",
  "calculation_formulas": {
    "formula_b": "fórmula de comprimento de rosca",
    "notes": "notas de fabricação e tratamento térmico"
  },
  "dimensions": [
    {
      "bitola": "código (ex M10 ou 1/2-13)",
      "diametro_nominal": número em mm,
      "passo": número em mm,
      "chave": número em mm,
      "altura_cabeca": número em mm,
      "diametro_cabeca": número em mm,
      "vertice": número em mm,
      "comprimentos_validos": [números em mm],
      "tolerancias": {
        "d": { "nominal": 10, "min": 9.78, "max": 10.0, "instrumento": "Micrômetro" }
      }
    }
  ]
}
Forneça pelo menos 4 a 6 bitolas padrão para esta norma.`;

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
    const isNut = cleanCode.includes('PORCA') || cleanCode.includes('934') || cleanCode.includes('563');
    const isWasher = cleanCode.includes('ARRUELA') || cleanCode.includes('125') || cleanCode.includes('436');
    const isStud = cleanCode.includes('PRISIONEIRO') || cleanCode.includes('938') || cleanCode.includes('975') || cleanCode.includes('B7');

    const family = isNut ? 'porca' : isWasher ? 'arruela' : isStud ? 'prisioneiro' : 'parafuso';
    const archetype = isNut
      ? 'hex_nut'
      : isWasher
      ? 'washer_plain'
      : isStud
      ? 'stud_bolt'
      : isAstm
      ? 'heavy_hex_bolt'
      : 'hex_bolt';

    const fallbackData = {
      code: cleanCode,
      family,
      system: isAstm ? 'polegada' : 'metrico',
      description: `Norma Industrial ${cleanCode} (${family.toUpperCase()})`,
      geometric_archetype: archetype,
      calculation_formulas: {
        formula_b: 'Rosca padronizada',
        notes: 'Fabricação conforme especificação técnica industrial.'
      },
      dimensions: isAstm
        ? [
            { bitola: '1/2"-13', diametro_nominal: 12.7, passo: 1.954, chave: 22.2, altura_cabeca: 8.0, comprimentos_validos: [40, 50, 60, 80, 100] },
            { bitola: '5/8"-11', diametro_nominal: 15.88, passo: 2.309, chave: 27.0, altura_cabeca: 10.0, comprimentos_validos: [50, 60, 75, 90, 100] },
            { bitola: '3/4"-10', diametro_nominal: 19.05, passo: 2.54, chave: 31.75, altura_cabeca: 12.0, comprimentos_validos: [60, 75, 90, 100, 120] },
            { bitola: '1"-8', diametro_nominal: 25.4, passo: 3.175, chave: 41.28, altura_cabeca: 16.0, comprimentos_validos: [75, 90, 100, 120, 150] }
          ]
        : [
            { bitola: 'M10', diametro_nominal: 10, passo: 1.5, chave: 16, altura_cabeca: 6.4, comprimentos_validos: [30, 40, 50, 60, 80] },
            { bitola: 'M12', diametro_nominal: 12, passo: 1.75, chave: 18, altura_cabeca: 7.5, comprimentos_validos: [40, 50, 60, 70, 80, 100] },
            { bitola: 'M16', diametro_nominal: 16, passo: 2.0, chave: 24, altura_cabeca: 10.0, comprimentos_validos: [45, 50, 60, 70, 80, 100, 120] },
            { bitola: 'M20', diametro_nominal: 20, passo: 2.5, chave: 30, altura_cabeca: 12.5, comprimentos_validos: [50, 60, 70, 80, 100, 120, 150] }
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
