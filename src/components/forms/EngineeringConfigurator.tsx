// src/components/forms/EngineeringConfigurator.tsx - Dynamic Reactive Industrial Product Configurator
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  StandardFamily,
  ResistanceClass,
  BaseMaterial,
  SurfaceFinish,
  ProductItem,
  StandardDimension,
  EngineeringStandard
} from '@/lib/standards/types';
import { DIN_STANDARDS, DIMENSIONS_MAP } from '@/lib/standards/din-data';
import { generateIndustrialSku } from '@/lib/calculators/sku-generator';
import { calculateFastenerWeight } from '@/lib/calculators/weight-calculator';
import { CadViewer } from '@/components/cad/CadViewer';
import { TechnicalDrawingSheet } from '@/components/cad/TechnicalDrawingSheet';
import { IndustrialCopilot } from '@/components/ai/IndustrialCopilot';
import { NewStandardModal } from '@/components/forms/NewStandardModal';
import { generateTechnicalDatasheetPdf } from '@/lib/export/pdf-generator';
import { SteelColorBadge, getSteelColorBySpec } from '@/components/ui/SteelColorBadge';
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
  EyeOff,
  Scissors,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Upload,
  Paperclip,
  Check,
  FileCode
} from 'lucide-react';

interface EngineeringConfiguratorProps {
  initialProducts?: ProductItem[];
  defaultSubTab?: 'configurador' | 'normas' | 'desenho' | 'bom' | 'routing';
}

interface CustomBOMItem {
  id: string;
  description: string;
  item_type: 'materia_prima' | 'insumo_quimico' | 'embalagem';
  consumption: number;
  unit: string;
  loss_factor: number;
  notes: string;
}

interface CustomRoutingItem {
  seq: number;
  name: string;
  center: string;
  setup: string;
  cycle: string;
  desc: string;
}

