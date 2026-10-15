// src/app/api/ai/chat/route.ts - Lynx VPS AI Industrial Copilot Gateway
import { NextRequest, NextResponse } from 'next/server';

const VPS_AI_URL = process.env.VPS_AI_URL || 'http://85.31.60.68:11434';
const VPS_AI_TOKEN = process.env.VPS_AI_TOKEN || 'lynx_sk_live_ktvdp2f1-ThbQI__4CHmTlr8BijlUE_H';

const SYSTEM_PROMPT = `Você é o Engenheiro Especialista de IA Industrial da Delta Parafusos Especiais (DeltaFix Copilot).
Você opera conectado diretamente aos nós de processamento da VPS EasyPanel da empresa.
Seu conhecimento abrange:
- Normas técnicas internacionais: DIN (DIN 933, DIN 931, DIN 912, DIN 934, DIN 125, DIN 127), ISO (4014, 4017, 4762, 4032, 7089), ASTM (A193, A325, A490), SAE J429.
- Classes de resistência e metalurgia: 4.6, 5.8, 8.8, 10.9, 12.9, Inox A2/A4. Tensão de escoamento (Rp0.2), limite de resistência à tração (Rm), dureza Rockwell/Brinell.
- Cálculo de Torque de Aperto conforme VDI 2230: Fórmulas de aperto, coeficiente de atrito de rosca e cabeça (mu = 0.10 a 0.16 para ZB, GF, fosfatizado).
- Parâmetros de Usinagem & Conformação Mecânica: Laminação de rosca, cabeceamento a quente/frio, velocidades de corte (Vc), avanço (fn), tipos de ferramentas (insertos de metal duro).
- Cálculos de rendimento de matéria-prima (pesos líquido e bruto, sobras e cavacos).

Responda sempre com alta precisão técnica, linguagem de engenharia clara, objetiva e em português do Brasil. Quando relevante, inclua fórmulas, tabelas ou recomendações práticas para a fábrica.`;

export async function POST(req: NextRequest) {
  try {
    const { messages, model = 'qwen2.5-coder:1.5b', contextData } = await req.json();

    let fullSystemPrompt = SYSTEM_PROMPT;
    if (contextData) {
      fullSystemPrompt += `\n\n[CONTEXTO ATUAL DA PEÇA EM CONFIGURAÇÃO NO DELTAFIX]:
- Tipo: ${contextData.family || 'Parafuso'}
- Norma: ${contextData.standardCode}
- Bitola: ${contextData.bitola} | Passo: ${contextData.passo}mm
- Comprimento: ${contextData.comprimento ? contextData.comprimento + 'mm' : 'N/A'}
- Classe: ${contextData.classeResistencia} | Material: ${contextData.materialBase}
- Acabamento: ${contextData.tratamentoSuperficial}
- SKU Gerado: ${contextData.skuGerado || 'N/A'}
- Peso Líquido: ${contextData.pesoLiquidoKg ? (contextData.pesoLiquidoKg * 1000).toFixed(2) + ' g' : 'N/A'}
- Fator de Perda: ${contextData.fatorPerdaPercentual ? contextData.fatorPerdaPercentual + '%' : 'N/A'}`;
    }

    const payload = {
      model,
      messages: [
        { role: 'system', content: fullSystemPrompt },
        ...messages
      ],
      temperature: 0.3,
      stream: false
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout for LLM

    const response = await fetch(`${VPS_AI_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${VPS_AI_TOKEN}`
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('VPS AI API Error:', response.status, errorText);
      return NextResponse.json(
        { error: `VPS AI error (${response.status}): ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || 'Sem resposta do modelo.';

    return NextResponse.json({
      content,
      model: data.model || model,
      usage: data.usage
    });
  } catch (err: any) {
    console.error('Server error talking to VPS AI:', err);
    return NextResponse.json(
      { error: err.message || 'Falha ao conectar à VPS Lynx AI' },
      { status: 500 }
    );
  }
}
