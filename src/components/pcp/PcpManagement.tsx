// src/components/pcp/PcpManagement.tsx - Módulo de PCP & Manufatura (Estrutura BOM, Roteiros & Recursos)
'use client';

import React, { useState } from 'react';
import {
  Factory,
  Boxes,
  Layers,
  Cpu,
  Clock,
  Scissors,
  Flame,
  ShieldCheck,
  CheckCircle2,
  FileSpreadsheet,
  ArrowRight,
  TrendingUp,
  PackageCheck
} from 'lucide-react';

interface PcpManagementProps {
  initialSubTab?: 'estrutura' | 'roteiros' | 'recursos';
}

export function PcpManagement({ initialSubTab = 'estrutura' }: PcpManagementProps) {
  const [activeSubTab, setActiveSubTab] = useState<'estrutura' | 'roteiros' | 'recursos'>(initialSubTab);

  // Exemplo de cálculo de barra de 6 metros
  const [comprimentoPeca, setComprimentoPeca] = useState(120);
  const [alturaCabeca, setAlturaCabeca] = useState(12.5);
  const [sobremetal, setSobremetal] = useState(15);
  const [larguraCorteSerra, setLarguraCorteSerra] = useState(3.0); // mm

  const tarugoTotal = comprimentoPeca + alturaCabeca + sobremetal;
  const pecaComSerra = tarugoTotal + larguraCorteSerra;
  const pecasPorBarra6m = Math.floor(6000 / pecaComSerra);
  const retalhoPontaMm = Number((6000 - pecasPorBarra6m * pecaComSerra).toFixed(1));
  const aproveitamentoPerc = Number(((pecasPorBarra6m * tarugoTotal * 100) / 6000).toFixed(1));
  const barrasPorMilheiro = Math.ceil(1000 / (pecasPorBarra6m || 1));

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <Factory className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-black text-white tracking-wide">
              PCP & Engenharia de Manufatura DeltaFix
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Controle de estrutura de materiais (BOM), barras comerciais de 6 metros, roteiros de produção e centros de trabalho fabris.
          </p>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveSubTab('estrutura')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'estrutura'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>Estrutura (BOM 6m)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('roteiros')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'roteiros'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Roteiros MES</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('recursos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'recursos'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Recursos Fabris</span>
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------------------------
          SUB-TAB 1: ESTRUTURA (BOM & BARRAS DE 6M)
          --------------------------------------------------------------------- */}
      {activeSubTab === 'estrutura' && (
        <div className="space-y-6">
          {/* Card de Simulação de Corte de Barras Comerciais */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-cyan-400" />
                  Calculadora & Otimizador de Barras Comerciais de 6 Metros (6.000 mm)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Dimensione o corte do tarugo bruto considerando o sobremetal de usinagem e o rasgo do disco/fita de serra.
                </p>
              </div>
            </div>

            {/* Inputs de Simulação */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
              <div>
                <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
                  Comprimento Útil (L):
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={comprimentoPeca}
                    onChange={(e) => setComprimentoPeca(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white font-mono"
                  />
                  <span className="text-xs text-slate-500">mm</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
                  Altura Cabeça (k):
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={alturaCabeca}
                    onChange={(e) => setAlturaCabeca(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white font-mono"
                  />
                  <span className="text-xs text-slate-500">mm</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
                  Sobremetal de Corte:
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={sobremetal}
                    onChange={(e) => setSobremetal(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-amber-400 font-mono"
                  />
                  <span className="text-xs text-slate-500">mm</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
                  Rasgo da Serra (Kerf):
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.1"
                    value={larguraCorteSerra}
                    onChange={(e) => setLarguraCorteSerra(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white font-mono"
                  />
                  <span className="text-xs text-slate-500">mm</span>
                </div>
              </div>
            </div>

            {/* Resultados Rápidos */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">
                  Envelope do Tarugo (L_tarugo):
                </span>
                <div className="text-xl font-black font-mono text-cyan-400 mt-1">
                  {tarugoTotal} mm
                </div>
                <span className="text-[10px] text-slate-400 font-mono">(k + L) + sobremetal</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">
                  Peças por Barra de 6m:
                </span>
                <div className="text-xl font-black font-mono text-emerald-400 mt-1">
                  {pecasPorBarra6m} un
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  Aproveitamento: {aproveitamentoPerc}%
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">
                  Retalho de Ponta por Barra:
                </span>
                <div className="text-xl font-black font-mono text-amber-400 mt-1">
                  {retalhoPontaMm} mm
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Sucata final de fixação</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">
                  Barras p/ 1.000 Peças:
                </span>
                <div className="text-xl font-black font-mono text-white mt-1">
                  {barrasPorMilheiro} barras
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {(barrasPorMilheiro * 6).toFixed(0)} metros lineares
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------
          SUB-TAB 2: ROTEIROS DE OPERAÇÃO MES
          --------------------------------------------------------------------- */}
      {activeSubTab === 'roteiros' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                Sequenciamento Padrão de Fabricação de Fixadores Especiais
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Roteiro técnico industrial com postos de trabalho, tempos de setup e ciclo por milheiro.
              </p>
            </div>

            <div className="space-y-2.5">
              {[
                {
                  seq: '010',
                  op: 'Corte de Tarugos Brutos em Barra Comercial 6m',
                  recurso: 'Serra de Fita Automática CNC',
                  setup: '25 min',
                  ciclo: '18 seg/peça',
                  cq: 'Conferência de comprimento do tarugo com sobremetal (±0.5mm)'
                },
                {
                  seq: '020',
                  op: 'Usinagem de Cabeceamento / Sextavado / Rebaixo',
                  recurso: 'Torno CNC de Produção Rápida',
                  setup: '45 min',
                  ciclo: '35 seg/peça',
                  cq: 'Inspeção dimensional de chave (s) e altura de cabeça (k)'
                },
                {
                  seq: '030',
                  op: 'Chanframento de Entrada de Rosca (45°)',
                  recurso: 'Chanfradeira Automática Delta',
                  setup: '15 min',
                  ciclo: '6 seg/peça',
                  cq: 'Verificação visual de rebarbas'
                },
                {
                  seq: '040',
                  op: 'Laminação de Rosca a Frio por Rolos Hidráulicos',
                  recurso: 'Laminadora Hidráulica 30 Toneladas',
                  setup: '40 min',
                  ciclo: '8 seg/peça',
                  cq: 'Calibre passa/não-passa 6g / 2A conforme norma'
                },
                {
                  seq: '050',
                  op: 'Tratamento Térmico de Têmpera & Revenimento',
                  recurso: 'Forno Contínuo com Atmosfera Controlada',
                  setup: '60 min',
                  ciclo: 'Lote contínuo',
                  cq: 'Ensaio de Dureza Rockwell C (HRC) e Tração por amostragem'
                },
                {
                  seq: '060',
                  op: 'Tratamento Superficial (Galvanização / Geomet / Fosfato)',
                  recurso: 'Linha Química Automatizada de Banhos',
                  setup: '30 min',
                  ciclo: 'Por tambor rotativo',
                  cq: 'Ensaio de espessura de camada (micras) e Salt Spray'
                },
                {
                  seq: '070',
                  op: 'Inspeção Final CQ & Embalagem com Certificado 3.1',
                  recurso: 'Bancada de Controle de Qualidade',
                  setup: '10 min',
                  ciclo: 'Amostragem NBR 5426',
                  cq: 'Geração do Certificado de Qualidade com número de corrida'
                }
              ].map((rt) => (
                <div
                  key={rt.seq}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-7 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 font-mono font-bold flex items-center justify-center shrink-0">
                      {rt.seq}
                    </span>
                    <div>
                      <div className="font-bold text-slate-100">{rt.op}</div>
                      <div className="text-[11px] text-cyan-400 font-medium">{rt.recurso}</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-[11px]">
                    <span className="text-slate-400">
                      Setup: <strong className="text-slate-200">{rt.setup}</strong>
                    </span>
                    <span className="text-slate-400">
                      Ciclo: <strong className="text-emerald-400 font-mono">{rt.ciclo}</strong>
                    </span>
                    <span className="text-slate-400 max-w-xs truncate hidden lg:inline">
                      CQ: <em className="text-amber-300 not-italic">{rt.cq}</em>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------
          SUB-TAB 3: RECURSOS FABRIS AGRUPADOS
          --------------------------------------------------------------------- */}
      {activeSubTab === 'recursos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              nome: 'Corte & Serras de Fita CNC',
              codigo: 'CC-01',
              capacidade: 'Barras de 6m até Ø 150mm',
              maquinas: ['Serra Franho CNC 350', 'Serra Automática Kasto 420'],
              status: 'Operando',
              icon: Scissors,
              cor: 'text-cyan-400'
            },
            {
              nome: 'Tornos CNC & Cabeceamento',
              codigo: 'US-02',
              capacidade: 'Comprimentos até 1.000mm',
              maquinas: ['Romi Centur 35D', 'Doosan Puma GT2100', 'Galaxy B500'],
              status: 'Operando',
              icon: Cpu,
              cor: 'text-sky-400'
            },
            {
              nome: 'Laminação de Roscas a Frio',
              codigo: 'LM-03',
              capacidade: 'M5 a M64 / 1/4" a 2.1/2"',
              maquinas: ['Laminadora Izpe 30T', 'Laminadora Hidráulica 50T'],
              status: 'Operando',
              icon: Factory,
              cor: 'text-amber-400'
            },
            {
              nome: 'Tratamento Térmico (Têmpera)',
              codigo: 'TT-04',
              capacidade: '1.200 kg / hora',
              maquinas: ['Forno Contínuo de Esteira', 'Tanque de Resfriamento em Polímero'],
              status: 'Operando',
              icon: Flame,
              cor: 'text-red-400'
            },
            {
              nome: 'Revestimento Superficial',
              codigo: 'GALV-05',
              capacidade: 'Galvanização a Fogo, Geomet e Zinco',
              maquinas: ['Linha de Imersão a Quente 450°C', 'Centrífuga de Geomet'],
              status: 'Operando',
              icon: CheckCircle2,
              cor: 'text-emerald-400'
            },
            {
              nome: 'Laboratório & Controle CQ',
              codigo: 'LAB-06',
              capacidade: 'Ensaios Destrutivos e Não-Destrutivos',
              maquinas: ['Máquina Universal de Tração 100T', 'Durômetro Rockwell HRB/HRC'],
              status: 'Operando',
              icon: ShieldCheck,
              cor: 'text-purple-400'
            }
          ].map((rc) => {
            const Icon = rc.icon;
            return (
              <div
                key={rc.codigo}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center">
                      <Icon className={`w-4 h-4 ${rc.cor}`} />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-white">{rc.nome}</h3>
                      <span className="text-[10px] font-mono text-slate-500 font-bold">
                        {rc.codigo}
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                    {rc.status}
                  </span>
                </div>

                <div className="text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">Capacidade Operacional:</span>{' '}
                  {rc.capacidade}
                </div>

                <div className="space-y-1 text-[11px] pt-2 border-t border-slate-800/80">
                  <span className="text-slate-500 font-mono text-[10px] uppercase font-bold">
                    Máquinas Homologadas:
                  </span>
                  <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                    {rc.maquinas.map((m, idx) => (
                      <li key={idx}>{m}</li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
