// src/components/forms/NewStandardModal.tsx - Dynamic Technical Standard Registration Modal with Lynx VPS AI & CAD Conception
'use client';

import React, { useState } from 'react';
import {
  X,
  Bot,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Compass,
  FileCode2,
  Maximize2
} from 'lucide-react';
import {
  EngineeringStandard,
  StandardFamily,
  StandardSystem,
  GeometricArchetype,
  StandardDimension
} from '@/lib/standards/types';

interface CadConceptionDetails {
  cad_title?: string;
  projection_2d?: string;
  isometric_3d?: string;
  dimensioning_rules?: string;
  raw_envelope_formula?: string;
  thread_formula?: string;
  notes?: string;
}

interface NewStandardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStandardCreated: (standard: EngineeringStandard, dimensions: Record<string, StandardDimension>) => void;
}

export function NewStandardModal({ isOpen, onClose, onStandardCreated }: NewStandardModalProps) {
  const [standardCode, setStandardCode] = useState('');
  const [family, setFamily] = useState<StandardFamily>('parafuso');
  const [system, setSystem] = useState<StandardSystem>('metrico');
  const [description, setDescription] = useState('');
  const [archetype, setArchetype] = useState<GeometricArchetype>('hex_bolt');
  const [cadConception, setCadConception] = useState<CadConceptionDetails | null>(null);
  const [isSearchingAi, setIsSearchingAi] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Editable dimensions table (Default initialization with ABNT / DIN standard set)
  const [dimensions, setDimensions] = useState<StandardDimension[]>([
    {
      bitola: 'M6',
      diametro_nominal: 6,
      passo: 1.0,
      chave: 10,
      altura_cabeca: 4.0,
      vertice: 11.05,
      diametro_assentamento: 9.5,
      comprimentos_validos: [16, 20, 25, 30, 35, 40, 50]
    },
    {
      bitola: 'M8',
      diametro_nominal: 8,
      passo: 1.25,
      chave: 13,
      altura_cabeca: 5.3,
      vertice: 14.38,
      diametro_assentamento: 12.5,
      comprimentos_validos: [20, 25, 30, 35, 40, 50, 60]
    },
    {
      bitola: 'M10',
      diametro_nominal: 10,
      passo: 1.5,
      chave: 16,
      altura_cabeca: 6.4,
      vertice: 17.77,
      diametro_assentamento: 15.5,
      comprimentos_validos: [25, 30, 35, 40, 50, 60, 80]
    },
    {
      bitola: 'M12',
      diametro_nominal: 12,
      passo: 1.75,
      chave: 18,
      altura_cabeca: 7.5,
      vertice: 20.03,
      diametro_assentamento: 17.5,
      comprimentos_validos: [30, 40, 50, 60, 70, 80, 100]
    },
    {
      bitola: 'M16',
      diametro_nominal: 16,
      passo: 2.0,
      chave: 24,
      altura_cabeca: 10.0,
      vertice: 26.75,
      diametro_assentamento: 23.5,
      comprimentos_validos: [40, 50, 60, 70, 80, 100, 120]
    },
    {
      bitola: 'M20',
      diametro_nominal: 20,
      passo: 2.5,
      chave: 30,
      altura_cabeca: 12.5,
      vertice: 33.53,
      diametro_assentamento: 29.5,
      comprimentos_validos: [50, 60, 70, 80, 100, 120, 140]
    }
  ]);

  if (!isOpen) return null;

  // Search standard parameters with Lynx VPS AI & DeltaFix Normative Database
  const handleAiLookup = async () => {
    if (!standardCode.trim()) {
      setErrorMsg('Informe o código da norma para pesquisar (ex: ABNT NBR 10115, DIN 912, ASTM A325, DIN 985).');
      return;
    }

    setIsSearchingAi(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/ai/suggest-standard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          standardCode: standardCode.trim(),
          system
        })
      });

      const json = await res.json();
      if (!res.ok || !json.data) {
        throw new Error(json.error || 'Falha ao buscar especificações da norma.');
      }

      const data = json.data;
      if (data.family) setFamily(data.family);
      if (data.system) setSystem(data.system);
      if (data.description) setDescription(data.description);
      if (data.geometric_archetype) setArchetype(data.geometric_archetype);
      if (data.cad_conception) setCadConception(data.cad_conception);
      if (Array.isArray(data.dimensions) && data.dimensions.length > 0) {
        setDimensions(data.dimensions);
      }

      setSuccessMsg(
        `Especificação técnica para ${standardCode} carregada com sucesso via ${
          json.source === 'vps_ai' ? 'Lynx VPS AI' : 'Base Normativa DeltaFix'
        }!`
      );
    } catch (err: any) {
      console.error('Error looking up standard:', err);
      setErrorMsg(err.message || 'Erro ao conectar à IA da VPS.');
    } finally {
      setIsSearchingAi(false);
    }
  };

  // Add row to dimensions table with smart defaults
  const handleAddRow = () => {
    const isAstm = system === 'polegada';
    if (family === 'arruela') {
      const nextD = dimensions.length > 0 ? dimensions[dimensions.length - 1].diametro_nominal + 2 : 6;
      setDimensions([
        ...dimensions,
        {
          bitola: `M${nextD}`,
          diametro_nominal: nextD,
          passo: 1.0,
          diametro_interno: Number((nextD + 0.4).toFixed(1)),
          diametro_externo: Number((nextD * 2).toFixed(1)),
          espessura: 2.0
        }
      ]);
      return;
    }

    if (family === 'porca') {
      const nextD = dimensions.length > 0 ? dimensions[dimensions.length - 1].diametro_nominal + 2 : 10;
      const s = Math.round(nextD * 1.6);
      setDimensions([
        ...dimensions,
        {
          bitola: `M${nextD}`,
          diametro_nominal: nextD,
          passo: 1.5,
          chave: s,
          altura_cabeca: Math.round(nextD * 0.8),
          vertice: Number((s * 1.1547).toFixed(2)),
          diametro_assentamento: Number((s * 0.95).toFixed(1))
        }
      ]);
      return;
    }

    // Default Bolt / Stud
    const nextNominal = dimensions.length > 0 ? dimensions[dimensions.length - 1].diametro_nominal + 2 : 12;
    const s = Math.round(nextNominal * 1.6);
    setDimensions([
      ...dimensions,
      {
        bitola: isAstm ? '1/2"-13' : `M${nextNominal}`,
        diametro_nominal: nextNominal,
        passo: 1.75,
        chave: s,
        altura_cabeca: Math.round(nextNominal * 0.65),
        vertice: Number((s * 1.1547).toFixed(2)),
        diametro_assentamento: Number((s * 0.95).toFixed(1)),
        diametro_cabeca: archetype === 'socket_head_allen' ? nextNominal * 1.5 : undefined,
        profundidade_sextavado: archetype === 'socket_head_allen' ? nextNominal * 0.5 : undefined,
        comprimentos_validos: [40, 50, 60, 80, 100]
      }
    ]);
  };

  // Remove row
  const handleRemoveRow = (index: number) => {
    setDimensions(dimensions.filter((_, idx) => idx !== index));
  };

  // Update field in row
  const handleUpdateRow = (index: number, field: keyof StandardDimension, value: any) => {
    const updated = [...dimensions];
    (updated[index] as any)[field] = value;
    if (field === 'chave' && value) {
      updated[index].vertice = Number((Number(value) * 1.1547).toFixed(2));
      if (!updated[index].diametro_assentamento) {
        updated[index].diametro_assentamento = Number((Number(value) * 0.95).toFixed(1));
      }
    }
    setDimensions(updated);
  };

  // Submit and save to database
  const handleSaveStandard = async () => {
    if (!standardCode.trim()) {
      setErrorMsg('O código da norma é obrigatório.');
      return;
    }
    if (dimensions.length === 0) {
      setErrorMsg('Cadastre ao menos uma bitola para esta norma.');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    const standardPayload: EngineeringStandard = {
      code: standardCode.trim().toUpperCase(),
      family,
      system,
      description: description.trim() || `Norma Técnica ${standardCode.trim().toUpperCase()}`,
      geometric_archetype: archetype,
      calculation_formulas: {
        geometric_archetype: archetype,
        system,
        cad_conception: cadConception
      }
    };

    try {
      const res = await fetch('/api/standards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          standard: standardPayload,
          dimensions
        })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erro ao gravar norma no Supabase.');

      const dimMap: Record<string, StandardDimension> = {};
      for (const d of dimensions) {
        dimMap[d.bitola] = d;
      }

      onStandardCreated(standardPayload, dimMap);
      onClose();
    } catch (err: any) {
      console.error('Error saving standard:', err);
      setErrorMsg(err.message || 'Erro ao gravar norma.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-800 bg-slate-950/90">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-amber-500 flex items-center justify-center text-slate-950 font-bold shadow-md">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                Cadastrar Nova Norma Técnica Paramétrica
                <span className="text-[10px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded font-extrabold">
                  ABNT / DIN / ASTM / ISO / ASME
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Gere matrizes dimensionais completas e diretrizes de projeção CAD com inteligência Lynx VPS AI.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Section 1: Standard Identification & AI Search */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row items-end gap-3">
              <div className="flex-1 w-full">
                <label className="text-xs font-mono text-slate-400 uppercase font-semibold block mb-1">
                  Código da Norma Técnica (ex.: ABNT NBR 10115, DIN 912, ASTM A325, DIN 7991, DIN 985)
                </label>
                <input
                  type="text"
                  value={standardCode}
                  onChange={(e) => setStandardCode(e.target.value)}
                  placeholder="Digite o código da norma..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono font-bold text-amber-300 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* AI Auto-fill Button */}
              <button
                type="button"
                disabled={isSearchingAi || !standardCode.trim()}
                onClick={handleAiLookup}
                className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 shrink-0 cursor-pointer"
              >
                <Bot className={`w-4 h-4 ${isSearchingAi ? 'animate-spin' : ''}`} />
                <span>{isSearchingAi ? 'Consultando IA...' : 'Buscar Padrões com IA'}</span>
              </button>
            </div>

            {/* System, Family & Geometric Archetype */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Sistema Dimensional</label>
                <select
                  value={system}
                  onChange={(e) => setSystem(e.target.value as StandardSystem)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="metrico">Métrico (mm / DIN / ISO / ABNT)</option>
                  <option value="polegada">Polegada (Pol / ASTM / ASME)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Família do Fixador</label>
                <select
                  value={family}
                  onChange={(e) => {
                    const fam = e.target.value as StandardFamily;
                    setFamily(fam);
                    if (fam === 'porca') setArchetype('hex_nut');
                    else if (fam === 'arruela') setArchetype('washer_plain');
                    else if (fam === 'prisioneiro') setArchetype('stud_bolt');
                    else if (fam === 'parafuso' && archetype === 'hex_nut') setArchetype('hex_bolt');
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="parafuso">🔩 Parafuso</option>
                  <option value="prisioneiro">📌 Prisioneiro / Barra Roscada</option>
                  <option value="porca">🔘 Porca</option>
                  <option value="arruela">⭕ Arruela</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Modelo de Desenho CAD</label>
                <select
                  value={archetype}
                  onChange={(e) => setArchetype(e.target.value as GeometricArchetype)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-amber-300 font-bold focus:outline-none focus:border-cyan-500"
                >
                  <option value="hex_bolt">Sextavado Padrão (DIN 933/931 / ABNT NBR 10115)</option>
                  <option value="heavy_hex_bolt">Sextavado Pesado (ASTM A325 / A490 / B18.2.6)</option>
                  <option value="socket_head_allen">Allen Cilíndrico com Recartilhado (DIN 912 / ISO 4762)</option>
                  <option value="countersunk_allen">Escareado 90° Allen (DIN 7991 / ISO 10642)</option>
                  <option value="stud_bolt">Prisioneiro / Barra Roscada (ASTM A193 B7 / DIN 975)</option>
                  <option value="hex_nut">Porca Sextavada (DIN 934 / ASTM A563 / DIN 985)</option>
                  <option value="washer_plain">Arruela Lisa (DIN 125 / ASTM F436)</option>
                  <option value="washer_spring">Arruela de Pressão Helicoidal (DIN 127)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">Descrição Técnica / Aplicação</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Parafusos de Cabeça Sextavada - Grau de Produto C conforme ABNT NBR 10115"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Section 2: Concepção de Desenho CAD Paramétrico (ISO 128 / ABNT) */}
          <div className="bg-slate-950 border border-cyan-900/60 rounded-xl p-4 space-y-3 shadow-md bg-gradient-to-b from-slate-950 to-cyan-950/20">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-mono uppercase font-bold text-cyan-300 flex items-center gap-2">
                  Concepção de Desenho CAD Paramétrico (ISO 128 / ABNT NBR)
                  <span className="text-[10px] font-mono bg-cyan-900/80 text-cyan-300 px-2 py-0.5 rounded border border-cyan-700">
                    Projeção 2D + Isométrica 3D
                  </span>
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Arquétipo CAD: <strong className="text-amber-400">{archetype}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
              {/* Live Vector Blueprint Schematic SVG Preview */}
              <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800 rounded-lg p-2.5 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-mono text-slate-400 mb-1">Esquema Técnico de Projeção</span>
                <div className="w-full h-32 flex items-center justify-center bg-slate-950 rounded border border-slate-800/80 p-1 overflow-hidden">
                  {/* Dynamic SVG Schematic Based on Archetype */}
                  {archetype === 'socket_head_allen' ? (
                    <svg viewBox="0 0 160 80" className="w-full h-full text-cyan-400 stroke-current fill-none">
                      {/* Allen Head with knurling and socket */}
                      <rect x="15" y="15" width="30" height="50" rx="1" fill="#0f172a" strokeWidth="1.5" />
                      <line x1="22" y1="15" x2="22" y2="65" stroke="#334155" strokeDasharray="2,2" strokeWidth="0.8" />
                      <line x1="38" y1="15" x2="38" y2="65" stroke="#334155" strokeDasharray="2,2" strokeWidth="0.8" />
                      {/* Socket recess lines */}
                      <path d="M 15 28 L 28 28 L 28 52 L 15 52" stroke="#38bdf8" strokeDasharray="3,2" strokeWidth="1" />
                      {/* Shank */}
                      <rect x="45" y="24" width="95" height="32" fill="#0f172a" strokeWidth="1.5" />
                      {/* Thread lines */}
                      <line x1="80" y1="24" x2="80" y2="56" stroke="#38bdf8" strokeWidth="1.2" />
                      <line x1="80" y1="27" x2="140" y2="27" stroke="#38bdf8" strokeWidth="0.8" strokeDasharray="3,1" />
                      <line x1="80" y1="53" x2="140" y2="53" stroke="#38bdf8" strokeWidth="0.8" strokeDasharray="3,1" />
                      {/* Centerline in front */}
                      <line x1="5" y1="40" x2="155" y2="40" stroke="#f59e0b" strokeWidth="1" strokeDasharray="12,3,2,3" />
                      {/* Cotas */}
                      <text x="30" y="73" fill="#94a3b8" fontSize="8" textAnchor="middle" stroke="none">k</text>
                      <text x="92" y="73" fill="#94a3b8" fontSize="8" textAnchor="middle" stroke="none">L</text>
                      <text x="8" y="43" fill="#38bdf8" fontSize="8" textAnchor="end" stroke="none">dk</text>
                    </svg>
                  ) : archetype === 'countersunk_allen' ? (
                    <svg viewBox="0 0 160 80" className="w-full h-full text-cyan-400 stroke-current fill-none">
                      {/* Countersunk 90 head */}
                      <polygon points="15,10 40,25 40,55 15,70" fill="#0f172a" strokeWidth="1.5" />
                      {/* Socket recess */}
                      <path d="M 15 32 L 25 32 L 25 48 L 15 48" stroke="#38bdf8" strokeDasharray="2,2" strokeWidth="1" />
                      {/* Shank */}
                      <rect x="40" y="25" width="100" height="30" fill="#0f172a" strokeWidth="1.5" />
                      <line x1="75" y1="25" x2="75" y2="55" stroke="#38bdf8" strokeWidth="1.2" />
                      {/* Centerline */}
                      <line x1="5" y1="40" x2="155" y2="40" stroke="#f59e0b" strokeWidth="1" strokeDasharray="12,3,2,3" />
                      <text x="75" y="73" fill="#94a3b8" fontSize="8" textAnchor="middle" stroke="none">L (Total c/ cabeça)</text>
                    </svg>
                  ) : archetype === 'hex_nut' ? (
                    <svg viewBox="0 0 160 80" className="w-full h-full text-amber-400 stroke-current fill-none">
                      {/* Hex Nut Front */}
                      <rect x="45" y="15" width="70" height="50" rx="3" fill="#0f172a" strokeWidth="1.5" />
                      <line x1="45" y1="28" x2="115" y2="28" stroke="#334155" strokeWidth="0.8" />
                      <line x1="45" y1="52" x2="115" y2="52" stroke="#334155" strokeWidth="0.8" />
                      {/* Thread hole dashed */}
                      <line x1="45" y1="24" x2="115" y2="24" stroke="#38bdf8" strokeDasharray="3,2" strokeWidth="1" />
                      <line x1="45" y1="56" x2="115" y2="56" stroke="#38bdf8" strokeDasharray="3,2" strokeWidth="1" />
                      {/* Centerline */}
                      <line x1="30" y1="40" x2="130" y2="40" stroke="#f59e0b" strokeWidth="1" strokeDasharray="12,3,2,3" />
                      <text x="80" y="73" fill="#94a3b8" fontSize="8" textAnchor="middle" stroke="none">Altura m</text>
                      <text x="35" y="43" fill="#38bdf8" fontSize="8" textAnchor="end" stroke="none">s</text>
                    </svg>
                  ) : archetype === 'washer_plain' || archetype === 'washer_spring' ? (
                    <svg viewBox="0 0 160 80" className="w-full h-full text-cyan-400 stroke-current fill-none">
                      {/* Washer side section */}
                      <rect x="65" y="10" width="30" height="18" fill="#0f172a" strokeWidth="1.5" />
                      <rect x="65" y="52" width="30" height="18" fill="#0f172a" strokeWidth="1.5" />
                      {/* Hole */}
                      <line x1="50" y1="40" x2="110" y2="40" stroke="#f59e0b" strokeWidth="1" strokeDasharray="12,3,2,3" />
                      <text x="80" y="77" fill="#94a3b8" fontSize="8" textAnchor="middle" stroke="none">Espessura h</text>
                      <text x="55" y="22" fill="#38bdf8" fontSize="8" textAnchor="end" stroke="none">d2</text>
                      <text x="55" y="34" fill="#f59e0b" fontSize="8" textAnchor="end" stroke="none">d1</text>
                    </svg>
                  ) : archetype === 'stud_bolt' ? (
                    <svg viewBox="0 0 160 80" className="w-full h-full text-cyan-400 stroke-current fill-none">
                      {/* Stud Bolt */}
                      <rect x="15" y="24" width="130" height="32" rx="1" fill="#0f172a" strokeWidth="1.5" />
                      {/* Thread grooves */}
                      <line x1="15" y1="27" x2="145" y2="27" stroke="#38bdf8" strokeDasharray="4,2" strokeWidth="0.8" />
                      <line x1="15" y1="53" x2="145" y2="53" stroke="#38bdf8" strokeDasharray="4,2" strokeWidth="0.8" />
                      {/* End chamfers */}
                      <line x1="15" y1="24" x2="18" y2="40" stroke="#38bdf8" strokeWidth="1" />
                      <line x1="15" y1="56" x2="18" y2="40" stroke="#38bdf8" strokeWidth="1" />
                      {/* Centerline */}
                      <line x1="5" y1="40" x2="155" y2="40" stroke="#f59e0b" strokeWidth="1" strokeDasharray="12,3,2,3" />
                      <text x="80" y="73" fill="#94a3b8" fontSize="8" textAnchor="middle" stroke="none">L_tarugo = L + sobremetal</text>
                    </svg>
                  ) : (
                    /* Hex Bolt Standard / Heavy Hex */
                    <svg viewBox="0 0 160 80" className="w-full h-full text-amber-400 stroke-current fill-none">
                      {/* Hex Head with facets */}
                      <rect x="15" y="14" width="25" height="52" rx="1" fill="#0f172a" strokeWidth="1.5" />
                      <line x1="15" y1="27" x2="40" y2="27" stroke="#334155" strokeWidth="0.8" />
                      <line x1="15" y1="53" x2="40" y2="53" stroke="#334155" strokeWidth="0.8" />
                      {/* Washer face collar */}
                      <rect x="40" y="16" width="3" height="48" fill="#38bdf8" strokeWidth="0.5" />
                      {/* Shank */}
                      <rect x="43" y="24" width="97" height="32" fill="#0f172a" strokeWidth="1.5" />
                      <line x1="85" y1="24" x2="85" y2="56" stroke="#38bdf8" strokeWidth="1.2" />
                      <line x1="85" y1="27" x2="140" y2="27" stroke="#38bdf8" strokeWidth="0.8" strokeDasharray="3,1" />
                      <line x1="85" y1="53" x2="140" y2="53" stroke="#38bdf8" strokeWidth="0.8" strokeDasharray="3,1" />
                      {/* Centerline on top */}
                      <line x1="5" y1="40" x2="155" y2="40" stroke="#f59e0b" strokeWidth="1" strokeDasharray="12,3,2,3" />
                      <text x="27" y="73" fill="#94a3b8" fontSize="8" textAnchor="middle" stroke="none">k</text>
                      <text x="91" y="73" fill="#94a3b8" fontSize="8" textAnchor="middle" stroke="none">L</text>
                      <text x="8" y="43" fill="#38bdf8" fontSize="8" textAnchor="end" stroke="none">s</text>
                    </svg>
                  )}
                </div>
                <span className="text-[10px] text-cyan-300 font-mono mt-1">Linha de centro à frente e cotas ISO</span>
              </div>

              {/* Technical Projection Description */}
              <div className="lg:col-span-8 space-y-2 text-xs">
                <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800">
                  <div className="text-[11px] font-mono text-cyan-400 font-bold mb-0.5">
                    1. Representação Técnica 2D (Vista Ortográfica):
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {cadConception?.projection_2d ||
                      'Vista longitudinal com linha de centro contínua e visível (traço-e-ponto). Cabeça modelada com raios de concordância, chanfros normalizados e face de assentamento usinada. Haste cotada com diâmetro nominal e crista de rosca.'}
                  </p>
                </div>

                <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800">
                  <div className="text-[11px] font-mono text-amber-400 font-bold mb-0.5">
                    2. Vista Isométrica 3D (Axonométrica 30°):
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {cadConception?.isometric_3d ||
                      'Projeção 3D a 30° exibindo facetas volumétricas realistas, chanfros de entrada, triângulo de orientação e alinhamento geométrico no quadrante superior direito da folha A3.'}
                  </p>
                </div>

                <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">Fórmula de Tarugo Bruto de Corte:</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {cadConception?.raw_envelope_formula ||
                        (archetype === 'countersunk_allen'
                          ? 'L_tarugo = L + sobremetal'
                          : 'L_tarugo = (k + L) + sobremetal')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">Linha de Centro:</span>
                    <span className="text-xs font-mono font-bold text-amber-400">Sobreposta / À Frente do Corpo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Interactive Dimensional Matrix Table */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-mono uppercase font-bold text-slate-200">
                  Matriz Dimensional Padronizada da Norma ({dimensions.length} Bitolas)
                </h3>
              </div>
              <button
                type="button"
                onClick={handleAddRow}
                className="flex items-center gap-1.5 px-3 py-1 bg-cyan-950 border border-cyan-800 hover:bg-cyan-900 text-cyan-300 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Bitola</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-800 rounded-lg max-h-[340px] custom-scrollbar">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900/95 sticky top-0 text-slate-400 text-[10px] uppercase border-b border-slate-800 z-10">
                  <tr>
                    <th className="p-2.5">Bitola</th>
                    <th className="p-2.5">Ø Nominal (d)</th>
                    {family !== 'arruela' && <th className="p-2.5">Passo / TPI</th>}

                    {/* Columns dynamically adjusted per family/archetype */}
                    {family === 'arruela' ? (
                      <>
                        <th className="p-2.5">Ø Interno (d1)</th>
                        <th className="p-2.5">Ø Externo (d2)</th>
                        <th className="p-2.5">Espessura (h/s)</th>
                      </>
                    ) : archetype === 'socket_head_allen' ? (
                      <>
                        <th className="p-2.5">Ø Cabeça (dk)</th>
                        <th className="p-2.5">Alt. Cabeça (k)</th>
                        <th className="p-2.5">Chave Allen (s)</th>
                        <th className="p-2.5">Prof. Encaixe (t)</th>
                      </>
                    ) : archetype === 'countersunk_allen' ? (
                      <>
                        <th className="p-2.5">Ø Maior Cabeça (dk)</th>
                        <th className="p-2.5">Alt. Cabeça (k)</th>
                        <th className="p-2.5">Chave (s)</th>
                        <th className="p-2.5">Prof. Encaixe (t)</th>
                      </>
                    ) : family === 'porca' ? (
                      <>
                        <th className="p-2.5">Chave (s)</th>
                        <th className="p-2.5">Altura Porca (m)</th>
                        <th className="p-2.5">Vértice (e)</th>
                        <th className="p-2.5">Ø Assent. (dw)</th>
                      </>
                    ) : family === 'prisioneiro' ? (
                      <>
                        <th className="p-2.5">Tipo de Rosca</th>
                        <th className="p-2.5">Comprimentos Típicos</th>
                      </>
                    ) : (
                      /* Hex Bolt Standard */
                      <>
                        <th className="p-2.5">Chave (s)</th>
                        <th className="p-2.5">Alt. Cabeça (k)</th>
                        <th className="p-2.5">Vértice (e)</th>
                        <th className="p-2.5">Face Assent. (dw)</th>
                      </>
                    )}

                    <th className="p-2.5 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {dimensions.map((dim, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/60 transition-colors">
                      <td className="p-2">
                        <input
                          type="text"
                          value={dim.bitola}
                          onChange={(e) => handleUpdateRow(idx, 'bitola', e.target.value)}
                          className="w-24 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-bold text-amber-300 focus:border-cyan-500 focus:outline-none"
                        />
                      </td>

                      <td className="p-2">
                        <input
                          type="number"
                          step="0.01"
                          value={dim.diametro_nominal}
                          onChange={(e) => handleUpdateRow(idx, 'diametro_nominal', Number(e.target.value))}
                          className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                        />
                      </td>

                      {family !== 'arruela' && (
                        <td className="p-2">
                          <input
                            type="number"
                            step="0.01"
                            value={dim.passo}
                            onChange={(e) => handleUpdateRow(idx, 'passo', Number(e.target.value))}
                            className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                          />
                        </td>
                      )}

                      {/* Washer Fields */}
                      {family === 'arruela' && (
                        <>
                          <td className="p-2">
                            <input
                              type="number"
                              step="0.01"
                              value={dim.diametro_interno || ''}
                              onChange={(e) => handleUpdateRow(idx, 'diametro_interno', Number(e.target.value))}
                              placeholder="d1"
                              className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              step="0.01"
                              value={dim.diametro_externo || ''}
                              onChange={(e) => handleUpdateRow(idx, 'diametro_externo', Number(e.target.value))}
                              placeholder="d2"
                              className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              step="0.01"
                              value={dim.espessura || ''}
                              onChange={(e) => handleUpdateRow(idx, 'espessura', Number(e.target.value))}
                              placeholder="h"
                              className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                            />
                          </td>
                        </>
                      )}

                      {/* Allen Cylinder (DIN 912) Fields */}
                      {archetype === 'socket_head_allen' && (
                        <>
                          <td className="p-2">
                            <input
                              type="number"
                              step="0.01"
                              value={dim.diametro_cabeca || ''}
                              onChange={(e) => handleUpdateRow(idx, 'diametro_cabeca', Number(e.target.value))}
                              placeholder="dk"
                              className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-cyan-300 focus:border-cyan-500 focus:outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              step="0.01"
                              value={dim.altura_cabeca || ''}
                              onChange={(e) => handleUpdateRow(idx, 'altura_cabeca', Number(e.target.value))}
                              placeholder="k"
                              className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              step="0.01"
                              value={dim.chave || ''}
                              onChange={(e) => handleUpdateRow(idx, 'chave', Number(e.target.value))}
                              placeholder="s"
                              className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              step="0.01"
                              value={dim.profundidade_sextavado || ''}
                              onChange={(e) => handleUpdateRow(idx, 'profundidade_sextavado', Number(e.target.value))}
                              placeholder="t"
                              className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-amber-300 focus:border-cyan-500 focus:outline-none"
                            />
                          </td>
                        </>
                      )}

                      {/* Countersunk Allen (DIN 7991) Fields */}
                      {archetype === 'countersunk_allen' && (
                        <>
                          <td className="p-2">
                            <input
                              type="number"
                              step="0.01"
                              value={dim.diametro_cabeca || ''}
                              onChange={(e) => handleUpdateRow(idx, 'diametro_cabeca', Number(e.target.value))}
                              placeholder="dk"
                              className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-cyan-300 focus:border-cyan-500 focus:outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              step="0.01"
                              value={dim.altura_cabeca || ''}
                              onChange={(e) => handleUpdateRow(idx, 'altura_cabeca', Number(e.target.value))}
                              placeholder="k"
                              className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              step="0.01"
                              value={dim.chave || ''}
                              onChange={(e) => handleUpdateRow(idx, 'chave', Number(e.target.value))}
                              placeholder="s"
                              className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              step="0.01"
                              value={dim.profundidade_sextavado || ''}
                              onChange={(e) => handleUpdateRow(idx, 'profundidade_sextavado', Number(e.target.value))}
                              placeholder="t"
                              className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-amber-300 focus:border-cyan-500 focus:outline-none"
                            />
                          </td>
                        </>
                      )}

                      {/* Nut Fields */}
                      {family === 'porca' && (
                        <>
                          <td className="p-2">
                            <input
                              type="number"
                              step="0.01"
                              value={dim.chave || ''}
                              onChange={(e) => handleUpdateRow(idx, 'chave', Number(e.target.value))}
                              placeholder="s"
                              className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              step="0.01"
                              value={dim.altura_cabeca || ''}
                              onChange={(e) => handleUpdateRow(idx, 'altura_cabeca', Number(e.target.value))}
                              placeholder="m"
                              className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                            />
                          </td>
                          <td className="p-2 text-slate-400 font-mono text-[11px]">
                            {dim.vertice || (dim.chave ? (dim.chave * 1.1547).toFixed(1) : '-')}
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              step="0.01"
                              value={dim.diametro_assentamento || ''}
                              onChange={(e) => handleUpdateRow(idx, 'diametro_assentamento', Number(e.target.value))}
                              placeholder="dw"
                              className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                            />
                          </td>
                        </>
                      )}

                      {/* Stud Bolt Fields */}
                      {family === 'prisioneiro' && (
                        <>
                          <td className="p-2 text-slate-300 font-mono text-[11px]">
                            {system === 'polegada' ? 'UNC / 8-UN' : 'Métrica ISO'}
                          </td>
                          <td className="p-2 text-slate-400 font-mono text-[10px]">
                            {dim.comprimentos_validos?.join(', ') || '50 a 300 mm'}
                          </td>
                        </>
                      )}

                      {/* Hex Bolt Fields (ABNT NBR 10115 / DIN 933 / ASTM A325) */}
                      {family === 'parafuso' &&
                        archetype !== 'socket_head_allen' &&
                        archetype !== 'countersunk_allen' && (
                          <>
                            <td className="p-2">
                              <input
                                type="number"
                                step="0.01"
                                value={dim.chave || ''}
                                onChange={(e) => handleUpdateRow(idx, 'chave', Number(e.target.value))}
                                placeholder="s"
                                className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                step="0.01"
                                value={dim.altura_cabeca || ''}
                                onChange={(e) => handleUpdateRow(idx, 'altura_cabeca', Number(e.target.value))}
                                placeholder="k"
                                className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                              />
                            </td>
                            <td className="p-2 text-slate-400 font-mono text-[11px]">
                              {dim.vertice || (dim.chave ? (dim.chave * 1.1547).toFixed(1) : '-')}
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                step="0.01"
                                value={dim.diametro_assentamento || ''}
                                onChange={(e) => handleUpdateRow(idx, 'diametro_assentamento', Number(e.target.value))}
                                placeholder="dw"
                                className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                              />
                            </td>
                          </>
                        )}

                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(idx)}
                          className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded transition-colors"
                          title="Remover Bitola"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/95">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            disabled={isSaving || dimensions.length === 0}
            onClick={handleSaveStandard}
            className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-lg transition-all disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4 text-slate-950" />
            <span>{isSaving ? 'Gravando no Supabase...' : 'Salvar Norma no DeltaFix'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
