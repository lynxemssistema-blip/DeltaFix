// src/components/admin/UserApprovalsManagement.tsx - Gestão e Aprovação de Novos Cadastros (Master / Super Admin)
'use client';

import React, { useState, useEffect } from 'react';
import { UserApprovalRequest } from '@/lib/types/commercial';
import {
  getSavedApprovals,
  decideApprovalRequest
} from '@/lib/services/commercialService';
import {
  UserCheck,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Building,
  Mail,
  User,
  AlertCircle,
  FileCheck
} from 'lucide-react';

interface UserApprovalsManagementProps {
  currentUserName: string;
}

export function UserApprovalsManagement({ currentUserName }: UserApprovalsManagementProps) {
  const [approvals, setApprovals] = useState<UserApprovalRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'pendente' | 'decididos'>('pendente');
  const [selectedReq, setSelectedReq] = useState<UserApprovalRequest | null>(null);
  const [assignedRole, setAssignedRole] = useState<UserApprovalRequest['perfil_atribuido']>('engenharia');

  useEffect(() => {
    setApprovals(getSavedApprovals());
  }, []);

  const handleApprove = (req: UserApprovalRequest) => {
    setSelectedReq(req);
    // Sugerir papel baseado na solicitação
    if (req.perfil_solicitado === 'cliente_comprador') {
      setAssignedRole('cliente');
    } else if (req.perfil_solicitado === 'fornecedor_parceiro') {
      setAssignedRole('comercial');
    } else {
      setAssignedRole('engenharia');
    }
  };

  const confirmApprove = () => {
    if (!selectedReq) return;
    const updated = decideApprovalRequest(selectedReq.id, 'aprovado', currentUserName, assignedRole);
    setApprovals(updated);
    setSelectedReq(null);
  };

  const handleReject = (id: string) => {
    if (confirm('Deseja realmente recusar o acesso deste usuário?')) {
      const updated = decideApprovalRequest(id, 'rejeitado', currentUserName);
      setApprovals(updated);
    }
  };

  const pendingList = approvals.filter((a) => a.status === 'pendente');
  const decidedList = approvals.filter((a) => a.status !== 'pendente');

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <UserCheck className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-black text-white tracking-wide">
              Aprovação de Novos Usuários (Perfil Master / Super Admin)
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Analise e autorize solicitações de acesso originadas no formulário de cadastro da Landing Page.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('pendente')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'pendente'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pendentes ({pendingList.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('decididos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'decididos'
                ? 'bg-slate-800 text-slate-200'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Histórico ({decidedList.length})
          </button>
        </div>
      </div>

      {/* Lista de Solicitações */}
      {activeTab === 'pendente' ? (
        <div className="space-y-3">
          {pendingList.map((req) => (
            <div
              key={req.id}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-base font-extrabold text-white">{req.nome}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> AGUARDANDO APROVAÇÃO
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-500" /> {req.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-cyan-400" /> {req.empresa_nome}
                  </span>
                  <span className="text-slate-500 font-mono">CNPJ: {req.empresa_cnpj}</span>
                </div>

                <div className="text-xs text-slate-400 mt-1">
                  <span className="font-semibold text-slate-300">Perfil Solicitado:</span>{' '}
                  <span className="text-cyan-400 uppercase font-mono font-bold">
                    {req.perfil_solicitado.replace('_', ' ')}
                  </span>{' '}
                  • {req.observacoes}
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleReject(req.id)}
                  className="px-3 py-2 rounded-xl bg-red-950/60 hover:bg-red-900/80 border border-red-800 text-red-300 text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Recusar</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleApprove(req)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-emerald-950/60 active:scale-95 transition-all"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Aprovar Acesso</span>
                </button>
              </div>
            </div>
          ))}

          {pendingList.length === 0 && (
            <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-300">Todas as solicitações foram avaliadas</h3>
              <p className="text-xs text-slate-500 mt-1">
                Não há nenhum novo usuário aguardando liberação no momento.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Histórico de Decisões */
        <div className="space-y-3">
          {decidedList.map((req) => (
            <div
              key={req.id}
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-200">{req.nome}</span>
                  <span className="text-slate-400 font-mono">({req.email})</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      req.status === 'aprovado'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-red-950 text-red-300 border border-red-800'
                    }`}
                  >
                    {req.status}
                  </span>
                </div>
                <div className="text-slate-400 mt-1">
                  Empresa: {req.empresa_nome} • Perfil Atribuído:{' '}
                  <span className="text-cyan-400 font-bold uppercase">{req.perfil_atribuido || 'N/A'}</span>
                </div>
              </div>

              <div className="text-right text-[11px] text-slate-500 font-mono">
                Decidido por: {req.decidido_por || 'Master'}
                <br />
                {req.data_decisao ? new Date(req.data_decisao).toLocaleDateString('pt-BR') : ''}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Confirmação de Aprovação com Atribuição de Perfil */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Aprovar Acesso & Definir Perfil
            </h3>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
              <div className="text-white font-bold">{selectedReq.nome}</div>
              <div className="text-slate-400 font-mono">{selectedReq.email}</div>
              <div className="text-cyan-400">{selectedReq.empresa_nome}</div>
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-300 font-bold uppercase block mb-1">
                Atribuir Perfil de Acesso no DeltaFix:
              </label>
              <select
                value={assignedRole}
                onChange={(e) => setAssignedRole(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white font-bold"
              >
                <option value="cliente">Cliente / Comprador (Acesso a cotações e pedidos)</option>
                <option value="engenharia">Engenheiro / Especificador (CAD, Normas e BOM)</option>
                <option value="comercial">Comercial / Vendas (CRM e gestão de parceiros)</option>
                <option value="pcp_operador">PCP & Chão de Fábrica (Roteiros e Serra 6m)</option>
                <option value="master">Administrador Master da Empresa</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedReq(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmApprove}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold uppercase tracking-wider"
              >
                Confirmar Liberação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
