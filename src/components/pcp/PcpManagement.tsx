// src/components/pcp/PcpManagement.tsx - Módulo de PCP & Manufatura (Estrutura BOM, Codificação de Aço, Roteiros & Recursos)
'use client';

import React, { useState, useEffect } from 'react';
import { RawMaterialItem } from '@/lib/types/commercial';
import {
  getSavedRawMaterials,
  saveRawMaterial,
  deleteRawMaterial
} from '@/lib/services/commercialService';
import { SteelColorBadge } from '@/components/ui/SteelColorBadge';
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
  PackageCheck,
  LayoutGrid,
  Table as TableIcon,
  Palette,
  Plus,
  Trash2,
  Edit,
  Tag,
  Search,
  Filter,
  Check
} from 'lucide-react';

interface PcpManagementProps {
  initialSubTab?: 'estrutura' | 'materiais' | 'roteiros' | 'recursos';
}

const PRESET_COLORS = [
  { name: 'Branco', hex: '#ffffff' },
  { name: 'Vermelho', hex: '#dc2626' },
  { name: 'Verde', hex: '#16a34a' },
  { name: 'Verde Escuro', hex: '#14532d' },
  { name: 'Amarelo', hex: '#eab308' },
  { name: 'Laranja', hex: '#ea580c' },
  { name: 'Azul', hex: '#2563eb' },
  { name: 'Azul Escuro / Preto', hex: '#0f172a' },
  { name: 'Ciano / Azul Claro', hex: '#06b6d4' }
];

