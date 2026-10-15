// src/components/dashboard/OverviewDashboard.tsx - Visão Geral Executiva, Pipeline CRM & Indicadores Fabris
'use client';

import React from 'react';
import {
  TrendingUp,
  DollarSign,
  Factory,
  CheckCircle2,
  Clock,
  Building2,
  Plus,
  Compass,
  Wrench,
  ArrowRight,
  Boxes,
  FileText,
  AlertTriangle,
  Users
} from 'lucide-react';
import {
  getSavedOrders,
  getSavedCompanies,
  getSavedApprovals
} from '@/lib/services/commercialService';

interface OverviewDashboardProps {
  onNavigate: (module: string) => void;
}

export function OverviewDashboard({ onNavigate }: OverviewDashboardProps) {
  const orders = getSavedOrders();
  const companies = getSavedCompanies();
  const approvals = getSavedApprovals().filter((a) => a.status === 'pendente');

  const totalCotado = orders
    .filter((o) => o.status === 'cotacao_enviada')
    .reduce((acc, curr) => acc + curr.valor_total, 0);

  const totalEmFabricacao = orders
    .filter((o) => o.status === 'em_fabricacao' || o.status === 'aprovado_cliente')
    .reduce((acc, curr) => acc + curr.valor_total, 0);

  const faturamentoRealizado = orders
    .filter((o) => o.status === 'faturado_expedido' || o.status === 'pronto_cq')
    .reduce((acc, curr) => acc + curr.valor_total, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner de Boas-Vindas & Atalhos Rápidos */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
            Painel Executivo DeltaFix Core
          </span>
          <h1 className="text-2xl font-black text-white tracking-wide mt-1">
            Visão Geral & Pipeline Industrial
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Acompanhe a evolução comercial de cotações, ordens de produção em chão de fábrica e parametrização de engenharia.
          </p>
        </div>

        {/* Quick Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('pedidos')}
            className="px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-950/60 active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Nova Cotação / Pedido</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('produtos')}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-slate-700 active:scale-95 transition-all"
          >
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Configurador CAD</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('empresas')}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-slate-700 active:scale-95 transition-all"
          >
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            <span>+ Empresa PJ</span>
          </button>
        </div>
      </div>

      {/* Alerta de Solicitações Pendentes (se houver) */}
      {approvals.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-amber-300">
                {approvals.length} nova(s) solicitação(ões) de cadastro pendente(s) de aprovação Master.
              </span>
              <span className="text-slate-400 ml-1 hidden sm:inline">
                Acesse o módulo de Aprovações para liberar o acesso dos novos parceiros.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('aprovacoes')}
            className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shrink-0 transition-all"
          >
            Analisar Agora
          </button>
        </div>
      )}

      {/* KPIs Financeiros & Operacionais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400 uppercase font-bold">
              Cotações em Negociação:
            </span>
            <Clock className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-sky-400 font-mono mt-2">
            R$ {totalCotado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {orders.filter((o) => o.status === 'cotacao_enviada').length} propostas em análise por clientes
          </div>
        </div>

        {/* Card 2 */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400 uppercase font-bold">
              Ordens em Produção (OPs):
            </span>
            <Factory className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono mt-2">
            R$ {totalEmFabricacao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Processando corte, laminação e têmpera
          </div>
        </div>

        {/* Card 3 */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400 uppercase font-bold">
              Faturamento do Mês:
            </span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-2">
            R$ {faturamentoRealizado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Remessas liberadas com Certificado 3.1
          </div>
        </div>

        {/* Card 4 */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400 uppercase font-bold">
              Empresas Homologadas:
            </span>
            <Building2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono mt-2">
            {companies.length}
          </div>
          <div className="text-[11px] text-cyan-400 font-semibold mt-1">
            Clientes e Fornecedores Ativos
          </div>
        </div>
      </div>

      {/* Grid: Pipeline Comercial (Funil) + Atividades de Engenharia */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Comercial / Funil de Vendas (2 Colunas) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <h2 className="text-base font-extrabold text-white">
                Funil de Vendas de Fixadores Especiais
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('pedidos')}
              className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-bold"
            >
              Ver Todos no CRM <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {/* Etapa 1 */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-sky-400">1. Cotações Enviadas</span>
                <span className="font-mono text-slate-300 font-bold">
                  {orders.filter((o) => o.status === 'cotacao_enviada').length} cotações
                </span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                <div className="bg-sky-500 h-2 rounded-full" style={{ width: '45%' }} />
              </div>
            </div>

            {/* Etapa 2 */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-emerald-400">2. Aprovado pelo Cliente</span>
                <span className="font-mono text-slate-300 font-bold">
                  {orders.filter((o) => o.status === 'aprovado_cliente').length} pedidos
                </span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '30%' }} />
              </div>
            </div>

            {/* Etapa 3 */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-amber-400">3. Em Fabricação / OP</span>
                <span className="font-mono text-slate-300 font-bold">
                  {orders.filter((o) => o.status === 'em_fabricacao').length} ordens de produção
                </span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: '60%' }} />
              </div>
            </div>

            {/* Etapa 4 */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-indigo-400">4. Pronto / Controle de Qualidade</span>
                <span className="font-mono text-slate-300 font-bold">
                  {orders.filter((o) => o.status === 'pronto_cq').length} lotes inspecionados
                </span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '25%' }} />
              </div>
            </div>

            {/* Etapa 5 */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-teal-400">5. Faturado / Expedido</span>
                <span className="font-mono text-slate-300 font-bold">
                  {orders.filter((o) => o.status === 'faturado_expedido').length} remessas entregues
                </span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                <div className="bg-teal-500 h-2 rounded-full" style={{ width: '85%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Painel Lateral: Atalhos do Sistema & Recursos Fabris (1 Coluna) */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <h2 className="text-base font-extrabold text-white flex items-center gap-2">
            <Boxes className="w-4 h-4 text-amber-400" />
            Ecossistema de Produção
          </h2>

          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => onNavigate('produtos')}
              className="w-full p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-cyan-600/50 text-left transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-400">
                  Configurador Paramétrico
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Dimensionamento de parafusos com sobremetal, classes de aço e cálculo de peso.
              </p>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('desenho')}
              className="w-full p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-sky-600/50 text-left transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 group-hover:text-sky-400">
                  Prancha Técnica CAD 2D A3
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Folha técnica com vista 3D axonométrica, tolerâncias fabris e download de PDF.
              </p>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('pcp_estrutura')}
              className="w-full p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-emerald-600/50 text-left transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 group-hover:text-emerald-400">
                  Aproveitamento em Barras 6m
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Cálculo de rendimento de barras comerciais de 6 metros e sucata de serra.
              </p>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('normas')}
              className="w-full p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-amber-600/50 text-left transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 group-hover:text-amber-400">
                  Base Normativa & IA
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Consulta e cadastro de normas DIN, ASTM, ISO e ABNT NBR.
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
