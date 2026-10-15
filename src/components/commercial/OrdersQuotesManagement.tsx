// src/components/commercial/OrdersQuotesManagement.tsx - CRM & Gestão de Pedidos e Cotações de Fixadores
'use client';

import React, { useState, useEffect } from 'react';
import {
  SalesOrderQuote,
  OrderStatus,
  OrderItem,
  CompanyPartner
} from '@/lib/types/commercial';
import {
  getSavedOrders,
  saveOrder,
  updateOrderStatus,
  getSavedCompanies
} from '@/lib/services/commercialService';
import {
  FileText,
  Plus,
  Search,
  Filter,
  ArrowRight,
  CheckCircle2,
  Clock,
  Factory,
  CheckSquare,
  Truck,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Eye,
  Trash2,
  Calendar,
  Building,
  User,
  ShieldAlert,
  Download,
  LayoutGrid,
  Table as TableIcon
} from 'lucide-react';

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; bg: string; text: string; border: string; icon: any }
> = {
  cotacao_enviada: {
    label: 'Cotação Enviada',
    bg: 'bg-sky-950/80',
    text: 'text-sky-300',
    border: 'border-sky-700',
    icon: Clock
  },
  aprovado_cliente: {
    label: 'Aprovado pelo Cliente',
    bg: 'bg-emerald-950/80',
    text: 'text-emerald-300',
    border: 'border-emerald-700',
    icon: CheckCircle2
  },
  em_fabricacao: {
    label: 'Em Fabricação / OP',
    bg: 'bg-amber-950/80',
    text: 'text-amber-300',
    border: 'border-amber-700',
    icon: Factory
  },
  pronto_cq: {
    label: 'Pronto / CQ',
    bg: 'bg-indigo-950/80',
    text: 'text-indigo-300',
    border: 'border-indigo-700',
    icon: CheckSquare
  },
  faturado_expedido: {
    label: 'Faturado / Expedido',
    bg: 'bg-teal-950/80',
    text: 'text-teal-300',
    border: 'border-teal-700',
    icon: Truck
  }
};

const STATUS_ORDER: OrderStatus[] = [
  'cotacao_enviada',
  'aprovado_cliente',
  'em_fabricacao',
  'pronto_cq',
  'faturado_expedido'
];

function KanbanIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="5" height="14" x="3" y="5" rx="1" />
      <rect width="5" height="10" x="10" y="5" rx="1" />
      <rect width="5" height="15" x="17" y="5" rx="1" />
    </svg>
  );
}