export function PcpManagement({ initialSubTab = 'estrutura' }: PcpManagementProps) {
  const [activeSubTab, setActiveSubTab] = useState<'estrutura' | 'materiais' | 'roteiros' | 'recursos'>(
    initialSubTab
  );

  // View modes para cada seção
  const [materialsViewMode, setMaterialsViewMode] = useState<'cards' | 'table'>('cards');
  const [recursosViewMode, setRecursosViewMode] = useState<'cards' | 'table'>('cards');
  const [roteirosViewMode, setRoteirosViewMode] = useState<'cards' | 'table'>('cards');

  // Matérias-Primas State
  const [rawMaterials, setRawMaterials] = useState<RawMaterialItem[]>([]);
  const [materialSearch, setMaterialSearch] = useState('');
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<RawMaterialItem | null>(null);

  // Form Fields - Matéria-Prima
  const [formCodigo, setFormCodigo] = useState('');
  const [formTipoMaterial, setFormTipoMaterial] = useState<RawMaterialItem['tipo_material']>(
    'Barra de aço redonda'
  );
  const [formEspecificacaoAco, setFormEspecificacaoAco] = useState('SAE 1045');
  const [formCorPrimariaNome, setFormCorPrimariaNome] = useState('Vermelho');
  const [formCorPrimariaHex, setFormCorPrimariaHex] = useState('#dc2626');
  const [formIsBicolor, setFormIsBicolor] = useState(false);
  const [formCorSecundariaNome, setFormCorSecundariaNome] = useState('Amarelo');
  const [formCorSecundariaHex, setFormCorSecundariaHex] = useState('#eab308');
  const [formFornecedor, setFormFornecedor] = useState('Gerdau Usina Ouro Branco');
  const [formObservacoes, setFormObservacoes] = useState('');

  // Exemplo de cálculo de barra de 6 metros
  const [comprimentoPeca, setComprimentoPeca] = useState(120);
  const [alturaCabeca, setAlturaCabeca] = useState(12.5);
  const [sobremetal, setSobremetal] = useState(15);
  const [larguraCorteSerra, setLarguraCorteSerra] = useState(3.0); // mm

  useEffect(() => {
    setRawMaterials(getSavedRawMaterials());
  }, []);

  const tarugoTotal = comprimentoPeca + alturaCabeca + sobremetal;
  const pecaComSerra = tarugoTotal + larguraCorteSerra;
  const pecasPorBarra6m = Math.floor(6000 / pecaComSerra);
  const retalhoPontaMm = Number((6000 - pecasPorBarra6m * pecaComSerra).toFixed(1));
  const aproveitamentoPerc = Number(((pecasPorBarra6m * tarugoTotal * 100) / 6000).toFixed(1));
  const barrasPorMilheiro = Math.ceil(1000 / (pecasPorBarra6m || 1));

  const handleOpenNewMaterial = () => {
    setEditingMaterial(null);
    setFormCodigo(`MP-0${rawMaterials.length + 1}`);
    setFormTipoMaterial('Barra de aço redonda');
    setFormEspecificacaoAco('');
    setFormCorPrimariaNome('Vermelho');
    setFormCorPrimariaHex('#dc2626');
    setFormIsBicolor(false);
    setFormCorSecundariaNome('Amarelo');
    setFormCorSecundariaHex('#eab308');
    setFormFornecedor('Gerdau Usina Ouro Branco');
    setFormObservacoes('');
    setIsMaterialModalOpen(true);
  };

  const handleOpenEditMaterial = (mat: RawMaterialItem) => {
    setEditingMaterial(mat);
    setFormCodigo(mat.codigo);
    setFormTipoMaterial(mat.tipo_material);
    setFormEspecificacaoAco(mat.especificacao_aco);
    setFormCorPrimariaNome(mat.cor_primaria_nome);
    setFormCorPrimariaHex(mat.cor_primaria_hex);
    setFormIsBicolor(mat.is_bicolor);
    setFormCorSecundariaNome(mat.cor_secundaria_nome || 'Amarelo');
    setFormCorSecundariaHex(mat.cor_secundaria_hex || '#eab308');
    setFormFornecedor(mat.fornecedor_homologado || '');
    setFormObservacoes(mat.observacoes || '');
    setIsMaterialModalOpen(true);
  };

  const handleSaveMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    const newMat: RawMaterialItem = {
      id: editingMaterial ? editingMaterial.id : `mat-${Date.now()}`,
      codigo: formCodigo,
      tipo_material: formTipoMaterial,
      especificacao_aco: formEspecificacaoAco,
      cor_primaria_nome: formCorPrimariaNome,
      cor_primaria_hex: formCorPrimariaHex,
      is_bicolor: formIsBicolor,
      cor_secundaria_nome: formIsBicolor ? formCorSecundariaNome : undefined,
      cor_secundaria_hex: formIsBicolor ? formCorSecundariaHex : undefined,
      comprimento_padrao_mm: 6000,
      densidade_g_cm3: formEspecificacaoAco.startsWith('AISI') ? 7.95 : 7.85,
      fornecedor_homologado: formFornecedor,
      observacoes: formObservacoes
    };

    const updated = saveRawMaterial(newMat);
    setRawMaterials(updated);
    setIsMaterialModalOpen(false);
  };

  const handleDeleteMaterial = (id: string, name: string) => {
    if (confirm(`Deseja remover o cadastro do material "${name}"?`)) {
      const updated = deleteRawMaterial(id);
      setRawMaterials(updated);
    }
  };

  const filteredMaterials = rawMaterials.filter(
    (m) =>
      m.especificacao_aco.toLowerCase().includes(materialSearch.toLowerCase()) ||
      m.tipo_material.toLowerCase().includes(materialSearch.toLowerCase()) ||
      m.codigo.toLowerCase().includes(materialSearch.toLowerCase()) ||
      m.cor_primaria_nome.toLowerCase().includes(materialSearch.toLowerCase())
  );

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
            Controle de estrutura de materiais (BOM), codificação de aços por cor nas pontas das barras, roteiros e centros de trabalho.
          </p>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
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
            onClick={() => setActiveSubTab('materiais')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'materiais'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Palette className="w-3.5 h-3.5 text-amber-400" />
            <span>Codificação de Aços</span>
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
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <Scissors className="w-4 h-4 text-cyan-400" />
                Calculadora & Otimizador de Barras Comerciais de 6 Metros (6.000 mm)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Dimensione o corte do tarugo bruto considerando o sobremetal de usinagem e o rasgo da serra.
              </p>
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
          SUB-TAB 2: CODIFICAÇÃO DE AÇOS & MATÉRIAS-PRIMAS (PONTAS PINTADAS)
          --------------------------------------------------------------------- */}
      {activeSubTab === 'materiais' && (
        <div className="space-y-6">
          {/* Header com Busca, View Toggle e Botão Novo */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <div className="relative w-full max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                value={materialSearch}
                onChange={(e) => setMaterialSearch(e.target.value)}
                placeholder="Buscar por liga de aço (ex: SAE 1045, 4140, AISI 316, cor...)"
                className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              {/* Toggle Cards / Tabela */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setMaterialsViewMode('cards')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    materialsViewMode === 'cards'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Visualizar em Cards"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Cards</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMaterialsViewMode('table')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    materialsViewMode === 'table'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Visualizar em Tabela"
                >
                  <TableIcon className="w-3.5 h-3.5" />
                  <span>Tabela</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleOpenNewMaterial}
                className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-950/60 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>+ Novo Aço / Matéria-Prima</span>
              </button>
            </div>
          </div>

          {/* Placa Guia Visual Oficial da Fábrica (Como na Foto) */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-red-950/60 border border-red-800 text-red-400">
                <Palette className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white tracking-wide uppercase">
                  Padrão Fabril DeltaFix: Codificação Visual de Pontas de Barras
                </h3>
                <p className="text-xs text-slate-400">
                  Identificação imediata por cor nas extremidades das barras de aço redondas para prevenir mistura no chão de fábrica.
                </p>
              </div>
            </div>
          </div>

          {/* OPÇÃO 1: CARDS DE AÇO */}
          {materialsViewMode === 'cards' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredMaterials.map((mat) => (
                <div
                  key={mat.id}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        {/* Bolinha com Cor Oficial da Fábrica */}
                        <SteelColorBadge
                          corPrimariaHex={mat.cor_primaria_hex}
                          isBicolor={mat.is_bicolor}
                          corSecundariaHex={mat.cor_secundaria_hex}
                          size={32}
                          title={`${mat.especificacao_aco}: ${mat.cor_primaria_nome} ${
                            mat.is_bicolor ? `/ ${mat.cor_secundaria_nome}` : ''
                          }`}
                        />
                        <div>
                          <h4 className="text-base font-black text-white">{mat.especificacao_aco}</h4>
                          <span className="text-[10px] font-mono text-cyan-400 font-bold block">
                            {mat.tipo_material}
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono text-slate-500 font-bold">
                        {mat.codigo}
                      </span>
                    </div>

                    <div className="mt-3 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-[10px] font-mono text-slate-500 uppercase">
                          Cor da Ponta:
                        </span>
                        <span className="font-bold text-slate-200">
                          {mat.cor_primaria_nome}{' '}
                          {mat.is_bicolor && (
                            <span className="text-amber-400">/ {mat.cor_secundaria_nome} (Bicolor)</span>
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[10px] font-mono text-slate-500 uppercase">
                          Comprimento:
                        </span>
                        <span className="text-slate-300 font-mono">{mat.comprimento_padrao_mm} mm (6m)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[10px] font-mono text-slate-500 uppercase">
                          Densidade:
                        </span>
                        <span className="text-slate-300 font-mono">{mat.densidade_g_cm3} g/cm³</span>
                      </div>
                    </div>

                    {mat.observacoes && (
                      <p className="text-[11px] text-slate-400 mt-2 line-clamp-2">
                        {mat.observacoes}
                      </p>
                    )}
                  </div>

                  <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 truncate max-w-[140px]">
                      {mat.fornecedor_homologado || 'Gerdau'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEditMaterial(mat)}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400"
                        title="Editar"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteMaterial(mat.id, mat.especificacao_aco)}
                        className="p-1 rounded bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-300"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* OPÇÃO 2: TABELA DE AÇOS */}
          {materialsViewMode === 'table' && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-[10px] font-mono uppercase text-slate-400 border-b border-slate-800 sticky top-0">
                    <tr>
                      <th className="py-3 px-4">Ponta Pintada</th>
                      <th className="py-3 px-4">Especificação do Aço</th>
                      <th className="py-3 px-4">Tipo de Material</th>
                      <th className="py-3 px-4">Cores de Identificação</th>
                      <th className="py-3 px-4 font-mono">Barra Padrão</th>
                      <th className="py-3 px-4 font-mono">Densidade</th>
                      <th className="py-3 px-4">Fornecedor Homologado</th>
                      <th className="py-3 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 font-sans">
                    {filteredMaterials.map((mat) => (
                      <tr key={mat.id} className="hover:bg-slate-800/40 transition-colors">
                        {/* Bolinha de Cor */}
                        <td className="py-3 px-4">
                          <SteelColorBadge
                            corPrimariaHex={mat.cor_primaria_hex}
                            isBicolor={mat.is_bicolor}
                            corSecundariaHex={mat.cor_secundaria_hex}
                            size={26}
                          />
                        </td>

                        {/* Especificação do Aço */}
                        <td className="py-3 px-4 font-black text-white whitespace-nowrap">
                          {mat.especificacao_aco}
                          <span className="block text-[10px] font-mono font-normal text-slate-500">
                            {mat.codigo}
                          </span>
                        </td>

                        {/* Tipo de Material */}
                        <td className="py-3 px-4 text-cyan-400 font-semibold whitespace-nowrap">
                          {mat.tipo_material}
                        </td>

                        {/* Cores */}
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-200">{mat.cor_primaria_nome}</span>
                          {mat.is_bicolor && (
                            <span className="text-amber-400 font-semibold">
                              {' '}
                              + {mat.cor_secundaria_nome} (Meia-a-Meia)
                            </span>
                          )}
                        </td>

                        {/* Barra */}
                        <td className="py-3 px-4 font-mono text-slate-300 whitespace-nowrap">
                          {mat.comprimento_padrao_mm} mm (6m)
                        </td>

                        {/* Densidade */}
                        <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                          {mat.densidade_g_cm3} g/cm³
                        </td>

                        {/* Fornecedor */}
                        <td className="py-3 px-4 text-slate-300 max-w-xs truncate">
                          {mat.fornecedor_homologado || 'Gerdau'}
                        </td>

                        {/* Ações */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEditMaterial(mat)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400"
                              title="Editar aço"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteMaterial(mat.id, mat.especificacao_aco)}
                              className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-300"
                              title="Excluir aço"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------------------------
          SUB-TAB 3: ROTEIROS DE OPERAÇÃO MES (CARDS E TABELA)
          --------------------------------------------------------------------- */}
      {activeSubTab === 'roteiros' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  Sequenciamento Padrão de Fabricação de Fixadores Especiais
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Roteiro técnico industrial com postos de trabalho, tempos de setup e ciclo por milheiro.
                </p>
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setRoteirosViewMode('cards')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    roteirosViewMode === 'cards'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Cards</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRoteirosViewMode('table')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    roteirosViewMode === 'table'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <TableIcon className="w-3.5 h-3.5" />
                  <span>Tabela</span>
                </button>
              </div>
            </div>

            {/* Roteiros em Cards */}
            {roteirosViewMode === 'cards' ? (
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
            ) : (
              /* Roteiros em Tabela */
              <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 text-[10px] font-mono uppercase text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Seq</th>
                      <th className="py-2.5 px-3">Operação Industrial</th>
                      <th className="py-2.5 px-3">Centro de Trabalho</th>
                      <th className="py-2.5 px-3">Setup</th>
                      <th className="py-2.5 px-3">Tempo Ciclo</th>
                      <th className="py-2.5 px-3">Critério de CQ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {[
                      {
                        seq: '010',
                        op: 'Corte de Tarugos Brutos em Barra Comercial 6m',
                        recurso: 'Serra de Fita Automática CNC',
                        setup: '25 min',
                        ciclo: '18 seg/peça',
                        cq: 'Comprimento do tarugo com sobremetal (±0.5mm)'
                      },
                      {
                        seq: '020',
                        op: 'Usinagem de Cabeceamento / Sextavado / Rebaixo',
                        recurso: 'Torno CNC de Produção Rápida',
                        setup: '45 min',
                        ciclo: '35 seg/peça',
                        cq: 'Chave (s) e altura de cabeça (k)'
                      },
                      {
                        seq: '030',
                        op: 'Chanframento de Entrada de Rosca (45°)',
                        recurso: 'Chanfradeira Automática Delta',
                        setup: '15 min',
                        ciclo: '6 seg/peça',
                        cq: 'Inspeção visual de rebarbas'
                      },
                      {
                        seq: '040',
                        op: 'Laminação de Rosca a Frio por Rolos Hidráulicos',
                        recurso: 'Laminadora Hidráulica 30 Toneladas',
                        setup: '40 min',
                        ciclo: '8 seg/peça',
                        cq: 'Calibre passa/não-passa 6g / 2A'
                      },
                      {
                        seq: '050',
                        op: 'Tratamento Térmico de Têmpera & Revenimento',
                        recurso: 'Forno Contínuo c/ Atmosfera Controlada',
                        setup: '60 min',
                        ciclo: 'Lote contínuo',
                        cq: 'Dureza Rockwell C (HRC) e Tração'
                      },
                      {
                        seq: '060',
                        op: 'Tratamento Superficial (Galvanização/Geomet)',
                        recurso: 'Linha Química Automatizada de Banhos',
                        setup: '30 min',
                        ciclo: 'Tambor rotativo',
                        cq: 'Espessura de camada (µm) e Salt Spray'
                      },
                      {
                        seq: '070',
                        op: 'Inspeção Final CQ & Embalagem com Certificado 3.1',
                        recurso: 'Bancada de Controle de Qualidade',
                        setup: '10 min',
                        ciclo: 'Amostragem',
                        cq: 'Certificado 3.1 com corrida de aço'
                      }
                    ].map((rt) => (
                      <tr key={rt.seq} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-mono font-bold text-cyan-400">{rt.seq}</td>
                        <td className="py-2.5 px-3 font-bold text-white">{rt.op}</td>
                        <td className="py-2.5 px-3 text-cyan-300">{rt.recurso}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-300">{rt.setup}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">{rt.ciclo}</td>
                        <td className="py-2.5 px-3 text-amber-300 text-[11px]">{rt.cq}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------
          SUB-TAB 4: RECURSOS FABRIS AGRUPADOS (CARDS E TABELA)
          --------------------------------------------------------------------- */}
      {activeSubTab === 'recursos' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              Centros de Trabalho & Recursos de Usinagem / Laminação
            </h2>

            {/* Toggle Cards / Tabela */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setRecursosViewMode('cards')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  recursosViewMode === 'cards'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setRecursosViewMode('table')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  recursosViewMode === 'table'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Tabela</span>
              </button>
            </div>
          </div>

          {recursosViewMode === 'cards' ? (
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
          ) : (
            /* Tabela de Recursos Fabris */
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-[10px] font-mono uppercase text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Código</th>
                    <th className="py-3 px-4">Centro de Trabalho</th>
                    <th className="py-3 px-4">Capacidade Fabril</th>
                    <th className="py-3 px-4">Máquinas Homologadas</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {[
                    {
                      codigo: 'CC-01',
                      nome: 'Corte & Serras de Fita CNC',
                      cap: 'Barras de 6m até Ø 150mm',
                      maqs: 'Franho CNC 350, Kasto 420',
                      st: 'Operando'
                    },
                    {
                      codigo: 'US-02',
                      nome: 'Tornos CNC & Cabeceamento',
                      cap: 'Comprimentos até 1.000mm',
                      maqs: 'Romi Centur 35D, Puma GT2100, Galaxy B500',
                      st: 'Operando'
                    },
                    {
                      codigo: 'LM-03',
                      nome: 'Laminação de Roscas a Frio',
                      cap: 'M5 a M64 / 1/4" a 2.1/2"',
                      maqs: 'Izpe 30T, Hidráulica 50T',
                      st: 'Operando'
                    },
                    {
                      codigo: 'TT-04',
                      nome: 'Tratamento Térmico (Têmpera)',
                      cap: '1.200 kg / hora',
                      maqs: 'Forno Contínuo de Esteira',
                      st: 'Operando'
                    },
                    {
                      codigo: 'GALV-05',
                      nome: 'Revestimento Superficial',
                      cap: 'Galvanização a Fogo, Geomet e Zinco',
                      maqs: 'Linha Imersão a Quente 450°C, Centrífuga Geomet',
                      st: 'Operando'
                    },
                    {
                      codigo: 'LAB-06',
                      nome: 'Laboratório & Controle CQ',
                      cap: 'Ensaios Destrutivos e Não-Destrutivos',
                      maqs: 'Máquina Tração 100T, Durômetro Rockwell',
                      st: 'Operando'
                    }
                  ].map((r) => (
                    <tr key={r.codigo} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono font-bold text-cyan-400">{r.codigo}</td>
                      <td className="py-3 px-4 font-bold text-white">{r.nome}</td>
                      <td className="py-3 px-4 text-slate-300">{r.cap}</td>
                      <td className="py-3 px-4 text-slate-400">{r.maqs}</td>
                      <td className="py-3 px-4 text-right">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                          {r.st}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          MODAL DE CADASTRO / EDIÇÃO DE AÇO & MATÉRIA-PRIMA
          ========================================================================= */}
      {isMaterialModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Palette className="w-5 h-5 text-amber-400" />
                {editingMaterial ? 'Editar Codificação de Aço' : 'Cadastrar Matéria-Prima & Cor'}
              </h3>
              <button
                type="button"
                onClick={() => setIsMaterialModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMaterial} className="space-y-4 text-xs">
              {/* Preview da Bolinha com a Cor em Tempo Real */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase block font-bold">
                    Identificação Visual da Ponta da Barra:
                  </span>
                  <div className="text-xs font-bold text-white mt-0.5">
                    {formEspecificacaoAco || 'Novo Aço'}: {formCorPrimariaNome}{' '}
                    {formIsBicolor && `+ ${formCorSecundariaNome}`}
                  </div>
                </div>

                <SteelColorBadge
                  corPrimariaHex={formCorPrimariaHex}
                  isBicolor={formIsBicolor}
                  corSecundariaHex={formCorSecundariaHex}
                  size={38}
                />
              </div>

              {/* Código & Tipo de Material */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                    Código Interno:
                  </label>
                  <input
                    type="text"
                    required
                    value={formCodigo}
                    onChange={(e) => setFormCodigo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                    Tipo de Material:
                  </label>
                  <select
                    value={formTipoMaterial}
                    onChange={(e) => setFormTipoMaterial(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-bold"
                  >
                    <option value="Barra de aço redonda">Barra de aço redonda</option>
                    <option value="Barra sextavada">Barra sextavada</option>
                    <option value="Barra chata">Barra chata</option>
                    <option value="Tubo mecânico">Tubo mecânico</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
              </div>

              {/* Especificação do Aço */}
              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                  Especificação da Liga do Aço (ex: SAE 1045, SAE 4140, AISI 316):
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: SAE 1045 ou SAE 4340"
                  value={formEspecificacaoAco}
                  onChange={(e) => setFormEspecificacaoAco(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-bold"
                />
              </div>

              {/* Cor Primária */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono text-slate-400 uppercase block">
                    Cor Primária da Ponta:
                  </label>
                  <span className="text-[10px] font-mono text-slate-300 font-bold">{formCorPrimariaNome}</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formCorPrimariaHex}
                    onChange={(e) => {
                      setFormCorPrimariaHex(e.target.value);
                      setFormCorPrimariaNome('Personalizada');
                    }}
                    className="w-9 h-8 rounded bg-transparent cursor-pointer border border-slate-700"
                  />
                  {/* Presets Rápidos */}
                  <div className="flex flex-wrap gap-1">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => {
                          setFormCorPrimariaHex(c.hex);
                          setFormCorPrimariaNome(c.name);
                        }}
                        className={`w-6 h-6 rounded-full border transition-all ${
                          formCorPrimariaHex === c.hex ? 'ring-2 ring-cyan-400 scale-110' : 'border-slate-700'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Checkbox Bicolor */}
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-amber-300">
                  <input
                    type="checkbox"
                    checked={formIsBicolor}
                    onChange={(e) => setFormIsBicolor(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700"
                  />
                  <span>[✓] Bicolor (Duas Cores Meia-a-Meia na Ponta da Barra)</span>
                </label>

                {formIsBicolor && (
                  <div className="pt-2 border-t border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-mono text-slate-400 uppercase block">
                        Cor Secundária da Ponta (50% Split):
                      </label>
                      <span className="text-[10px] font-mono text-slate-300 font-bold">
                        {formCorSecundariaNome}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formCorSecundariaHex}
                        onChange={(e) => {
                          setFormCorSecundariaHex(e.target.value);
                          setFormCorSecundariaNome('Personalizada');
                        }}
                        className="w-9 h-8 rounded bg-transparent cursor-pointer border border-slate-700"
                      />
                      <div className="flex flex-wrap gap-1">
                        {PRESET_COLORS.map((c) => (
                          <button
                            key={c.name}
                            type="button"
                            onClick={() => {
                              setFormCorSecundariaHex(c.hex);
                              setFormCorSecundariaNome(c.name);
                            }}
                            className={`w-6 h-6 rounded-full border transition-all ${
                              formCorSecundariaHex === c.hex ? 'ring-2 ring-cyan-400 scale-110' : 'border-slate-700'
                            }`}
                            style={{ backgroundColor: c.hex }}
                            title={c.name}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Fornecedor Homologado */}
              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                  Fornecedor / Usina Homologada:
                </label>
                <input
                  type="text"
                  value={formFornecedor}
                  onChange={(e) => setFormFornecedor(e.target.value)}
                  placeholder="Ex: Gerdau Usina Ouro Branco"
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                />
              </div>

              {/* Botões */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsMaterialModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-bold uppercase tracking-wider"
                >
                  Salvar Material & Cor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
