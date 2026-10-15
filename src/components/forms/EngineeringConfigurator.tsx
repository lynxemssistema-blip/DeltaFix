// src/components/forms/EngineeringConfigurator.tsx - Dynamic Reactive Industrial Product Configurator
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  StandardFamily,
  ResistanceClass,
  BaseMaterial,
  SurfaceFinish,
  ProductItem,
  StandardDimension
} from '@/lib/standards/types';
import { DIN_STANDARDS, DIMENSIONS_MAP } from '@/lib/standards/din-data';
import { generateIndustrialSku } from '@/lib/calculators/sku-generator';
import { calculateFastenerWeight } from '@/lib/calculators/weight-calculator';
import { CadViewer } from '@/components/cad/CadViewer';
import { TechnicalDrawingSheet } from '@/components/cad/TechnicalDrawingSheet';
import { IndustrialCopilot } from '@/components/ai/IndustrialCopilot';
import { generateTechnicalDatasheetPdf } from '@/lib/export/pdf-generator';
import {
  Cpu,
  Layers,
  Wrench,
  Scale,
  FileText,
  Save,
  Download,
  Bot,
  CheckCircle2,
  AlertTriangle,
  Search,
  ListOrdered,
  History,
  TrendingDown,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
  Eye,
  EyeOff
} from 'lucide-react';

interface EngineeringConfiguratorProps {
  initialProducts?: ProductItem[];
}

