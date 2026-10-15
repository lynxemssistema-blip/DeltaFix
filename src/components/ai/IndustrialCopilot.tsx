// src/components/ai/IndustrialCopilot.tsx - Lynx VPS AI Industrial Engineering Assistant
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, RefreshCw, Cpu, Check, AlertCircle, Wrench, ShieldCheck, Flame, Scale } from 'lucide-react';
import { ProductItem } from '@/lib/standards/types';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  model?: string;
}

interface IndustrialCopilotProps {
  currentProductContext: Partial<ProductItem>;
}

export function IndustrialCopilot({ currentProductContext }: IndustrialCopilotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Olá! Sou o **Lynx AI - Copilot Industrial**, operando diretamente na VPS DeltaFix.\n\nEstou conectado ao configurador paramétrico. Posso calcular torques de aperto conforme **VDI 2230**, dimensionar tensões admissíveis da classe **${currentProductContext.classe_resistencia || '8.8'}**, sugerir parâmetros de corte CNC ou analisar resistência à corrosão do acabamento **${currentProductContext.tratamento_superficial || 'Zincado Branco'}**.\n\nSelecione uma das ações rápidas ou envie sua dúvida técnica!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      model: 'qwen2.5-coder:1.5b'
    }
  ]);
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('qwen2.5-coder:1.5b');
  const [isLoading, setIsLoading] = useState(false);
  const [serverOnline, setServerOnline] = useState<boolean | null>(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
          contextData: {
            family: currentProductContext.family,
            standardCode: currentProductContext.standard_code,
            bitola: currentProductContext.bitola,
            passo: currentProductContext.passo,
            comprimento: currentProductContext.comprimento,
            classeResistencia: currentProductContext.classe_resistencia,
            materialBase: currentProductContext.material_base,
            tratamentoSuperficial: currentProductContext.tratamento_superficial,
            skuGerado: currentProductContext.sku_gerado,
            pesoLiquidoKg: currentProductContext.peso_liquido_kg,
            fatorPerdaPercentual: currentProductContext.fator_perda_percentual
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}`);
      }

      const data = await response.json();
      setServerOnline(true);

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        model: selectedModel
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error('Failed to query VPS AI:', err);
      setServerOnline(false);

      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `⚠️ Não foi possível comunicar com o nó de inferência na VPS (${err.message}). Verifique se o daemon Ollama na porta 11434 está aceitando conexões.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    {
      label: 'Torque de Aperto (VDI 2230)',
      icon: <Wrench className="w-3.5 h-3.5 text-amber-400" />,
      prompt: `Calcule o torque de aperto nominal recomendado (em N·m e kgf·m) para esta bitola ${currentProductContext.bitola || 'M16'} na classe ${currentProductContext.classe_resistencia || '8.8'} com acabamento ${currentProductContext.tratamento_superficial || 'Zincado Branco'}. Considere coeficiente de atrito médio de rosca e cabeça e forneça a força de pré-tensão (Fm).`
    },
    {
      label: 'Resistência & Escoamento',
      icon: <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />,
      prompt: `Apresente as propriedades mecânicas normativas para a Classe ${currentProductContext.classe_resistencia || '8.8'}: Limite de escoamento (Rp0.2 em MPa), Limite de resistência à tração (Rm em MPa), Carga de prova (Sp em MPa), Alongamento mínimo e Dureza recomendada.`
    },
    {
      label: 'Parâmetros Usinagem / Laminação',
      icon: <Cpu className="w-3.5 h-3.5 text-emerald-400" />,
      prompt: `Recomende parâmetros de usinagem e laminação para o material ${currentProductContext.material_base || 'SAE 1045'}: Velocidade de corte (Vc em m/min) para torneamento CNC, avanço por rotação, e especificações da matriz cilíndrica de laminação de rosca para passo ${currentProductContext.passo || 2.0}mm.`
    },
    {
      label: 'Névoa Salina (Salt Spray)',
      icon: <Flame className="w-3.5 h-3.5 text-rose-400" />,
      prompt: `Qual a resistência à corrosão em câmara de névoa salina (Salt Spray conforme ASTM B117) garantida para o acabamento ${currentProductContext.tratamento_superficial || 'Zincado Branco'}? Diferencie horas até corrosão branca (zinco) e corrosão vermelha (ferro base).`
    }
  ];

  return (
    <div className="flex flex-col h-[540px] bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-amber-500 flex items-center justify-center text-slate-950 font-bold shadow-lg">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-slate-900 ${
                serverOnline ? 'bg-emerald-400' : 'bg-rose-500'
              }`}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-100">Lynx AI Copilot</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-semibold">
                VPS HOST
              </span>
            </div>
            <div className="text-[11px] text-slate-400">Engenharia Metalúrgica & Normas DIN</div>
          </div>
        </div>

        {/* Model Switcher */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 hidden sm:inline font-mono">Modelo:</label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-cyan-300 text-xs rounded px-2.5 py-1 font-mono focus:outline-none focus:border-cyan-500"
          >
            <option value="qwen2.5-coder:1.5b">qwen2.5-coder:1.5b (Rápido)</option>
            <option value="codegemma:latest">codegemma:latest (Código/Cálculo)</option>
            <option value="deepseek-r1:7b">deepseek-r1:7b (Raciocínio)</option>
            <option value="llama3.2:3b">llama3.2:3b (Equilibrado)</option>
          </select>
        </div>
      </div>

      {/* Quick Action Prompts Bar */}
      <div className="bg-slate-900/60 border-b border-slate-800/80 px-3 py-2 flex items-center gap-2 overflow-x-auto scrollbar-none">
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-400" /> Ações Rápidas:
        </span>
        {quickPrompts.map((q, i) => (
          <button
            key={i}
            type="button"
            disabled={isLoading}
            onClick={() => handleSendMessage(q.prompt)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 whitespace-nowrap transition-colors disabled:opacity-50"
          >
            {q.icon}
            <span>{q.label}</span>
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-sans">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[88%] rounded-xl px-4 py-3 shadow-md ${
                m.role === 'user'
                  ? 'bg-cyan-600 text-white rounded-br-none'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
              }`}
            >
              {/* Header inside bot message */}
              {m.role === 'assistant' && (
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1.5 pb-1 border-b border-slate-800">
                  <span className="text-amber-400 font-semibold flex items-center gap-1">
                    <Cpu className="w-3 h-3" /> Lynx Engine ({m.model || selectedModel})
                  </span>
                  <span>{m.timestamp}</span>
                </div>
              )}

              {/* Message body with Markdown support */}
              <div className="leading-relaxed whitespace-pre-wrap font-sans text-xs">
                {m.content}
              </div>

              {m.role === 'user' && (
                <div className="text-[9px] text-cyan-200 text-right mt-1 font-mono">{m.timestamp}</div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-slate-400 text-xs italic bg-slate-900/80 border border-slate-800 rounded-lg p-3 w-fit">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
            <span>Processando cálculo de engenharia na VPS EasyPanel ({selectedModel})...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Pergunte ao Copilot sobre ${currentProductContext.standard_code || 'DIN 933'} ${currentProductContext.bitola || 'M20'}...`}
          disabled={isLoading}
          className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-3.5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Consultar</span>
        </button>
      </form>
    </div>
  );
}