export function EngineeringConfigurator({
  initialProducts = [],
  defaultSubTab
}: EngineeringConfiguratorProps) {
  // 1. Dynamic Standards Catalog State (Supabase + DIN defaults)
  const [allStandards, setAllStandards] = useState<EngineeringStandard[]>(DIN_STANDARDS);
  const [dimensionsCatalog, setDimensionsCatalog] = useState<Record<string, Record<string, StandardDimension>>>(DIMENSIONS_MAP);
  const [isNewStandardModalOpen, setIsNewStandardModalOpen] = useState(defaultSubTab === 'normas');

  // 2. Core Configurator State
  const [family, setFamily] = useState<StandardFamily>('parafuso');
  const [standardCode, setStandardCode] = useState<string>('DIN 933');
  const [bitola, setBitola] = useState<string>('M20');
  const [comprimento, setComprimento] = useState<number>(80);
  const [sobremetalCorte, setSobremetalCorte] = useState<number>(5.0);
  const [classeResistencia, setClasseResistencia] = useState<ResistanceClass>('8.8');
  const [materialBase, setMaterialBase] = useState<BaseMaterial>('Aço Médio Carbono SAE 1045');
  const [tratamentoSuperficial, setTratamentoSuperficial] = useState<SurfaceFinish>('Zincado Branco (ZB)');
  const [codigoInternoDelta, setCodigoInternoDelta] = useState<string>('PF-ESP-M20-80');

  // 3. Custom Special Piece State (Modo Cadastro Livre / Sob Desenho AutoCAD / PDF)
  const [isCustomSpecial, setIsCustomSpecial] = useState(false);
  const [customBitola, setCustomBitola] = useState<string>('M20-ESP');
  const [customDiametro, setCustomDiametro] = useState<number>(20);
  const [customPasso, setCustomPasso] = useState<number>(2.5);
  const [customChave, setCustomChave] = useState<number>(30);
  const [customAlturaCabeca, setCustomAlturaCabeca] = useState<number>(12.5);
  const [customDiametroCabeca, setCustomDiametroCabeca] = useState<number>(30);
  const [customProfundidadeSextavado, setCustomProfundidadeSextavado] = useState<number>(10);
  const [customComprimento, setCustomComprimento] = useState<number>(80);
  const [desenhoClienteRef, setDesenhoClienteRef] = useState<string>('');
  const [anexoArquivoNome, setAnexoArquivoNome] = useState<string>('');
  const [anexoArquivoUrl, setAnexoArquivoUrl] = useState<string>('');

  // 4. Active Tab State & Layout Controls
  const [activeTab, setActiveTab] = useState<'cad' | 'bom' | 'routing' | 'ai' | 'history'>(() => {
    if (defaultSubTab === 'bom') return 'bom';
    if (defaultSubTab === 'routing') return 'routing';
    return 'cad';
  });
  const [cadMode, setCadMode] = useState<'nanquim_a3' | 'blueprint'>('nanquim_a3');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showKpis, setShowKpis] = useState(true);

  // 5. Persistence & History State
  const [savedProducts, setSavedProducts] = useState<ProductItem[]>(initialProducts);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // 6. Predictive search for Delta legacy code
  const [searchFilter, setSearchFilter] = useState('');

  // Load dynamic standards from Supabase on mount
  useEffect(() => {
    fetch('/api/standards')
      .then((res) => res.json())
      .then((data) => {
        if (data.standards && Array.isArray(data.standards)) {
          setAllStandards(data.standards);
        }
        if (data.dimensions && typeof data.dimensions === 'object') {
          setDimensionsCatalog((prev) => ({
            ...prev,
            ...data.dimensions
          }));
        }
      })
      .catch((err) => console.error('Error loading standards catalog from API:', err));
  }, []);

  // Available Standards filtered by Family
  const availableStandards = useMemo(() => {
    return allStandards.filter((s) => s.family === family);
  }, [allStandards, family]);

  // Handle Family Switch: Auto-select default standard and bitola
  const handleFamilyChange = (newFamily: StandardFamily) => {
    setFamily(newFamily);
    const matchingStandards = allStandards.filter((s) => s.family === newFamily);
    const defaultStd = matchingStandards[0]?.code || (
      newFamily === 'parafuso' ? 'DIN 933' :
      newFamily === 'porca' ? 'DIN 934' :
      newFamily === 'arruela' ? 'DIN 125' :
      newFamily === 'prisioneiro' ? 'ASTM A193 B7' :
      'DIN 975'
    );
    setStandardCode(defaultStd);

    const dims = dimensionsCatalog[defaultStd] || {};
    const bitolas = Object.keys(dims);
    const firstBitola = bitolas[0] || 'M20';
    setBitola(firstBitola);

    if (newFamily === 'parafuso') {
      setComprimento(80);
      setClasseResistencia('8.8');
    } else if (newFamily === 'porca') {
      setClasseResistencia('Classe 8');
    } else if (newFamily === 'arruela') {
      setClasseResistencia('8.8');
    } else if (newFamily === 'prisioneiro') {
      setComprimento(120);
      setClasseResistencia('10.9');
    } else if (newFamily === 'barra_roscada') {
      setComprimento(1000);
      setClasseResistencia('8.8');
    }
  };

  // Callback when a new standard is registered dynamically (AI or Manual)
  const handleStandardCreated = (newStd: EngineeringStandard, newDims: Record<string, StandardDimension>) => {
    setAllStandards((prev) => {
      const exists = prev.some((s) => s.code === newStd.code);
      if (exists) {
        return prev.map((s) => (s.code === newStd.code ? newStd : s));
      }
      return [newStd, ...prev];
    });
    setDimensionsCatalog((prev) => ({
      ...prev,
      [newStd.code]: newDims
    }));
    setFamily(newStd.family);
    setStandardCode(newStd.code);
    const bitolas = Object.keys(newDims);
    if (bitolas.length > 0) {
      setBitola(bitolas[0]);
      if (newDims[bitolas[0]].comprimentos_validos?.length) {
        setComprimento(newDims[bitolas[0]].comprimentos_validos![0]);
      }
    }
  };

  // Available Bitolas for the selected Standard
  const standardDimensions = dimensionsCatalog[standardCode] || {};
  const availableBitolas = Object.keys(standardDimensions);

  // Effective Dimension (respects Custom Special Piece toggle)
  const effectiveDimension: StandardDimension = useMemo(() => {
    if (isCustomSpecial) {
      return {
        bitola: customBitola || 'ESP-DESENHO',
        diametro_nominal: customDiametro,
        passo: customPasso,
        chave: customChave,
        altura_cabeca: customAlturaCabeca,
        diametro_cabeca: customDiametroCabeca,
        profundidade_sextavado: customProfundidadeSextavado,
        vertice: Number((customChave * 1.1547).toFixed(2)),
        diametro_assentamento: Number((customChave * 0.95).toFixed(1)),
        comprimentos_validos: [customComprimento]
      };
    }

    return standardDimensions[bitola] || {
      bitola,
      diametro_nominal: 20,
      passo: 2.5,
      chave: 30,
      altura_cabeca: 12.5,
      comprimentos_validos: [40, 50, 60, 70, 80, 90, 100]
    };
  }, [
    isCustomSpecial,
    customBitola,
    customDiametro,
    customPasso,
    customChave,
    customAlturaCabeca,
    customDiametroCabeca,
    customProfundidadeSextavado,
    customComprimento,
    standardDimensions,
    bitola
  ]);

  const effectiveComprimento = isCustomSpecial ? customComprimento : comprimento;
  const validLengths = effectiveDimension.comprimentos_validos || [];

  // Reactive Physics & Weight Calculations
  const weightResult = useMemo(() => {
    return calculateFastenerWeight({
      family,
      standardCode: isCustomSpecial ? 'ESPECIAL' : standardCode,
      dimension: effectiveDimension,
      comprimento: family !== 'porca' && family !== 'arruela' ? effectiveComprimento : undefined,
      material: materialBase,
      sobremetalCorte
    });
  }, [family, standardCode, isCustomSpecial, effectiveDimension, effectiveComprimento, materialBase, sobremetalCorte]);

  // Reactive SKU Generation
  const skuGerado = useMemo(() => {
    if (isCustomSpecial) {
      const safeBitola = customBitola.replace(/[^a-zA-Z0-9]/g, '');
      return `DF-ESP-${safeBitola}-${effectiveComprimento}MM`;
    }
    return generateIndustrialSku({
      family,
      standardCode,
      bitola,
      passo: effectiveDimension.passo,
      comprimento: family !== 'porca' && family !== 'arruela' ? effectiveComprimento : undefined,
      classeResistencia,
      tratamentoSuperficial
    });
  }, [
    isCustomSpecial,
    customBitola,
    effectiveComprimento,
    family,
    standardCode,
    bitola,
    effectiveDimension.passo,
    classeResistencia,
    tratamentoSuperficial
  ]);

  // Assemble full current Product Object
  const currentProduct: ProductItem = useMemo(() => {
    const stdDef = allStandards.find((s) => s.code === standardCode);
    return {
      sku_gerado: skuGerado,
      codigo_interno_delta: codigoInternoDelta,
      standard_code: isCustomSpecial ? `ESPECIAL (${desenhoClienteRef || 'SOB DESENHO'})` : standardCode,
      family,
      bitola: isCustomSpecial ? customBitola : bitola,
      passo: effectiveDimension.passo,
      comprimento: family !== 'porca' && family !== 'arruela' ? effectiveComprimento : undefined,
      classe_resistencia: classeResistencia,
      material_base: materialBase,
      tratamento_superficial: tratamentoSuperficial,
      peso_liquido_kg: weightResult.pesoLiquidoKg,
      peso_bruto_kg: weightResult.pesoBrutoKg,
      fator_perda_percentual: weightResult.fatorPerdaPercentual,
      comprimento_rosca_b: weightResult.comprimentoRoscaB,
      sobremetal_corte: sobremetalCorte,
      geometric_archetype: stdDef?.geometric_archetype || (isCustomSpecial ? 'hex_bolt' : undefined),
      is_custom_special: isCustomSpecial,
      desenho_cliente_ref: desenhoClienteRef,
      anexo_pdf_nome: anexoArquivoNome,
      anexo_pdf_url: anexoArquivoUrl
    };
  }, [
    skuGerado,
    codigoInternoDelta,
    isCustomSpecial,
    desenhoClienteRef,
    standardCode,
    family,
    customBitola,
    bitola,
    effectiveDimension.passo,
    effectiveComprimento,
    classeResistencia,
    materialBase,
    tratamentoSuperficial,
    weightResult,
    sobremetalCorte,
    allStandards,
    anexoArquivoNome,
    anexoArquivoUrl
  ]);

  // 6-Meter Commercial Bar Stock Calculation
  const kVal = effectiveDimension.altura_cabeca || 0;
  const isCountersunk = standardCode.includes('7991') || standardCode.includes('ESCAREADO');
  const L_tarugo = (isCountersunk ? effectiveComprimento : (kVal + effectiveComprimento)) + sobremetalCorte;
  const pecasPorBarra6m = Math.max(Math.floor(6000 / Math.max(L_tarugo, 1)), 1);
  const retalhoBarraMm = Math.max(6000 - (pecasPorBarra6m * L_tarugo), 0);
  const metrosLinearesMilheiro = Number(((1000 * L_tarugo) / 1000).toFixed(2));
  const barras6mNecessarias = Math.ceil(1000 / pecasPorBarra6m);

  // Interactive BOM Items State
  const [customBOM, setCustomBOM] = useState<CustomBOMItem[]>([
    {
      id: 'bom-1',
      description: `Barra Comercial de 6m (${materialBase}) - Ø${effectiveDimension.diametro_nominal}mm`,
      item_type: 'materia_prima',
      consumption: metrosLinearesMilheiro,
      unit: 'm (metros)',
      loss_factor: weightResult.fatorPerdaPercentual,
      notes: `${barras6mNecessarias} barras de 6.000mm • ${pecasPorBarra6m} pçs/barra • retalho ${retalhoBarraMm}mm`
    },
    {
      id: 'bom-2',
      description: `Insumo de Tratamento Superficial (${tratamentoSuperficial})`,
      item_type: 'insumo_quimico',
      consumption: Number((weightResult.pesoMilheiroLiquidoKg * 0.035).toFixed(2)),
      unit: 'kg',
      loss_factor: 2.0,
      notes: 'Banho químico, decapagem e passivação'
    },
    {
      id: 'bom-3',
      description: 'Caixa de Papelão DeltaFix 25kg + Saco Plástico VCI Anti-corrosivo',
      item_type: 'embalagem',
      consumption: Math.max(Math.ceil(weightResult.pesoMilheiroLiquidoKg / 25), 1),
      unit: 'un',
      loss_factor: 1.0,
      notes: 'Embalagem homologada para expedição e transporte pesado'
    }
  ]);

  // Keep BOM raw material sync with active dimensions
  useEffect(() => {
    setCustomBOM((prev) =>
      prev.map((item) => {
        if (item.id === 'bom-1') {
          return {
            ...item,
            description: `Barra Comercial de 6m (${materialBase}) - Ø${effectiveDimension.diametro_nominal}mm`,
            consumption: metrosLinearesMilheiro,
            loss_factor: weightResult.fatorPerdaPercentual,
            notes: `${barras6mNecessarias} barras de 6.000mm • ${pecasPorBarra6m} pçs/barra • retalho ${retalhoBarraMm}mm`
          };
        }
        if (item.id === 'bom-2') {
          return {
            ...item,
            description: `Insumo de Tratamento Superficial (${tratamentoSuperficial})`,
            consumption: Number((weightResult.pesoMilheiroLiquidoKg * 0.035).toFixed(2))
          };
        }
        if (item.id === 'bom-3') {
          return {
            ...item,
            consumption: Math.max(Math.ceil(weightResult.pesoMilheiroLiquidoKg / 25), 1)
          };
        }
        return item;
      })
    );
  }, [
    materialBase,
    effectiveDimension.diametro_nominal,
    metrosLinearesMilheiro,
    weightResult.fatorPerdaPercentual,
    weightResult.pesoMilheiroLiquidoKg,
    barras6mNecessarias,
    pecasPorBarra6m,
    retalhoBarraMm,
    tratamentoSuperficial
  ]);

  // Interactive MES Routing State
  const [routingItems, setRoutingItems] = useState<CustomRoutingItem[]>([
    {
      seq: 10,
      name: 'Corte do Tarugo em Serra de Fita CNC',
      center: 'SERRA-CNC-01',
      setup: '20 min',
      cycle: '15 s/pç',
      desc: `Corte de tarugo bruto em barra de 6m no comprimento L_tarugo = ${L_tarugo}mm`
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
      desc: `Laminação de rosca passo ${effectiveDimension.passo}mm com matriz cilíndrica 6g`
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
      await generateTechnicalDatasheetPdf(currentProduct, effectiveDimension);
    } catch (err) {
      console.error(err);
      alert('Falha ao gerar o PDF. Verifique o desenho no navegador.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  // 1-Click PDF Download for Machine Operators from History
  const handleDownloadPdfFromHistory = async (prod: ProductItem) => {
    try {
      const dims = dimensionsCatalog[prod.standard_code]?.[prod.bitola] || {
        bitola: prod.bitola,
        diametro_nominal: prod.bitola.startsWith('M') ? parseFloat(prod.bitola.slice(1)) || 20 : 20,
        passo: prod.passo || 2.5,
        altura_cabeca: 12.5,
        chave: 30
      };
      await generateTechnicalDatasheetPdf(prod, dims);
    } catch (err) {
      console.error('Error downloading history PDF:', err);
      alert('Erro ao baixar PDF da prancha técnica.');
    }
  };

  // Load a Saved Product into the Configurator
  const handleLoadFromHistory = (prod: ProductItem) => {
    setFamily(prod.family);
    setStandardCode(prod.standard_code);
    setBitola(prod.bitola);
    if (prod.comprimento) setComprimento(prod.comprimento);
    if (prod.sobremetal_corte !== undefined) setSobremetalCorte(prod.sobremetal_corte);
    setClasseResistencia(prod.classe_resistencia);
    setMaterialBase(prod.material_base);
    setTratamentoSuperficial(prod.tratamento_superficial);
    if (prod.codigo_interno_delta) setCodigoInternoDelta(prod.codigo_interno_delta);
    if (prod.is_custom_special) {
      setIsCustomSpecial(true);
      setCustomBitola(prod.bitola);
      if (prod.desenho_cliente_ref) setDesenhoClienteRef(prod.desenho_cliente_ref);
    } else {
      setIsCustomSpecial(false);
    }
    setActiveTab('cad');
  };

  // Delete product from history
  const handleDeleteProduct = (sku: string) => {
    if (confirm(`Deseja realmente remover o produto ${sku} do catálogo?`)) {
      setSavedProducts(savedProducts.filter((p) => p.sku_gerado !== sku));
    }
  };

  // Move operation up/down in MES routing
  const handleMoveOperation = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === routingItems.length - 1) return;

    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const newItems = [...routingItems];
    const temp = newItems[index];
    newItems[index] = newItems[targetIdx];
    newItems[targetIdx] = temp;

    // Recalculate sequence numbers
    const resequenced = newItems.map((item, idx) => ({
      ...item,
      seq: (idx + 1) * 10
    }));
    setRoutingItems(resequenced);
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
                ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md'
                : 'bg-slate-950 hover:bg-slate-800 text-cyan-300 border-slate-700'
            }`}
            title="Expandir área de desenho técnico A3"
          >
            {isSidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            <span>{isSidebarCollapsed ? 'Mostrar Painel' : 'Expandir Desenho A3'}</span>
          </button>

          {/* Special Custom Piece Toggle Badge */}
          <button
            type="button"
            onClick={() => setIsCustomSpecial(!isCustomSpecial)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
              isCustomSpecial
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                : 'bg-slate-950 hover:bg-slate-800 text-amber-300 border-amber-500/40'
            }`}
            title="Ativar modo de cadastro livre para peça especial sob desenho do cliente (AutoCAD / PDF)"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>{isCustomSpecial ? '🛠️ Peça Especial (Ativa)' : '+ Peça Sob Desenho'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowKpis(!showKpis)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-lg text-xs font-mono transition-colors"
          >
            {showKpis ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">KPIs</span>
          </button>
        </div>

        {/* Live SKU & Weight Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono">
            <span className="text-slate-400 font-bold">SKU:</span>
            <span className="text-cyan-300 font-extrabold">{skuGerado}</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono">
            <Scale className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-300 font-bold">
              {(weightResult.pesoLiquidoKg * 1000).toFixed(1)}g
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards Row (Collapsible) */}
      {showKpis && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold">Peso Unitário</span>
              <Scale className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-base font-mono font-bold text-slate-100 mt-1">
              {(weightResult.pesoLiquidoKg * 1000).toFixed(1)}{' '}
              <span className="text-[11px] text-slate-400 font-normal">g/pç</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">Líquido Acabado</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold">Milheiro Líquido</span>
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-base font-mono font-bold text-emerald-300 mt-1">
              {weightResult.pesoMilheiroLiquidoKg.toFixed(2)}{' '}
              <span className="text-[11px] text-slate-400 font-normal">kg</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">1.000 Peças Embaladas</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold">Barras de 6m</span>
              <Scissors className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="text-base font-mono font-bold text-rose-300 mt-1">
              {barras6mNecessarias}{' '}
              <span className="text-[11px] text-slate-400 font-normal">barras / milheiro</span>
            </div>
            <div className="text-[10px] font-mono mt-0.5 text-rose-400 flex items-center gap-1 font-semibold">
              <span>{pecasPorBarra6m} pçs/barra • retalho {retalhoBarraMm}mm</span>
            </div>
          </div>

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
                <h2 className="text-sm font-bold text-slate-100">
                  {isCustomSpecial ? 'Peça Especial Sob Desenho' : 'Configurador Paramétrico'}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold border ${
                  isCustomSpecial
                    ? 'bg-amber-950 text-amber-300 border-amber-700'
                    : 'bg-cyan-950 text-cyan-400 border-cyan-800'
                }`}>
                  {isCustomSpecial ? 'MODO LIVRE' : 'CORE ENGINE'}
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

            {/* Mode: Standard vs Special Custom Piece */}
            {isCustomSpecial ? (
              /* Custom Special Piece Free Dimension Form */
              <div className="space-y-3 bg-slate-950/70 border border-amber-500/40 rounded-xl p-3.5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5">
                    <FileCode className="w-4 h-4" />
                    Parâmetros Livres da Peça
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsCustomSpecial(false)}
                    className="text-[10px] font-mono text-slate-400 hover:text-cyan-300 underline"
                  >
                    Voltar para Normativo
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-mono text-slate-400 block mb-1">Identificação / Bitola</label>
                    <input
                      type="text"
                      value={customBitola}
                      onChange={(e) => setCustomBitola(e.target.value)}
                      placeholder="Ex: M20-ESP ou 3/4-ESP"
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs font-bold text-amber-300"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono text-slate-400 block mb-1">Ref. Desenho Cliente</label>
                    <input
                      type="text"
                      value={desenhoClienteRef}
                      onChange={(e) => setDesenhoClienteRef(e.target.value)}
                      placeholder="Ex: DWG-4982-REV2"
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block mb-0.5">Ø Nominal (d)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={customDiametro}
                      onChange={(e) => setCustomDiametro(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block mb-0.5">Passo (P)</label>
                    <input
                      type="number"
                      step="0.05"
                      value={customPasso}
                      onChange={(e) => setCustomPasso(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block mb-0.5">Comprimento (L)</label>
                    <input
                      type="number"
                      value={customComprimento}
                      onChange={(e) => setCustomComprimento(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-cyan-300 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block mb-0.5">Chave (s)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={customChave}
                      onChange={(e) => setCustomChave(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block mb-0.5">Alt. Cabeça (k)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={customAlturaCabeca}
                      onChange={(e) => setCustomAlturaCabeca(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-rose-400 block mb-0.5">+ Sobremetal</label>
                    <input
                      type="number"
                      step="0.5"
                      value={sobremetalCorte}
                      onChange={(e) => setSobremetalCorte(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-rose-300 font-bold"
                    />
                  </div>
                </div>

                {/* Technical Attachment Uploader (.dwg, .dxf, .pdf) */}
                <div className="pt-2 border-t border-slate-800">
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">
                    Anexar Desenho Técnico (AutoCAD .dwg, .dxf ou PDF)
                  </label>
                  <div className="flex items-center gap-2">
                    <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-dashed border-slate-700 hover:border-cyan-500 rounded-lg text-xs text-slate-300 cursor-pointer transition-colors">
                      <Paperclip className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="truncate">
                        {anexoArquivoNome || 'Selecionar arquivo .dwg, .dxf ou .pdf'}
                      </span>
                      <input
                        type="file"
                        accept=".dwg,.dxf,.pdf,.png,.jpg"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setAnexoArquivoNome(file.name);
                            setAnexoArquivoUrl(URL.createObjectURL(file));
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                    {anexoArquivoNome && (
                      <button
                        type="button"
                        onClick={() => {
                          setAnexoArquivoNome('');
                          setAnexoArquivoUrl('');
                        }}
                        className="p-2 text-slate-400 hover:text-rose-400 bg-slate-900 rounded border border-slate-800"
                        title="Remover anexo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Standard Normative Selection */
              <>
                {/* 1. Element Family Selector */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-mono text-slate-400 uppercase font-semibold">
                      Tipo de Fixador Industrial
                    </label>
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-1.5 py-0.2 rounded font-semibold">
                      Normas Ilimitadas
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleFamilyChange('parafuso')}
                      className={`py-2 px-2 text-xs font-bold rounded-lg border transition-all flex flex-col items-center gap-1 ${
                        family === 'parafuso'
                          ? 'bg-cyan-500/10 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-950'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span>🔩 Parafuso</span>
                      <span className="text-[9px] font-normal text-slate-500 font-mono">DIN 933/912/A325</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleFamilyChange('porca')}
                      className={`py-2 px-2 text-xs font-bold rounded-lg border transition-all flex flex-col items-center gap-1 ${
                        family === 'porca'
                          ? 'bg-cyan-500/10 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-950'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span>🔘 Porca</span>
                      <span className="text-[9px] font-normal text-slate-500 font-mono">DIN 934/985</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleFamilyChange('arruela')}
                      className={`py-2 px-2 text-xs font-bold rounded-lg border transition-all flex flex-col items-center gap-1 ${
                        family === 'arruela'
                          ? 'bg-cyan-500/10 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-950'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span>⭕ Arruela</span>
                      <span className="text-[9px] font-normal text-slate-500 font-mono">DIN 125/127</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleFamilyChange('prisioneiro')}
                      className={`py-2 px-2 text-xs font-bold rounded-lg border transition-all flex flex-col items-center gap-1 ${
                        family === 'prisioneiro'
                          ? 'bg-cyan-500/10 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-950'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span>🔗 Prisioneiro</span>
                      <span className="text-[9px] font-normal text-slate-500 font-mono">ASTM A193 B7</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleFamilyChange('barra_roscada')}
                      className={`py-2 px-2 text-xs font-bold rounded-lg border transition-all flex flex-col items-center gap-1 ${
                        family === 'barra_roscada'
                          ? 'bg-cyan-500/10 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-950'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span>⚙️ Barra Rosc.</span>
                      <span className="text-[9px] font-normal text-slate-500 font-mono">DIN 975/B7</span>
                    </button>
                  </div>
                </div>

                {/* 2. Standard Selection */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-mono text-slate-400 uppercase font-semibold">
                      Norma Técnica ({availableStandards.length})
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsNewStandardModalOpen(true)}
                      className="flex items-center gap-1 text-[11px] font-bold text-cyan-300 hover:text-white bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/70 px-2 py-0.5 rounded transition-all shadow-sm"
                      title="Cadastrar nova norma técnica sem limites (ASTM, DIN, ISO, ABNT) com suporte a IA"
                    >
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>+ Cadastrar Norma</span>
                    </button>
                  </div>
                  <select
                    value={standardCode}
                    onChange={(e) => {
                      const newCode = e.target.value;
                      setStandardCode(newCode);
                      const dims = dimensionsCatalog[newCode] || {};
                      const bitolas = Object.keys(dims);
                      if (bitolas.length > 0 && !dims[bitola]) {
                        setBitola(bitolas[0]);
                        if (dims[bitolas[0]].comprimentos_validos?.length) {
                          setComprimento(dims[bitolas[0]].comprimentos_validos![0]);
                        }
                      }
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

                {/* 3. Bitola (Nominal Size) */}
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

                {/* 4. Comprimento (L) e Sobremetal de Corte (mm) */}
                {family !== 'porca' && family !== 'arruela' && (
                  <div className="grid grid-cols-2 gap-3">
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

                    {/* Sobremetal de Corte */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-mono text-slate-400 uppercase font-semibold flex items-center gap-1">
                          <Scissors className="w-3 h-3 text-rose-400" />
                          <span>Sobremetal Corte</span>
                        </label>
                        <span className="text-[9px] font-mono text-rose-300 bg-rose-950/80 border border-rose-800 px-1 py-0.2 rounded font-bold">
                          MES / Serra
                        </span>
                      </div>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="30"
                        value={sobremetalCorte}
                        onChange={(e) => setSobremetalCorte(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono font-bold text-rose-300 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Resistance Class & Material */}
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
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-mono text-slate-400 uppercase font-semibold">
                    Material Base
                  </label>
                  {getSteelColorBySpec(materialBase) && (
                    <span className="flex items-center gap-1.5 text-[10px] font-mono text-slate-300 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded-full">
                      <SteelColorBadge
                        corPrimariaHex={getSteelColorBySpec(materialBase)!.corPrimariaHex}
                        isBicolor={getSteelColorBySpec(materialBase)!.isBicolor}
                        corSecundariaHex={getSteelColorBySpec(materialBase)!.corSecundariaHex}
                        size={12}
                      />
                      <span className="text-slate-400 font-bold">Ponta:</span>
                      <span className="text-white font-extrabold">{getSteelColorBySpec(materialBase)!.label}</span>
                    </span>
                  )}
                </div>
                <select
                  value={materialBase}
                  onChange={(e) => setMaterialBase(e.target.value as BaseMaterial)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Aço Médio Carbono SAE 1045">SAE 1045 (Médio Carbono • Vermelho)</option>
                  <option value="Aço Carbono SAE 1010/1020">SAE 1010/1020 (Baixo Carbono • Branco)</option>
                  <option value="Aço Liga SAE 4140">SAE 4140 (Cr-Mo Tratado • Verde Escuro)</option>
                  <option value="Aço Liga SAE 4340">SAE 4340 (Ni-Cr-Mo • Verde/Vermelho)</option>
                  <option value="Aço Inoxidável AISI 304 (A2)">Inox AISI 304 (A2 • Amarelo)</option>
                  <option value="Aço Inoxidável AISI 316 (A4)">Inox AISI 316 (A4 • Vermelho Carmesim)</option>
                  <option value="Latão CLA 360">Latão CLA 360</option>
                </select>
              </div>
            </div>

            {/* Surface Finish / Tratamento Superficial */}
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

            {/* Delta Internal / Legacy Code */}
            <div>
              <label className="text-xs font-mono text-slate-400 uppercase font-semibold block mb-1.5">
                Código Interno Delta / Ref. Cliente
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

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveToDatabase}
                className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer ${
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
                className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                <Download className="w-4 h-4 text-cyan-400" />
                <span>{isExportingPdf ? 'Gerando...' : 'Catálogo PDF'}</span>
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
                <span className="text-[11px] font-mono text-slate-400 pl-2">Estilo Gráfico de Projeção:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCadMode('nanquim_a3')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                      cadMode === 'nanquim_a3'
                        ? 'bg-white text-slate-950 shadow-md font-extrabold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <span>📜 Prancheta Nanquim A3 (Clássica ISO)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCadMode('blueprint')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
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
                  dimension={effectiveDimension}
                />
              ) : (
                <CadViewer
                  family={family}
                  standardCode={currentProduct.standard_code}
                  bitola={currentProduct.bitola}
                  dimension={effectiveDimension}
                  comprimento={effectiveComprimento}
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

          {/* TAB 2: BOM (BILL OF MATERIALS) WITH LINEAR METERS & 6M COMMERCIAL BARS */}
          {activeTab === 'bom' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-cyan-400" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
                      Estrutura de Produto (BOM) • Controle em Metros e Barras de 6m
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      Cálculo rigoroso de barras comerciais de 6.000 mm para chão de fábrica e compras.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const desc = prompt('Nome do Insumo adicional:');
                    if (desc) {
                      setCustomBOM([
                        ...customBOM,
                        {
                          id: `bom-${Date.now()}`,
                          description: desc,
                          item_type: 'insumo_quimico',
                          consumption: 1.0,
                          unit: 'kg',
                          loss_factor: 2.0,
                          notes: 'Adicionado manualmente'
                        }
                      ]);
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-950 border border-cyan-800 hover:bg-cyan-900 text-cyan-300 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Adicionar Insumo</span>
                </button>
              </div>

              {/* 6-Meter Commercial Bar Stock Highlight Card */}
              <div className="bg-slate-950 border border-cyan-800/60 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                <div className="space-y-1">
                  <span className="text-slate-400 text-[11px] block">Peças / Barra 6m (6.000mm):</span>
                  <strong className="text-base text-cyan-300">{pecasPorBarra6m} peças</strong>
                  <span className="text-[10px] text-slate-500 block">L_tarugo = {L_tarugo} mm</span>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 text-[11px] block">Retalho / Ponta de Barra:</span>
                  <strong className="text-base text-amber-300">{retalhoBarraMm} mm</strong>
                  <span className="text-[10px] text-slate-500 block">Sobra não aproveitável</span>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 text-[11px] block">Metros Lineares / 1.000 un:</span>
                  <strong className="text-base text-emerald-300">{metrosLinearesMilheiro} m</strong>
                  <span className="text-[10px] text-slate-500 block">Consumo teórico bruto</span>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 text-[11px] block">Barras de 6m Necessárias:</span>
                  <strong className="text-base text-rose-300">{barras6mNecessarias} barras</strong>
                  <span className="text-[10px] text-slate-500 block">Ordem de compra comercial</span>
                </div>
              </div>

              {/* Interactive BOM Table */}
              <div className="overflow-x-auto border border-slate-800 rounded-lg">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Item / Insumo</th>
                      <th className="py-2.5 px-3">Tipo</th>
                      <th className="py-2.5 px-3">Consumo / 1.000 un</th>
                      <th className="py-2.5 px-3">Unidade</th>
                      <th className="py-2.5 px-3">Fator Perda</th>
                      <th className="py-2.5 px-3">Observações de Processo</th>
                      <th className="py-2.5 px-3 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-200">
                    {customBOM.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-800/40">
                        <td className="py-3 px-3 font-semibold text-cyan-300">
                          <div className="flex items-center gap-2">
                            {getSteelColorBySpec(item.description) && (
                              <SteelColorBadge
                                corPrimariaHex={getSteelColorBySpec(item.description)!.corPrimariaHex}
                                isBicolor={getSteelColorBySpec(item.description)!.isBicolor}
                                corSecundariaHex={getSteelColorBySpec(item.description)!.corSecundariaHex}
                                size={14}
                                title={`Código de Cor da Barra: ${getSteelColorBySpec(item.description)!.label}`}
                              />
                            )}
                            <span>{item.description}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-400 capitalize">{item.item_type.replace('_', ' ')}</td>
                        <td className="py-3 px-3 font-bold text-emerald-400">{item.consumption}</td>
                        <td className="py-3 px-3 text-slate-300">{item.unit}</td>
                        <td className="py-3 px-3 text-rose-400 font-bold">{item.loss_factor}%</td>
                        <td className="py-3 px-3 text-slate-400 text-[11px]">{item.notes}</td>
                        <td className="py-3 px-3 text-center">
                          {item.id !== 'bom-1' && (
                            <button
                              type="button"
                              onClick={() => setCustomBOM(customBOM.filter((b) => b.id !== item.id))}
                              className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                              title="Remover insumo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: MES ROUTINGS (INTERACTIVE REORDERING & EDITING) */}
          {activeTab === 'routing' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <ListOrdered className="w-5 h-5 text-cyan-400" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
                      Roteiro de Fabricação Industrial (Routings / MES)
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      Sequência operacional de chão de fábrica reordenável para OEE e tempos padrão.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const name = prompt('Nome da nova operação MES:');
                    if (name) {
                      const newSeq = (routingItems.length + 1) * 10;
                      setRoutingItems([
                        ...routingItems,
                        {
                          seq: newSeq,
                          name,
                          center: 'CENTRO-ESP-01',
                          setup: '15 min',
                          cycle: '10 s/pç',
                          desc: 'Operação adicionada na engenharia de processo'
                        }
                      ]);
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-950 border border-cyan-800 hover:bg-cyan-900 text-cyan-300 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Adicionar Operação</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {routingItems.map((op, idx) => (
                  <div
                    key={op.seq}
                    className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400 font-extrabold flex items-center justify-center shrink-0">
                        {op.seq}
                      </div>
                      <div>
                        <div className="font-bold text-slate-100">{op.name}</div>
                        <div className="text-slate-400 text-[11px] mt-0.5">{op.desc}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-[11px] text-right">
                        <div><span className="text-slate-500">Posto:</span> <strong className="text-amber-400">{op.center}</strong></div>
                        <div><span className="text-slate-500">Setup:</span> {op.setup} • <strong className="text-emerald-400">{op.cycle}</strong></div>
                      </div>

                      {/* Move Up / Down Buttons */}
                      <div className="flex items-center gap-1 pl-2 border-l border-slate-800">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveOperation(idx, 'up')}
                          className="p-1 text-slate-400 hover:text-white disabled:opacity-30 rounded hover:bg-slate-800"
                          title="Mover operação para cima"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === routingItems.length - 1}
                          onClick={() => handleMoveOperation(idx, 'down')}
                          className="p-1 text-slate-400 hover:text-white disabled:opacity-30 rounded hover:bg-slate-800"
                          title="Mover operação para baixo"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setRoutingItems(routingItems.filter((_, i) => i !== idx))}
                          className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 ml-1"
                          title="Remover operação"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
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

          {/* TAB 5: SAVED PRODUCTS HISTORY WITH 1-CLICK PDF DOWNLOAD */}
          {activeTab === 'history' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-cyan-400" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
                      Catálogo & Histórico de Peças Cadastradas ({savedProducts.length})
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      Impressão e download direto de PDF para operadores do chão de fábrica.
                    </p>
                  </div>
                </div>

                <div className="relative w-56">
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Filtrar por SKU ou código..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-3 pr-8 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5" />
                </div>
              </div>

              {savedProducts.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs font-mono">
                  Nenhum produto cadastrado no banco ainda. Configure um fixador ao lado e clique em &quot;Salvar no Supabase&quot;.
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-800 rounded-lg">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">SKU Gerado</th>
                        <th className="py-2.5 px-3">Norma / Projeto</th>
                        <th className="py-2.5 px-3">Bitola</th>
                        <th className="py-2.5 px-3">Classe</th>
                        <th className="py-2.5 px-3">Acabamento</th>
                        <th className="py-2.5 px-3">Peso Líq.</th>
                        <th className="py-2.5 px-3 text-center">Chão de Fábrica & Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {savedProducts
                        .filter(
                          (p) =>
                            p.sku_gerado.toLowerCase().includes(searchFilter.toLowerCase()) ||
                            (p.codigo_interno_delta || '').toLowerCase().includes(searchFilter.toLowerCase()) ||
                            p.standard_code.toLowerCase().includes(searchFilter.toLowerCase())
                        )
                        .map((prod) => (
                          <tr key={prod.id || prod.sku_gerado} className="hover:bg-slate-800/40 transition-colors">
                            <td className="py-3 px-3 font-bold text-cyan-300">{prod.sku_gerado}</td>
                            <td className="py-3 px-3">{prod.standard_code}</td>
                            <td className="py-3 px-3 font-semibold text-amber-300">
                              {prod.bitola} {prod.comprimento ? `x ${prod.comprimento}` : ''}
                            </td>
                            <td className="py-3 px-3">{prod.classe_resistencia}</td>
                            <td className="py-3 px-3 text-slate-400">{prod.tratamento_superficial}</td>
                            <td className="py-3 px-3 font-semibold text-emerald-400">
                              {(prod.peso_liquido_kg * 1000).toFixed(1)}g
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex items-center justify-center gap-2">
                                {/* 1-Click PDF Download for Factory Floor Operators */}
                                <button
                                  type="button"
                                  onClick={() => handleDownloadPdfFromHistory(prod)}
                                  className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded font-bold text-[11px] shadow transition-all cursor-pointer"
                                  title="Baixar PDF da prancha técnica A3 para o operador"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  <span>PDF da Peça</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleLoadFromHistory(prod)}
                                  className="flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded font-semibold text-[11px] transition-colors cursor-pointer"
                                  title="Carregar parâmetros no configurador CAD"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Carregar</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteProduct(prod.sku_gerado)}
                                  className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                                  title="Excluir do catálogo"
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
              )}
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Standards Registration Modal with Lynx VPS AI */}
      <NewStandardModal
        isOpen={isNewStandardModalOpen}
        onClose={() => setIsNewStandardModalOpen(false)}
        onStandardCreated={handleStandardCreated}
      />
    </div>
  );
}