export function EngineeringConfigurator({ initialProducts = [] }: EngineeringConfiguratorProps) {
  // 1. Core Configurator State
  const [family, setFamily] = useState<StandardFamily>('parafuso');
  const [standardCode, setStandardCode] = useState<string>('DIN 933');
  const [bitola, setBitola] = useState<string>('M20');
  const [comprimento, setComprimento] = useState<number>(80);
  const [classeResistencia, setClasseResistencia] = useState<ResistanceClass>('8.8');
  const [materialBase, setMaterialBase] = useState<BaseMaterial>('Aço Médio Carbono SAE 1045');
  const [tratamentoSuperficial, setTratamentoSuperficial] = useState<SurfaceFinish>('Zincado Branco (ZB)');
  const [codigoInternoDelta, setCodigoInternoDelta] = useState<string>('PF-ESP-M20-80');

  // 2. Active Tab State & Layout Controls
  const [activeTab, setActiveTab] = useState<'cad' | 'bom' | 'routing' | 'ai' | 'history'>('cad');
  const [cadMode, setCadMode] = useState<'nanquim_a3' | 'blueprint'>('nanquim_a3');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showKpis, setShowKpis] = useState(true);

  // 3. Persistence & History State
  const [savedProducts, setSavedProducts] = useState<ProductItem[]>(initialProducts);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // 4. Predictive search for Delta legacy code
  const [searchFilter, setSearchFilter] = useState('');

  // Available Standards filtered by Family
  const availableStandards = useMemo(() => {
    return DIN_STANDARDS.filter((s) => s.family === family);
  }, [family]);

  // Handle Family Switch: Auto-select default standard and bitola
  const handleFamilyChange = (newFamily: StandardFamily) => {
    setFamily(newFamily);
    if (newFamily === 'parafuso') {
      setStandardCode('DIN 933');
      setBitola('M20');
      setComprimento(80);
      setClasseResistencia('8.8');
    } else if (newFamily === 'porca') {
      setStandardCode('DIN 934');
      setBitola('M20');
      setClasseResistencia('Classe 8');
    } else if (newFamily === 'arruela') {
      setStandardCode('DIN 125A');
      setBitola('M20');
      setClasseResistencia('8.8');
    }
  };

  // Available Bitolas for the selected Standard
  const standardDimensions = DIMENSIONS_MAP[standardCode] || {};
  const availableBitolas = Object.keys(standardDimensions);

  // Selected Dimension Object
  const currentDimension: StandardDimension = standardDimensions[bitola] || {
    bitola,
    diametro_nominal: 20,
    passo: 2.5,
    chave: 30,
    altura_cabeca: 12.5,
    comprimentos_validos: [40, 50, 60, 70, 80, 90, 100]
  };

  // Valid Lengths for current standard & bitola
  const validLengths = currentDimension.comprimentos_validos || [];

  // 5. Reactive Physics & Weight Calculations
  const weightResult = useMemo(() => {
    return calculateFastenerWeight({
      family,
      standardCode,
      dimension: currentDimension,
      comprimento: family === 'parafuso' ? comprimento : undefined,
      material: materialBase
    });
  }, [family, standardCode, currentDimension, comprimento, materialBase]);

  // 6. Reactive SKU Generation
  const skuGerado = useMemo(() => {
    return generateIndustrialSku({
      family,
      standardCode,
      bitola,
      passo: currentDimension.passo,
      comprimento: family === 'parafuso' ? comprimento : undefined,
      classeResistencia,
      tratamentoSuperficial
    });
  }, [family, standardCode, bitola, currentDimension.passo, comprimento, classeResistencia, tratamentoSuperficial]);

  // Assemble full current Product Object
  const currentProduct: ProductItem = useMemo(() => {
    return {
      sku_gerado: skuGerado,
      codigo_interno_delta: codigoInternoDelta,
      standard_code: standardCode,
      family,
      bitola,
      passo: currentDimension.passo,
      comprimento: family === 'parafuso' ? comprimento : undefined,
      classe_resistencia: classeResistencia,
      material_base: materialBase,
      tratamento_superficial: tratamentoSuperficial,
      peso_liquido_kg: weightResult.pesoLiquidoKg,
      peso_bruto_kg: weightResult.pesoBrutoKg,
      fator_perda_percentual: weightResult.fatorPerdaPercentual,
      comprimento_rosca_b: weightResult.comprimentoRoscaB
    };
  }, [
    skuGerado,
    codigoInternoDelta,
    standardCode,
    family,
    bitola,
    currentDimension.passo,
    comprimento,
    classeResistencia,
    materialBase,
    tratamentoSuperficial,
    weightResult
  ]);

  // Load products from Supabase on mount
  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setSavedProducts(data);
      })
      .catch((err) => console.error('Error loading products from Supabase:', err));
  }, []);

  // Save product to Supabase PostgreSQL
  const handleSaveToDatabase = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentProduct)
      });
      const data = await res.json();
      if (res.ok) {
        setSaveSuccess(true);
        // Refresh product list
        const refreshed = await fetch('/api/products').then((r) => r.json());
        if (Array.isArray(refreshed)) setSavedProducts(refreshed);
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        alert(`Erro ao salvar: ${data.error || 'Falha no banco'}`);
      }
    } catch (err: any) {
      alert(`Falha ao conectar com o Supabase: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Export PDF Datasheet
  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    try {
      await generateTechnicalDatasheetPdf(currentProduct, currentDimension);
    } catch (err) {
      console.error(err);
      alert('Falha ao gerar o PDF. Verifique o desenho no navegador.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Top Telemetry Bar & View Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 px-4 py-2 rounded-xl">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
              isSidebarCollapsed
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
            }`}
            title={isSidebarCollapsed ? 'Restaurar Painel de Parâmetros' : 'Ocultar Painel para Ver Prancha em Tela Cheia'}
          >
            {isSidebarCollapsed ? <PanelLeftOpen className="w-3.5 h-3.5 text-amber-400" /> : <PanelLeftClose className="w-3.5 h-3.5 text-cyan-400" />}
            <span>{isSidebarCollapsed ? 'Exibir Parâmetros' : 'Foco Total no Desenho (100% Tela)'}</span>
          </button>

          <span className="text-slate-600 hidden sm:inline">|</span>

          {/* Quick SKU display */}
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="text-slate-400 hidden md:inline">SKU:</span>
            <span className="text-cyan-300 font-bold bg-cyan-950/70 border border-cyan-800 px-2 py-0.5 rounded">
              {skuGerado}
            </span>
          </div>
        </div>

        {/* KPI Visibility Toggle & Quick Stats */}
        <div className="flex items-center gap-3">
          <div className="hidden xl:flex items-center gap-4 text-xs font-mono text-slate-400">
            <span>Líquido: <strong className="text-emerald-400">{(weightResult.pesoLiquidoKg * 1000).toFixed(1)}g</strong></span>
            <span>Bruto: <strong className="text-slate-200">{(weightResult.pesoBrutoKg * 1000).toFixed(1)}g</strong></span>
            <span>Cavaco: <strong className="text-rose-400">{weightResult.fatorPerdaPercentual}%</strong></span>
            <span>Rendimento: <strong className="text-amber-400">{weightResult.pecasPorTonelada.toLocaleString('pt-BR')} pç/t</strong></span>
          </div>

          <button
            type="button"
            onClick={() => setShowKpis(!showKpis)}
            className="flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-slate-200 px-2 py-1 rounded bg-slate-950 border border-slate-800"
            title={showKpis ? 'Ocultar Cards de Indicadores' : 'Exibir Cards de Indicadores'}
          >
            {showKpis ? <EyeOff className="w-3 h-3 text-slate-400" /> : <Eye className="w-3 h-3 text-cyan-400" />}
            <span>{showKpis ? 'Recolher Métricas' : 'Métricas'}</span>
          </button>
        </div>
      </div>

      {/* Top Banner / KPIs (Compact & Collapsible) */}
      {showKpis && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-in fade-in duration-150">
          {/* SKU KPI */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold">SKU Paramétrico</span>
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-xs font-mono font-bold text-cyan-300 truncate mt-1" title={skuGerado}>
              {skuGerado}
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">{standardCode} • {bitola}x{comprimento || 50}</div>
          </div>

          {/* Net Weight KPI */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold">Peso Líquido Unit.</span>
              <Scale className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-base font-mono font-bold text-emerald-300 mt-1">
              {(weightResult.pesoLiquidoKg * 1000).toFixed(2)} <span className="text-[11px] text-emerald-400 font-normal">g</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
              Milheiro: <strong>{weightResult.pesoMilheiroLiquidoKg} kg</strong>
            </div>
          </div>

          {/* Gross Weight & Scrap KPI */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold">Matéria-Prima Bruta</span>
              <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="text-base font-mono font-bold text-slate-200 mt-1">
              {(weightResult.pesoBrutoKg * 1000).toFixed(2)} <span className="text-[11px] text-slate-400 font-normal">g</span>
            </div>
            <div className="text-[10px] font-mono mt-0.5 text-rose-400 flex items-center gap-1 font-semibold">
              <span>Perda / Cavaco: {weightResult.fatorPerdaPercentual}%</span>
            </div>
          </div>

          {/* Yield per Ton KPI */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold">Rendimento / Ton</span>
              <Cpu className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-base font-mono font-bold text-amber-300 mt-1">
              {weightResult.pecasPorTonelada.toLocaleString('pt-BR')}{' '}
              <span className="text-[11px] text-slate-400 font-normal">peças</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">Capacidade de Produção MES</div>
          </div>
        </div>
      )}

      {/* Main Grid: Left Form & Right Interactive CAD Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ============================================================== */}
        {/* LEFT COLUMN: PARAMETRIC ENGINEERING FORM                       */}
        {/* ============================================================== */}
        {!isSidebarCollapsed && (
          <div className="lg:col-span-4 xl:col-span-4 2xl:col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-bold text-slate-100">Configurador Paramétrico</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded font-semibold">
                  CORE ENGINE
                </span>
                <button
                  type="button"
                  onClick={() => setIsSidebarCollapsed(true)}
                  className="p-1 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded"
                  title="Recolher painel"
                >
                  <PanelLeftClose className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          {/* 1. Element Family Selector (Parafuso / Porca / Arruela) */}
          <div>
            <label className="text-xs font-mono text-slate-400 uppercase font-semibold block mb-2">
              Tipo de Fixador Industrial
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleFamilyChange('parafuso')}
                className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all flex flex-col items-center gap-1 ${
                  family === 'parafuso'
                    ? 'bg-cyan-500/10 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-950'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span>🔩 Parafuso</span>
                <span className="text-[10px] font-normal text-slate-500 font-mono">DIN 933/931/912</span>
              </button>

              <button
                type="button"
                onClick={() => handleFamilyChange('porca')}
                className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all flex flex-col items-center gap-1 ${
                  family === 'porca'
                    ? 'bg-cyan-500/10 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-950'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span>🔘 Porca</span>
                <span className="text-[10px] font-normal text-slate-500 font-mono">DIN 934</span>
              </button>

              <button
                type="button"
                onClick={() => handleFamilyChange('arruela')}
                className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all flex flex-col items-center gap-1 ${
                  family === 'arruela'
                    ? 'bg-cyan-500/10 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-950'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span>⭕ Arruela</span>
                <span className="text-[10px] font-normal text-slate-500 font-mono">DIN 125A / 127B</span>
              </button>
            </div>
          </div>

          {/* 2. Standard (Norma DIN) Selection */}
          <div>
            <label className="text-xs font-mono text-slate-400 uppercase font-semibold block mb-1.5">
              Norma Técnica Internacional
            </label>
            <select
              value={standardCode}
              onChange={(e) => {
                setStandardCode(e.target.value);
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-medium focus:outline-none focus:border-cyan-500"
            >
              {availableStandards.map((std) => (
                <option key={std.code} value={std.code}>
                  {std.code} - {std.description}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Bitola (Nominal Size) & Real-time Auto-completed Dimensions */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono text-slate-400 uppercase font-semibold block mb-1.5">
                Bitola Nominal ({family === 'arruela' ? 'Para Parafuso' : 'd'})
              </label>
              <select
                value={bitola}
                onChange={(e) => setBitola(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono font-bold text-amber-400 focus:outline-none focus:border-cyan-500"
              >
                {availableBitolas.map((b) => (
                  <option key={b} value={b}>
                    {b} (Ø {standardDimensions[b]?.diametro_nominal}mm)
                  </option>
                ))}
              </select>
            </div>

            {/* Length (L) for Screws */}
            {family === 'parafuso' && (
              <div>
                <label className="text-xs font-mono text-slate-400 uppercase font-semibold block mb-1.5">
                  Comprimento (L) mm
                </label>
                {validLengths.length > 0 ? (
                  <select
                    value={comprimento}
                    onChange={(e) => setComprimento(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono font-bold text-cyan-300 focus:outline-none focus:border-cyan-500"
                  >
                    {validLengths.map((len) => (
                      <option key={len} value={len}>
                        {len} mm
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="number"
                    value={comprimento}
                    onChange={(e) => setComprimento(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                  />
                )}
              </div>
            )}
          </div>

          {/* Auto-completed Dimensional Indicators Readout */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 text-xs font-mono space-y-1.5">
            <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1.5 mb-1 text-cyan-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Parâmetros Normativos Autocompletados:
            </div>
            <div className="grid grid-cols-2 gap-2 text-slate-300 text-[11px]">
              {family !== 'arruela' && (
                <div>
                  Passo de Rosca (P): <strong className="text-slate-100">{currentDimension.passo} mm</strong>
                </div>
              )}
              {currentDimension.chave && (
                <div>
                  Abertura Chave (s): <strong className="text-slate-100">{currentDimension.chave} mm</strong>
                </div>
              )}
              {currentDimension.altura_cabeca && (
                <div>
                  {family === 'porca' ? 'Altura da Porca (m):' : 'Altura Cabeça (k):'}{' '}
                  <strong className="text-slate-100">{currentDimension.altura_cabeca} mm</strong>
                </div>
              )}
              {currentDimension.diametro_cabeca && (
                <div>
                  Ø Cabeça (dk): <strong className="text-slate-100">{currentDimension.diametro_cabeca} mm</strong>
                </div>
              )}
              {currentDimension.diametro_interno && (
                <div>
                  Ø Interno (d1): <strong className="text-slate-100">{currentDimension.diametro_interno} mm</strong>
                </div>
              )}
              {currentDimension.diametro_externo && (
                <div>
                  Ø Externo (d2): <strong className="text-slate-100">{currentDimension.diametro_externo} mm</strong>
                </div>
              )}
              {currentDimension.espessura && (
                <div>
                  Espessura (s): <strong className="text-slate-100">{currentDimension.espessura} mm</strong>
                </div>
              )}
              {standardCode === 'DIN 931' && (
                <div className="col-span-2 text-amber-300 font-semibold">
                  Rosca Útil (b) Calculada: {weightResult.comprimentoRoscaB} mm
                </div>
              )}
            </div>
          </div>

          {/* 4. Resistance Class & Material */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono text-slate-400 uppercase font-semibold block mb-1.5">
                Classe de Resistência
              </label>
              <select
                value={classeResistencia}
                onChange={(e) => setClasseResistencia(e.target.value as ResistanceClass)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                {family === 'porca' ? (
                  <>
                    <option value="Classe 6">Classe 6 (ISO 898-2)</option>
                    <option value="Classe 8">Classe 8 (Padrão 8.8)</option>
                    <option value="Classe 10">Classe 10 (Padrão 10.9)</option>
                    <option value="Classe 12">Classe 12 (Padrão 12.9)</option>
                    <option value="Inox A2-70">Inox A2-70 (AISI 304)</option>
                    <option value="Inox A4-80">Inox A4-80 (AISI 316)</option>
                  </>
                ) : (
                  <>
                    <option value="4.6">4.6 (Baixo Carbono)</option>
                    <option value="5.8">5.8 (Média Dureza)</option>
                    <option value="8.8">8.8 (Alta Resistência SAE 1045)</option>
                    <option value="10.9">10.9 (Extra Alta SAE 4140)</option>
                    <option value="12.9">12.9 (Cromomolibdênio SAE 4340)</option>
                    <option value="Inox A2-70">Inox A2-70 (AISI 304)</option>
                    <option value="Inox A4-80">Inox A4-80 (AISI 316)</option>
                    <option value="Latão CLA 360">Latão CLA 360</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="text-xs font-mono text-slate-400 uppercase font-semibold block mb-1.5">
                Material Base
              </label>
              <select
                value={materialBase}
                onChange={(e) => setMaterialBase(e.target.value as BaseMaterial)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="Aço Médio Carbono SAE 1045">SAE 1045 (Médio Carbono)</option>
                <option value="Aço Carbono SAE 1010/1020">SAE 1010/1020 (Baixo Carbono)</option>
                <option value="Aço Liga SAE 4140">SAE 4140 (Cr-Mo Tratado)</option>
                <option value="Aço Liga SAE 4340">SAE 4340 (Ni-Cr-Mo)</option>
                <option value="Aço Inoxidável AISI 304 (A2)">Inox AISI 304 (A2)</option>
                <option value="Aço Inoxidável AISI 316 (A4)">Inox AISI 316 (A4)</option>
                <option value="Latão CLA 360">Latão CLA 360</option>
              </select>
            </div>
          </div>

          {/* 5. Surface Finish / Tratamento Superficial */}
          <div>
            <label className="text-xs font-mono text-slate-400 uppercase font-semibold block mb-1.5">
              Tratamento Superficial & Proteção
            </label>
            <select
              value={tratamentoSuperficial}
              onChange={(e) => setTratamentoSuperficial(e.target.value as SurfaceFinish)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-cyan-500"
            >
              <option value="Zincado Branco (ZB)">Zincado Branco (ZB) - Tri-passivado Cr3+</option>
              <option value="Zincado Amarelo (Bicromatizado)">Zincado Amarelo (Bicromatizado)</option>
              <option value="Galvanizado a Fogo (GF)">Galvanizado a Fogo (GF) - Alta Camada</option>
              <option value="Geomet 321 / 500">Geomet 321 / 500 (Isento de Cromo / Alta Névoa Salina)</option>
              <option value="Enegrecido de Têmpera">Enegrecido de Têmpera & Oleado</option>
              <option value="Fosfatizado">Fosfatizado com Óleo Protetor</option>
              <option value="Polido / Oleado">Polido / Oleado Natural</option>
            </select>
          </div>

          {/* 6. Delta Internal / Legacy Code with predictive matching */}
          <div>
            <label className="text-xs font-mono text-slate-400 uppercase font-semibold block mb-1.5">
              Código Interno Delta / Referência Livre do Cliente
            </label>
            <div className="relative">
              <input
                type="text"
                value={codigoInternoDelta}
                onChange={(e) => setCodigoInternoDelta(e.target.value)}
                placeholder="Ex: DELTA-M20-80-ZB ou código de desenho..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-3 pr-8 py-2 text-xs font-mono text-amber-300 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-2.5" />
            </div>
          </div>

          {/* 7. Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSaveToDatabase}
              className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg ${
                saveSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950'
              } disabled:opacity-50`}
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Gravando no Supabase...' : saveSuccess ? 'Salvo no Supabase!' : 'Salvar no Supabase'}</span>
            </button>

            <button
              type="button"
              disabled={isExportingPdf}
              onClick={handleExportPdf}
              className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>{isExportingPdf ? 'Renderizando PDF...' : 'Catálogo PDF (A4)'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* RIGHT COLUMN: TABS & INTERACTIVE CAD / BOM / ROUTING / AI     */}
      {/* ============================================================== */}
        <div className={`${isSidebarCollapsed ? 'col-span-12' : 'lg:col-span-8 xl:col-span-8 2xl:col-span-9'} flex flex-col space-y-3`}>
          {/* Navigation Tabs Bar */}
          <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-1.5 rounded-xl gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveTab('cad')}
                className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'cad'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Cpu className="w-4 h-4" />
                <span>Prancha Técnica CAD</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('bom')}
                className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'bom'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Estrutura (BOM)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('routing')}
                className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'routing'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <ListOrdered className="w-4 h-4" />
                <span>Roteiro MES</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('ai')}
                className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'ai'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Bot className="w-4 h-4 text-amber-400" />
                <span>Copilot Lynx AI</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'history'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <History className="w-4 h-4" />
                <span>Histórico ({savedProducts.length})</span>
              </button>
            </div>

            {/* Quick Layout Mode Switch Button */}
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-cyan-300 text-xs font-bold rounded-lg transition-colors shrink-0"
              title={isSidebarCollapsed ? 'Restaurar modo dividido com painel' : 'Expandir prancha para 100% da tela'}
            >
              {isSidebarCollapsed ? <PanelLeftOpen className="w-3.5 h-3.5" /> : <PanelLeftClose className="w-3.5 h-3.5" />}
              <span>{isSidebarCollapsed ? 'Modo Dividido' : 'Expandir Prancha (100%)'}</span>
            </button>
          </div>

          {/* TAB 1: VECTOR CAD DRAWING (NANQUIM A3 OU BLUEPRINT DIGITAL) */}
          {activeTab === 'cad' && (
            <div className="flex flex-col space-y-3">
              {/* CAD Rendering Engine Mode Toggle */}
              <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-2 rounded-xl">
                <span className="text-[11px] font-mono text-slate-400 pl-2">Estilo Gráfico:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCadMode('nanquim_a3')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                      cadMode === 'nanquim_a3'
                        ? 'bg-white text-slate-950 shadow-md font-extrabold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <span>📜 Prancheta Nanquim A3 (Clássica)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCadMode('blueprint')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                      cadMode === 'blueprint'
                        ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <span>📐 CAD Blueprint Neon</span>
                  </button>
                </div>
              </div>

              {cadMode === 'nanquim_a3' ? (
                <TechnicalDrawingSheet
                  product={currentProduct}
                  dimension={currentDimension}
                />
              ) : (
                <CadViewer
                  family={family}
                  standardCode={standardCode}
                  bitola={bitola}
                  dimension={currentDimension}
                  comprimento={comprimento}
                  comprimentoRoscaB={weightResult.comprimentoRoscaB}
                  classeResistencia={classeResistencia}
                  materialBase={materialBase}
                  tratamentoSuperficial={tratamentoSuperficial}
                  skuGerado={skuGerado}
                  codigoInternoDelta={codigoInternoDelta}
                  pesoLiquidoKg={weightResult.pesoLiquidoKg}
                  fatorPerdaPercentual={weightResult.fatorPerdaPercentual}
                />
              )}
            </div>
          )}

          {/* TAB 2: BOM (BILL OF MATERIALS) */}
          {activeTab === 'bom' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
                    Estrutura de Produto (BOM) • Coeficientes de Consumo
                  </h3>
                </div>
                <span className="text-xs font-mono text-slate-400">Base: 1.000 Peças (Milheiro)</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Item / Insumo</th>
                      <th className="py-2.5 px-3">Tipo</th>
                      <th className="py-2.5 px-3">Consumo / 1.000 un</th>
                      <th className="py-2.5 px-3">Fator Perda</th>
                      <th className="py-2.5 px-3">Observações de Processo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-200">
                    <tr className="hover:bg-slate-800/40">
                      <td className="py-3 px-3 font-semibold text-cyan-300">
                        Tarugo / Barra de Aço ({materialBase})
                      </td>
                      <td className="py-3 px-3 text-slate-400">Matéria-Prima</td>
                      <td className="py-3 px-3 font-bold text-emerald-400">
                        {weightResult.pesoMilheiroBrutoKg} kg
                      </td>
                      <td className="py-3 px-3 text-rose-400 font-bold">
                        {weightResult.fatorPerdaPercentual}%
                      </td>
                      <td className="py-3 px-3 text-slate-400 text-[11px]">
                        Comprimento de corte inclui sobremetal de serra e faceamento
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="py-3 px-3 font-semibold text-amber-300">
                        Tratamento Superficial ({tratamentoSuperficial})
                      </td>
                      <td className="py-3 px-3 text-slate-400">Insumo Químico</td>
                      <td className="py-3 px-3 font-bold text-slate-200">
                        {(weightResult.pesoMilheiroLiquidoKg * 0.035).toFixed(2)} kg
                      </td>
                      <td className="py-3 px-3 text-slate-400">2.0%</td>
                      <td className="py-3 px-3 text-slate-400 text-[11px]">
                        Banho de deposição eletrolítica e passivação
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="py-3 px-3 font-semibold text-slate-200">
                        Caixa DeltaFix 25kg + Saco Plástico VCI Anti-Corrosão
                      </td>
                      <td className="py-3 px-3 text-slate-400">Embalagem</td>
                      <td className="py-3 px-3 font-bold text-slate-200">
                        {Math.ceil(weightResult.pesoMilheiroLiquidoKg / 25)} un
                      </td>
                      <td className="py-3 px-3 text-slate-400">1.0%</td>
                      <td className="py-3 px-3 text-slate-400 text-[11px]">
                        Papelão ondulado triplo homologado para transporte pesado
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: MES ROUTINGS */}
          {activeTab === 'routing' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <ListOrdered className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
                    Roteiro de Fabricação Industrial (Routings / MES)
                  </h3>
                </div>
                <span className="text-xs font-mono text-cyan-400 font-semibold">6 Etapas Padrão</span>
              </div>

              <div className="space-y-3">
                {[
                  {
                    seq: 10,
                    name: 'Corte do Tarugo em Serra de Fita CNC',
                    center: 'SERRA-CNC-01',
                    setup: '20 min',
                    cycle: '15 s/pç',
                    desc: `Corte de tarugo bruto em barra sextavada/redonda no comprimento de ${comprimento + 5}mm`
                  },
                  {
                    seq: 20,
                    name: 'Usinagem CNC & Cabeceamento',
                    center: 'TORNO-CNC-01',
                    setup: '45 min',
                    cycle: '40 s/pç',
                    desc: 'Faceamento, desbaste do corpo, chanfro de 45° na ponta e usinagem da cabeça'
                  },
                  {
                    seq: 30,
                    name: 'Laminação de Rosca por Conformação Mecânica',
                    center: 'LAMIN-01',
                    setup: '30 min',
                    cycle: '8 s/pç',
                    desc: `Laminação de rosca métrica grossa passo ${currentDimension.passo}mm com matriz cilíndrica 6g`
                  },
                  {
                    seq: 40,
                    name: 'Tratamento Térmico (Têmpera & Revenimento)',
                    center: 'FORNO-CONT-01',
                    setup: '60 min',
                    cycle: 'Fluxo Contínuo',
                    desc: `Tratamento sob atmosfera protetora para atingir Classe ${classeResistencia}`
                  },
                  {
                    seq: 50,
                    name: `Tratamento Superficial: ${tratamentoSuperficial}`,
                    center: 'LINHA-ZINC-01',
                    setup: '15 min',
                    cycle: 'Banho Rotativo',
                    desc: 'Decapagem, eletrodeposição de zinco e selante com passivação isenta de cromo hexavalente'
                  },
                  {
                    seq: 60,
                    name: 'Controle de Qualidade Final (CQ) & Embalagem',
                    center: 'POSTO-CQ-01',
                    setup: '10 min',
                    cycle: '5 s/pç',
                    desc: 'Inspeção dimensional por amostragem AQL 0.65, teste de torque e empacotamento com VCI'
                  }
                ].map((op) => (
                  <div
                    key={op.seq}
                    className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400 font-extrabold flex items-center justify-center shrink-0">
                        {op.seq}
                      </div>
                      <div>
                        <div className="font-bold text-slate-100">{op.name}</div>
                        <div className="text-slate-400 text-[11px] mt-0.5">{op.desc}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-[11px] shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                      <div>
                        <span className="text-slate-500">Posto:</span>{' '}
                        <strong className="text-amber-400">{op.center}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500">Setup:</span>{' '}
                        <strong className="text-slate-300">{op.setup}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500">Ciclo:</span>{' '}
                        <strong className="text-emerald-400">{op.cycle}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: LYNX VPS AI COPILOT */}
          {activeTab === 'ai' && (
            <IndustrialCopilot currentProductContext={currentProduct} />
          )}

          {/* TAB 5: SAVED PRODUCTS HISTORY */}
          {activeTab === 'history' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
                    Produtos Cadastrados no Supabase ({savedProducts.length})
                  </h3>
                </div>

                <div className="relative w-48">
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Filtrar SKU..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-2.5 pr-7 py-1 text-xs text-slate-200 focus:outline-none"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute right-2 top-2" />
                </div>
              </div>

              {savedProducts.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs font-mono">
                  Nenhum produto cadastrado no banco ainda. Configure um fixador ao lado e clique em &quot;Salvar no Supabase&quot;.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="py-2 px-3">SKU Gerado</th>
                        <th className="py-2 px-3">Norma</th>
                        <th className="py-2 px-3">Bitola</th>
                        <th className="py-2 px-3">Classe</th>
                        <th className="py-2 px-3">Acabamento</th>
                        <th className="py-2 px-3">Peso Líq.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {savedProducts
                        .filter(
                          (p) =>
                            p.sku_gerado.toLowerCase().includes(searchFilter.toLowerCase()) ||
                            (p.codigo_interno_delta || '').toLowerCase().includes(searchFilter.toLowerCase())
                        )
                        .map((prod) => (
                          <tr key={prod.id || prod.sku_gerado} className="hover:bg-slate-800/40">
                            <td className="py-2.5 px-3 font-bold text-cyan-300">{prod.sku_gerado}</td>
                            <td className="py-2.5 px-3">{prod.standard_code}</td>
                            <td className="py-2.5 px-3 font-semibold text-amber-300">
                              {prod.bitola} {prod.comprimento ? `x ${prod.comprimento}` : ''}
                            </td>
                            <td className="py-2.5 px-3">{prod.classe_resistencia}</td>
                            <td className="py-2.5 px-3 text-slate-400">{prod.tratamento_superficial}</td>
                            <td className="py-2.5 px-3 font-semibold text-emerald-400">
                              {(prod.peso_liquido_kg * 1000).toFixed(1)}g
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
