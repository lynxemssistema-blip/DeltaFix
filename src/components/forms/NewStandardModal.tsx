// src/components/forms/NewStandardModal.tsx - Dynamic Technical Standard Registration Modal with VPS AI Assistance
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
  Sparkles,
  Layers,
  Wrench,
  HelpCircle
} from 'lucide-react';
import {
  EngineeringStandard,
  StandardFamily,
  StandardSystem,
  GeometricArchetype,
  StandardDimension
} from '@/lib/standards/types';

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
  const [isSearchingAi, setIsSearchingAi] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Editable dimensions table
  const [dimensions, setDimensions] = useState<StandardDimension[]>([
    {
      bitola: 'M10',
      diametro_nominal: 10,
      passo: 1.5,
      chave: 16,
      altura_cabeca: 6.4,
      vertice: 18.5,
      comprimentos_validos: [30, 40, 50, 60, 80]
    },
    {
      bitola: 'M12',
      diametro_nominal: 12,
      passo: 1.75,
      chave: 18,
      altura_cabeca: 7.5,
      vertice: 20.8,
      comprimentos_validos: [40, 50, 60, 70, 80, 100]
    },
    {
      bitola: 'M16',
      diametro_nominal: 16,
      passo: 2.0,
      chave: 24,
      altura_cabeca: 10.0,
      vertice: 27.7,
      comprimentos_validos: [45, 50, 60, 70, 80, 100, 120]
    }
  ]);

  if (!isOpen) return null;

  // Search standard parameters with Lynx VPS AI
  const handleAiLookup = async () => {
    if (!standardCode.trim()) {
      setErrorMsg('Informe o código da norma para pesquisar (ex: ASTM A325 ou DIN 7991).');
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
      if (Array.isArray(data.dimensions) && data.dimensions.length > 0) {
        setDimensions(data.dimensions);
      }

      setSuccessMsg(
        `Especificação técnica para ${standardCode} carregada via ${json.source === 'vps_ai' ? 'Lynx VPS AI' : 'Base Normativa DeltaFix'}!`
      );
    } catch (err: any) {
      console.error('Error looking up standard:', err);
      setErrorMsg(err.message || 'Erro ao conectar à IA da VPS.');
    } finally {
      setIsSearchingAi(false);
    }
  };

  // Add row to dimensions table
  const handleAddRow = () => {
    const isAstm = system === 'polegada';
    setDimensions([
      ...dimensions,
      {
        bitola: isAstm ? '1/2"-13' : `M${dimensions.length * 2 + 10}`,
        diametro_nominal: 12,
        passo: 1.75,
        chave: 18,
        altura_cabeca: 7.5,
        vertice: 20.8,
        comprimentos_validos: [40, 50, 60, 80]
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
        system
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/90">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-amber-500 flex items-center justify-center text-slate-950 font-bold">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Cadastrar Nova Norma Técnica Paramétrica
                <span className="text-[10px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded font-extrabold">
                  DIN / ASTM / ISO / ASME
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Cadastre qualquer norma sem limites com preenchimento automático inteligente via Lynx VPS AI.
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
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Section 1: Standard Identification & AI Search */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
            <div className="flex flex-col sm:flex-row items-end gap-3">
              <div className="flex-1 w-full">
                <label className="text-xs font-mono text-slate-400 uppercase font-semibold block mb-1">
                  Código da Norma Técnica (ex.: ASTM A325, DIN 7991, ASTM A193 B7)
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
                className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-lg shadow flex items-center justify-center gap-2 transition-all disabled:opacity-50 shrink-0"
              >
                <Bot className={`w-4 h-4 ${isSearchingAi ? 'animate-spin' : ''}`} />
                <span>{isSearchingAi ? 'Buscando na IA...' : 'Buscar Padrões com IA'}</span>
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
                  <option value="metrico">Métrico (mm / DIN / ISO)</option>
                  <option value="polegada">Polegada (Pol / ASTM / ASME)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Família do Fixador</label>
                <select
                  value={family}
                  onChange={(e) => setFamily(e.target.value as StandardFamily)}
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
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-amber-300 font-medium focus:outline-none focus:border-cyan-500"
                >
                  <option value="hex_bolt">Sextavado Padrão (DIN 933/931)</option>
                  <option value="heavy_hex_bolt">Sextavado Pesado (ASTM A325/A490)</option>
                  <option value="socket_head_allen">Allen Cilíndrico (DIN 912)</option>
                  <option value="countersunk_allen">Escareado 90° Allen (DIN 7991)</option>
                  <option value="stud_bolt">Prisioneiro / Barra Roscada (ASTM A193/DIN 975)</option>
                  <option value="hex_nut">Porca Sextavada (DIN 934/ASTM A563/DIN 985)</option>
                  <option value="washer_plain">Arruela Lisa (DIN 125/ASTM F436)</option>
                  <option value="washer_spring">Arruela de Pressão (DIN 127)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">Descrição Técnica / Aplicação</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Parafuso estrutural de alta resistência sextavado pesado conforme ASTM A325"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Section 2: Interactive Dimensional Matrix Table */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-mono uppercase font-bold text-slate-200">
                  Matriz Dimensional Padronizada ({dimensions.length} Bitolas)
                </h3>
              </div>
              <button
                type="button"
                onClick={handleAddRow}
                className="flex items-center gap-1 px-2.5 py-1 bg-cyan-950 border border-cyan-800 hover:bg-cyan-900 text-cyan-300 rounded text-xs font-bold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Bitola</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-800 rounded-lg">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900/90 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-2">Bitola</th>
                    <th className="p-2">Ø Nominal (d)</th>
                    <th className="p-2">Passo / TPI</th>
                    <th className="p-2">Chave (s)</th>
                    <th className="p-2">Alt. Cabeça (k/m)</th>
                    <th className="p-2">Ø Cabeça (dk/d2)</th>
                    <th className="p-2 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {dimensions.map((dim, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/40">
                      <td className="p-1.5">
                        <input
                          type="text"
                          value={dim.bitola}
                          onChange={(e) => handleUpdateRow(idx, 'bitola', e.target.value)}
                          className="w-20 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-xs font-bold text-amber-300"
                        />
                      </td>
                      <td className="p-1.5">
                        <input
                          type="number"
                          step="0.01"
                          value={dim.diametro_nominal}
                          onChange={(e) => handleUpdateRow(idx, 'diametro_nominal', Number(e.target.value))}
                          className="w-20 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-slate-200"
                        />
                      </td>
                      <td className="p-1.5">
                        <input
                          type="number"
                          step="0.01"
                          value={dim.passo}
                          onChange={(e) => handleUpdateRow(idx, 'passo', Number(e.target.value))}
                          className="w-20 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-slate-200"
                        />
                      </td>
                      <td className="p-1.5">
                        <input
                          type="number"
                          step="0.01"
                          value={dim.chave || ''}
                          onChange={(e) => handleUpdateRow(idx, 'chave', Number(e.target.value))}
                          placeholder="s"
                          className="w-20 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-slate-200"
                        />
                      </td>
                      <td className="p-1.5">
                        <input
                          type="number"
                          step="0.01"
                          value={dim.altura_cabeca || ''}
                          onChange={(e) => handleUpdateRow(idx, 'altura_cabeca', Number(e.target.value))}
                          placeholder="k"
                          className="w-20 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-slate-200"
                        />
                      </td>
                      <td className="p-1.5">
                        <input
                          type="number"
                          step="0.01"
                          value={dim.diametro_cabeca || ''}
                          onChange={(e) => handleUpdateRow(idx, 'diametro_cabeca', Number(e.target.value))}
                          placeholder="dk"
                          className="w-20 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-slate-200"
                        />
                      </td>
                      <td className="p-1.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(idx)}
                          className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded"
                          title="Remover Bitola"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/90">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
          >
            Cancelar
          </button>

          <button
            type="button"
            disabled={isSaving || dimensions.length === 0}
            onClick={handleSaveStandard}
            className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Gravando no Supabase...' : 'Salvar Norma no DeltaFix'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