export function OrdersQuotesManagement() {
  const [orders, setOrders] = useState<SalesOrderQuote[]>([]);
  const [companies, setCompanies] = useState<CompanyPartner[]>([]);
  const [activeTabStatus, setActiveTabStatus] = useState<'all' | OrderStatus>('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'cards' | 'table'>('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<SalesOrderQuote | null>(null);

  // Form Fields - Nova Cotação / Pedido
  const [formTipo, setFormTipo] = useState<'cotacao' | 'pedido'>('cotacao');
  const [formCompanyId, setFormCompanyId] = useState('');
  const [formPrazoDias, setFormPrazoDias] = useState(15);
  const [formCondicaoPagto, setFormCondicaoPagto] = useState('30 DDL');
  const [formObservacoes, setFormObservacoes] = useState('');
  const [formItens, setFormItens] = useState<OrderItem[]>([
    {
      id: 'item-init-1',
      tipo_item: 'padrao',
      descricao: 'Parafuso Sextavado ABNT NBR 10115 / DIN 931 M20 x 120mm Classe 8.8',
      standard_code: 'ABNT NBR 10115',
      bitola: 'M20',
      comprimento: 120,
      material: 'Aço Carbono SAE 1045',
      classe: '8.8',
      tratamento: 'Galvanizado a Fogo',
      quantidade: 500,
      preco_unitario: 14.8,
      preco_total: 7400.0
    }
  ]);

  useEffect(() => {
    setOrders(getSavedOrders());
    setCompanies(getSavedCompanies());
  }, []);

  // Cálculos de KPIs
  const totalCotado = orders
    .filter((o) => o.status === 'cotacao_enviada')
    .reduce((acc, curr) => acc + curr.valor_total, 0);

  const totalAprovadoEmProducao = orders
    .filter((o) => o.status === 'aprovado_cliente' || o.status === 'em_fabricacao')
    .reduce((acc, curr) => acc + curr.valor_total, 0);

  const faturamentoRealizado = orders
    .filter((o) => o.status === 'faturado_expedido' || o.status === 'pronto_cq')
    .reduce((acc, curr) => acc + curr.valor_total, 0);

  const pedidosEmAbertoCount = orders.filter((o) => o.status !== 'faturado_expedido').length;

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    const updated = updateOrderStatus(orderId, newStatus);
    setOrders(updated);
    if (selectedOrderDetails?.id === orderId) {
      setSelectedOrderDetails({ ...selectedOrderDetails, status: newStatus });
    }
  };

  const handleMoveStatus = (orderId: string, direction: 'prev' | 'next') => {
    const ord = orders.find((o) => o.id === orderId);
    if (!ord) return;
    const currentIdx = STATUS_ORDER.indexOf(ord.status);
    if (currentIdx === -1) return;
    const nextIdx = direction === 'next' ? currentIdx + 1 : currentIdx - 1;
    if (nextIdx >= 0 && nextIdx < STATUS_ORDER.length) {
      handleStatusChange(orderId, STATUS_ORDER[nextIdx]);
    }
  };

  const handleAddItem = () => {
    const newItem: OrderItem = {
      id: `item-${Date.now()}`,
      tipo_item: 'padrao',
      descricao: 'Fixador Industrial Sob Norma',
      standard_code: 'DIN 933',
      bitola: 'M16',
      comprimento: 60,
      material: 'Aço Liga SAE 4140',
      classe: '10.9',
      tratamento: 'Oxidado Negro',
      quantidade: 100,
      preco_unitario: 12.5,
      preco_total: 1250.0
    };
    setFormItens([...formItens, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    if (formItens.length === 1) return;
    setFormItens(formItens.filter((i) => i.id !== id));
  };

  const handleUpdateItem = (id: string, field: keyof OrderItem, val: any) => {
    setFormItens((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: val };
          if (field === 'quantidade' || field === 'preco_unitario') {
            updated.preco_total = Number((updated.quantidade * updated.preco_unitario).toFixed(2));
          }
          return updated;
        }
        return item;
      })
    );
  };

  const handleSaveOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clientComp = companies.find((c) => c.id === formCompanyId) || companies[0];
    if (!clientComp) {
      alert('Selecione uma empresa parceira cadastrada!');
      return;
    }

    const valorTotal = formItens.reduce((acc, curr) => acc + curr.preco_total, 0);
    const newDocId =
      formTipo === 'cotacao'
        ? `COT-${new Date().getFullYear()}-${String(orders.length + 1).padStart(4, '0')}`
        : `PED-${new Date().getFullYear()}-${String(orders.length + 1).padStart(4, '0')}`;

    const newOrder: SalesOrderQuote = {
      id: `ord-${Date.now()}`,
      codigo_documento: newDocId,
      tipo: formTipo,
      status: formTipo === 'cotacao' ? 'cotacao_enviada' : 'aprovado_cliente',
      company_id: clientComp.id,
      company_name: clientComp.razao_social,
      cnpj: clientComp.cnpj,
      data_abertura: new Date().toISOString().split('T')[0],
      prazo_dias: formPrazoDias,
      condicao_pagamento: formCondicaoPagto,
      itens: formItens,
      valor_total: valorTotal,
      responsavel_comercial: 'Edson Manoel',
      observacoes: formObservacoes
    };

    const updated = saveOrder(newOrder);
    setOrders(updated);
    setIsModalOpen(false);
  };

  // Filtragem
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.codigo_documento.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.cnpj.includes(searchTerm) ||
      o.itens.some((i) => i.descricao.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;
    if (activeTabStatus === 'all') return true;
    return o.status === activeTabStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-black text-white tracking-wide">
              CRM Comercial & Gestão de Pedidos / Cotações
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Pipeline industrial de fixadores: da cotação técnica à ordem de fabricação (OP) e faturamento.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (companies.length > 0) {
              setFormCompanyId(companies[0].id);
            }
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-cyan-950/60 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ Nova Cotação / Pedido</span>
        </button>
      </div>

      {/* KPI Cards: Pedidos em Aberto vs. Faturamento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Em Cotação */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-slate-400 uppercase block font-bold">
              Cotações em Aberto:
            </span>
            <div className="text-xl font-black text-sky-400 font-mono mt-1">
              R$ {totalCotado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-slate-500">
              {orders.filter((o) => o.status === 'cotacao_enviada').length} propostas enviadas
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-950/80 border border-sky-800/80 flex items-center justify-center text-sky-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Em Fabricação */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-slate-400 uppercase block font-bold">
              Em Fabricação / OPs:
            </span>
            <div className="text-xl font-black text-amber-400 font-mono mt-1">
              R$ {totalAprovadoEmProducao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-slate-500">
              {orders.filter((o) => o.status === 'em_fabricacao' || o.status === 'aprovado_cliente').length} ordens ativas
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-800/80 flex items-center justify-center text-amber-400">
            <Factory className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Faturamento do Mês */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-slate-400 uppercase block font-bold">
              Faturado / Expedido:
            </span>
            <div className="text-xl font-black text-emerald-400 font-mono mt-1">
              R$ {faturamentoRealizado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-slate-500">
              {orders.filter((o) => o.status === 'faturado_expedido').length} remessas entregues
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-800/80 flex items-center justify-center text-emerald-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Volume Total */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-slate-400 uppercase block font-bold">
              Total de Pedidos Ativos:
            </span>
            <div className="text-xl font-black text-white font-mono mt-1">
              {pedidosEmAbertoCount}
            </div>
            <span className="text-[10px] text-cyan-400 font-semibold">
              Rastreamento 100% Digital
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-800/80 flex items-center justify-center text-cyan-400">
            <FileText className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Pipeline Funnel Tabs (5 Etapas Industriais) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 bg-slate-950/90 p-2 rounded-2xl border border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTabStatus('all')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all text-center ${
            activeTabStatus === 'all'
              ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Todos ({orders.length})
        </button>

        {(Object.keys(STATUS_CONFIG) as OrderStatus[]).map((st) => {
          const cfg = STATUS_CONFIG[st];
          const count = orders.filter((o) => o.status === st).length;
          const Icon = cfg.icon;
          return (
            <button
              key={st}
              type="button"
              onClick={() => setActiveTabStatus(st)}
              className={`px-2.5 py-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTabStatus === st
                  ? `${cfg.bg} ${cfg.text} border ${cfg.border} shadow-md`
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{cfg.label.split('/')[0]}</span>
              <span className="text-[10px] font-mono opacity-80">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Search Input & View Mode Toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filtrar por código de cotação/pedido, cliente ou descrição do fixador..."
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* View Mode Toggle: Kanban / Cards / Tabela */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 shrink-0 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('kanban')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              viewMode === 'kanban'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Exibir em formato de Funil Kanban (5 Etapas)"
          >
            <KanbanIcon className="w-3.5 h-3.5" />
            <span>Kanban</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('cards')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              viewMode === 'cards'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Exibir em formato de Cards"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Cards</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              viewMode === 'table'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Exibir em formato de Tabela detalhada"
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Tabela</span>
          </button>
        </div>
      </div>

      {/* Orders List: Kanban, Cards or Table */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5 items-start">
          {STATUS_ORDER.map((st, colIdx) => {
            const cfg = STATUS_CONFIG[st];
            const Icon = cfg.icon;
            const colOrders = filteredOrders.filter((o) => o.status === st);
            const colTotalValor = colOrders.reduce((sum, o) => sum + o.valor_total, 0);

            return (
              <div
                key={st}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex flex-col min-h-[580px] shadow-lg"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white leading-tight">
                        {colIdx + 1}. {cfg.label.split('/')[0].trim()}
                      </h4>
                      <div className="text-[10px] text-slate-500 font-mono">
                        R$ {colTotalValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${cfg.bg} ${cfg.text} border ${cfg.border}`}
                  >
                    {colOrders.length}
                  </span>
                </div>

                {/* Column Cards */}
                <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[72vh] pr-0.5">
                  {colOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 hover:border-slate-700 transition-all shadow-md group relative space-y-2.5"
                    >
                      {/* Header: Código + Tipo */}
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-black text-cyan-400">
                          {ord.codigo_documento}
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 uppercase font-bold border border-slate-800">
                          {ord.tipo}
                        </span>
                      </div>

                      {/* Cliente */}
                      <div>
                        <div
                          className="text-xs font-bold text-slate-200 line-clamp-1"
                          title={ord.company_name}
                        >
                          {ord.company_name}
                        </div>
                        <div className="text-[10px] font-mono text-slate-500">
                          CNPJ: {ord.cnpj}
                        </div>
                      </div>

                      {/* Resumo de Itens */}
                      <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-300">
                        <div className="flex items-center justify-between font-mono text-[10px] text-slate-400 mb-1">
                          <span>
                            {ord.itens.length} {ord.itens.length === 1 ? 'item' : 'itens'}
                          </span>
                          <span>Prazo: {ord.prazo_dias}d</span>
                        </div>
                        <div className="line-clamp-1 font-medium text-slate-300">
                          {ord.itens[0]?.descricao || 'Fixador Industrial'}
                        </div>
                      </div>

                      {/* Total & Ações */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-xs">
                        <div>
                          <span className="text-[9px] font-mono text-slate-500 block">Total</span>
                          <span className="font-mono font-bold text-emerald-400 text-[11px]">
                            R$ {ord.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          {colIdx > 0 && (
                            <button
                              type="button"
                              onClick={() => handleMoveStatus(ord.id, 'prev')}
                              className="px-1.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-[10px] font-bold"
                              title={`Voltar para ${STATUS_CONFIG[STATUS_ORDER[colIdx - 1]].label}`}
                            >
                              ◀
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setSelectedOrderDetails(ord)}
                            className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-800"
                            title="Ver detalhes da cotação/pedido"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {colIdx < STATUS_ORDER.length - 1 && (
                            <button
                              type="button"
                              onClick={() => handleMoveStatus(ord.id, 'next')}
                              className="px-1.5 py-1 rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-300 font-bold border border-cyan-800 text-[10px]"
                              title={`Avançar para ${STATUS_CONFIG[STATUS_ORDER[colIdx + 1]].label}`}
                            >
                              ▶
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {colOrders.length === 0 && (
                    <div className="p-6 text-center border border-dashed border-slate-800/80 rounded-xl text-slate-600 text-[11px]">
                      Nenhum pedido nesta fase
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : viewMode === 'cards' ? (
        <div className="space-y-3">
        {filteredOrders.map((ord) => {
          const cfg = STATUS_CONFIG[ord.status];
          const Icon = cfg.icon;

          return (
            <div
              key={ord.id}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
            >
              {/* Left Column: Identificação & Cliente */}
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-black font-mono text-cyan-400 tracking-wide">
                    {ord.codigo_documento}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border flex items-center gap-1 ${cfg.bg} ${cfg.text} ${cfg.border}`}
                  >
                    <Icon className="w-3 h-3" />
                    {cfg.label}
                  </span>
                  {ord.op_numero && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">
                      {ord.op_numero}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <Building className="w-4 h-4 text-slate-400" />
                  <span>{ord.company_name}</span>
                  <span className="text-xs text-slate-500 font-mono">CNPJ: {ord.cnpj}</span>
                </div>

                <div className="text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">Itens ({ord.itens.length}):</span>{' '}
                  {ord.itens.map((it) => it.descricao).join(' • ')}
                </div>
              </div>

              {/* Middle Column: Prazos e Condição */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 shrink-0">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">Abertura:</span>
                  <span className="font-mono text-slate-200">
                    {new Date(ord.data_abertura).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">Prazo:</span>
                  <span className="text-cyan-400 font-bold">{ord.prazo_dias} dias úteis</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">Condição:</span>
                  <span className="text-slate-300">{ord.condicao_pagamento}</span>
                </div>
              </div>

              {/* Right Column: Valor Total & Ações de Pipeline */}
              <div className="flex flex-col sm:flex-row items-end lg:items-center gap-3 shrink-0">
                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">Valor Total:</span>
                  <div className="text-lg font-black font-mono text-emerald-400">
                    R$ {ord.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>

                {/* Status Advancement Dropdown */}
                <div className="flex items-center gap-1.5">
                  <select
                    value={ord.status}
                    onChange={(e) => handleStatusChange(ord.id, e.target.value as OrderStatus)}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-bold"
                  >
                    <option value="cotacao_enviada">1. Cotação Enviada</option>
                    <option value="aprovado_cliente">2. Aprovado pelo Cliente</option>
                    <option value="em_fabricacao">3. Em Fabricação / OP</option>
                    <option value="pronto_cq">4. Pronto / CQ</option>
                    <option value="faturado_expedido">5. Faturado / Expedido</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => setSelectedOrderDetails(ord)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs"
                    title="Ver detalhes do pedido"
                  >
                    <Eye className="w-4 h-4 text-cyan-400" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredOrders.length === 0 && (
          <div className="p-10 text-center bg-slate-900/40 border border-slate-800 rounded-2xl">
            <FileText className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <div className="text-sm font-bold text-slate-300">Nenhum pedido ou cotação nesta etapa</div>
            <p className="text-xs text-slate-500 mt-1">
              Crie uma nova cotação através do botão acima para alimentar o pipeline de vendas.
            </p>
          </div>
        )}
      </div>
      ) : (
        /* VISUALIZAÇÃO EM TABELA COMPLETA DE PEDIDOS / COTAÇÕES */
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-[10px] font-mono uppercase text-slate-400 border-b border-slate-800 sticky top-0">
                <tr>
                  <th className="py-3 px-4">Código / Tipo</th>
                  <th className="py-3 px-4">Status no Pipeline</th>
                  <th className="py-3 px-4">Empresa Cliente / CNPJ</th>
                  <th className="py-3 px-4">Data Abertura</th>
                  <th className="py-3 px-4">Prazo / Condição</th>
                  <th className="py-3 px-4">Itens (Qtd)</th>
                  <th className="py-3 px-4 font-mono">Valor Total (R$)</th>
                  <th className="py-3 px-4 text-right">Avançar / Ver</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-sans">
                {filteredOrders.map((ord) => {
                  const cfg = STATUS_CONFIG[ord.status];
                  const Icon = cfg.icon;

                  return (
                    <tr key={ord.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Código Documento & Tipo */}
                      <td className="py-3 px-4 font-mono font-bold text-cyan-400 whitespace-nowrap">
                        {ord.codigo_documento}
                        {ord.op_numero && (
                          <span className="block text-[10px] text-amber-300 font-mono">
                            {ord.op_numero}
                          </span>
                        )}
                      </td>

                      {/* Status no Pipeline */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border inline-flex items-center gap-1 ${cfg.bg} ${cfg.text} ${cfg.border}`}
                        >
                          <Icon className="w-3 h-3" />
                          {cfg.label}
                        </span>
                      </td>

                      {/* Cliente / CNPJ */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-white leading-snug">{ord.company_name}</div>
                        <div className="text-[10px] font-mono text-slate-500">{ord.cnpj}</div>
                      </td>

                      {/* Data Abertura */}
                      <td className="py-3 px-4 font-mono text-slate-300 whitespace-nowrap">
                        {new Date(ord.data_abertura).toLocaleDateString('pt-BR')}
                      </td>

                      {/* Prazo & Condição */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-cyan-400 font-bold">{ord.prazo_dias} dias</span>
                        <span className="block text-[10px] text-slate-400">{ord.condicao_pagamento}</span>
                      </td>

                      {/* Itens */}
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-200">{ord.itens.length} item(ns)</span>
                        <div className="text-[10px] text-slate-400 max-w-xs truncate">
                          {ord.itens.map((i) => i.descricao).join(', ')}
                        </div>
                      </td>

                      {/* Valor Total */}
                      <td className="py-3 px-4 font-mono font-bold text-emerald-400 whitespace-nowrap">
                        R$ {ord.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>

                      {/* Ações */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <select
                            value={ord.status}
                            onChange={(e) => handleStatusChange(ord.id, e.target.value as OrderStatus)}
                            className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-slate-200 focus:outline-none focus:border-cyan-500 font-bold"
                          >
                            <option value="cotacao_enviada">1. Cotação</option>
                            <option value="aprovado_cliente">2. Aprovado</option>
                            <option value="em_fabricacao">3. Fabricação</option>
                            <option value="pronto_cq">4. Pronto/CQ</option>
                            <option value="faturado_expedido">5. Faturado</option>
                          </select>

                          <button
                            type="button"
                            onClick={() => setSelectedOrderDetails(ord)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400"
                            title="Ver detalhes"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL DE NOVA COTAÇÃO / PEDIDO INDUSTRIAL
          ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-cyan-400" />
                  Montagem de Cotação / Pedido Industrial
                </h3>
                <p className="text-xs text-slate-400">
                  Adicione fixadores padronizados por norma técnica ou itens especiais sob desenho do cliente.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveOrderSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              {/* Tipo e Cliente */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 font-bold uppercase mb-1">
                    Tipo de Documento:
                  </label>
                  <select
                    value={formTipo}
                    onChange={(e) => setFormTipo(e.target.value as 'cotacao' | 'pedido')}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-bold"
                  >
                    <option value="cotacao">Cotação Comercial (Proposta)</option>
                    <option value="pedido">Pedido de Venda Firme (Ordem de Compra)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-mono text-slate-300 font-bold uppercase mb-1">
                    Empresa Cliente (Pessoa Jurídica):
                  </label>
                  <select
                    value={formCompanyId}
                    onChange={(e) => setFormCompanyId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.razao_social} (CNPJ: {c.cnpj})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Prazo e Pagamento */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 font-bold uppercase mb-1">
                    Prazo de Fabricação / Entrega (Dias Úteis):
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formPrazoDias}
                    onChange={(e) => setFormPrazoDias(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 font-bold uppercase mb-1">
                    Condição de Pagamento:
                  </label>
                  <input
                    type="text"
                    value={formCondicaoPagto}
                    onChange={(e) => setFormCondicaoPagto(e.target.value)}
                    placeholder="Ex: 30 DDL, 45 DDL ou À Vista"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              {/* Itens do Pedido */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-cyan-400 uppercase">
                    Itens Industriais de Fixação ({formItens.length}):
                  </span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 text-xs font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar Fixador
                  </button>
                </div>

                <div className="space-y-2">
                  {formItens.map((it, idx) => (
                    <div
                      key={it.id}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono font-bold text-slate-400">Item #{idx + 1}</span>
                        <div className="flex items-center gap-2">
                          <select
                            value={it.tipo_item}
                            onChange={(e) => handleUpdateItem(it.id, 'tipo_item', e.target.value)}
                            className="bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-[11px] text-cyan-400 font-bold"
                          >
                            <option value="padrao">Padrão por Norma (DIN/ISO/ASTM)</option>
                            <option value="especial_desenho">Especial Sob Desenho</option>
                          </select>
                          {formItens.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(it.id)}
                              className="text-red-400 hover:text-red-300 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="sm:col-span-2">
                          <label className="text-[10px] text-slate-500 block">Descrição Técnica:</label>
                          <input
                            type="text"
                            value={it.descricao}
                            onChange={(e) => handleUpdateItem(it.id, 'descricao', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 block">Bitola / Rosca:</label>
                          <input
                            type="text"
                            value={it.bitola}
                            onChange={(e) => handleUpdateItem(it.id, 'bitola', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-500 block">Material / Aço:</label>
                          <input
                            type="text"
                            value={it.material}
                            onChange={(e) => handleUpdateItem(it.id, 'material', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 block">Quantidade (un):</label>
                          <input
                            type="number"
                            min={1}
                            value={it.quantidade}
                            onChange={(e) => handleUpdateItem(it.id, 'quantidade', Number(e.target.value))}
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 block">Preço Unit. (R$):</label>
                          <input
                            type="number"
                            step="0.01"
                            min={0}
                            value={it.preco_unitario}
                            onChange={(e) => handleUpdateItem(it.id, 'preco_unitario', Number(e.target.value))}
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 block">Subtotal (R$):</label>
                          <div className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs font-mono font-bold text-emerald-400">
                            R$ {it.preco_total.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totalizador */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400 uppercase font-bold">
                  Valor Total do Pedido:
                </span>
                <span className="text-xl font-black font-mono text-emerald-400">
                  R${' '}
                  {formItens
                    .reduce((acc, curr) => acc + curr.preco_total, 0)
                    .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Botões do Rodapé */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-black uppercase tracking-wider shadow-lg shadow-cyan-950/80 transition-all"
                >
                  Confirmar e Registrar Documento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL DE DETALHES DO PEDIDO / COTAÇÃO
          ========================================================================= */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono text-cyan-400 font-bold">
                  {selectedOrderDetails.codigo_documento}
                </span>
                <h3 className="text-base font-extrabold text-white">
                  {selectedOrderDetails.company_name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderDetails(null)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 block">STATUS ATUAL:</span>
                  <span className="font-bold text-cyan-400 uppercase">
                    {STATUS_CONFIG[selectedOrderDetails.status].label}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-slate-500 block">VALOR TOTAL:</span>
                  <span className="font-bold font-mono text-emerald-400">
                    R$ {selectedOrderDetails.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-slate-500 block">DATA DE ABERTURA:</span>
                  <span className="text-slate-200">
                    {new Date(selectedOrderDetails.data_abertura).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-slate-500 block">CONDIÇÃO DE PAGAMENTO:</span>
                  <span className="text-slate-200">{selectedOrderDetails.condicao_pagamento}</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-mono font-bold text-slate-300 block mb-1">
                  ITENS DO PEDIDO:
                </span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {selectedOrderDetails.itens.map((it, idx) => (
                    <div
                      key={it.id}
                      className="p-2.5 rounded bg-slate-950 border border-slate-800 flex justify-between items-center"
                    >
                      <div>
                        <div className="font-bold text-slate-200">{it.descricao}</div>
                        <div className="text-[11px] text-slate-400">
                          {it.quantidade} un • {it.material} • {it.classe}
                        </div>
                      </div>
                      <div className="text-right font-mono font-bold text-emerald-400">
                        R$ {it.preco_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedOrderDetails.observacoes && (
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-slate-400 text-xs">
                  <span className="font-bold text-slate-300 block mb-0.5">Observações Comerciais:</span>
                  {selectedOrderDetails.observacoes}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedOrderDetails(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
