// src/components/admin/UserApprovalsManagement.tsx - Gestão Completa de Usuários (Todos os Perfis, Edição, Cancelamento e Exclusão)
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { UserApprovalRequest } from '@/lib/types/commercial';
import {
  getSavedApprovals,
  decideApprovalRequest,
  updateApprovalUser,
  deleteApprovalRequest
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
  FileCheck,
  LayoutGrid,
  Table as TableIcon,
  Search,
  Edit3,
  Trash2,
  Ban,
  UserPlus,
  RefreshCw,
  X,
  Filter,
  ShieldAlert,
  Save,
  Check
} from 'lucide-react';

interface UserApprovalsManagementProps {
  currentUserName: string;
}

export function UserApprovalsManagement({ currentUserName }: UserApprovalsManagementProps) {
  const [approvals, setApprovals] = useState<UserApprovalRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'aprovado' | 'pendente' | 'cancelado' | 'rejeitado'>('todos');
  const [roleFilter, setRoleFilter] = useState<string>('todos');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Modal de Aprovação Rápida
  const [quickApproveReq, setQuickApproveReq] = useState<UserApprovalRequest | null>(null);
  const [quickAssignedRole, setQuickAssignedRole] = useState<UserApprovalRequest['perfil_atribuido']>('engenharia');

  // Modal de Edição Completa do Usuário
  const [editingUser, setEditingUser] = useState<UserApprovalRequest | null>(null);
  const [editNome, setEditNome] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editEmpresa, setEditEmpresa] = useState('');
  const [editCnpj, setEditCnpj] = useState('');
  const [editPerfilAtribuido, setEditPerfilAtribuido] = useState<UserApprovalRequest['perfil_atribuido']>('engenharia');
  const [editStatus, setEditStatus] = useState<UserApprovalRequest['status']>('aprovado');
  const [editObservacoes, setEditObservacoes] = useState('');

  // Modal de Criação Direta de Usuário
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newNome, setNewNome] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newEmpresa, setNewEmpresa] = useState('');
  const [newCnpj, setNewCnpj] = useState('');
  const [newPerfilAtribuido, setNewPerfilAtribuido] = useState<UserApprovalRequest['perfil_atribuido']>('engenharia');
  const [newStatus, setNewStatus] = useState<UserApprovalRequest['status']>('aprovado');
  const [newObservacoes, setNewObservacoes] = useState('');

  // Mensagem de Feedback
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'danger' | 'info' } | null>(null);

  useEffect(() => {
    setApprovals(getSavedApprovals());
  }, []);

  const showFeedback = (text: string, type: 'success' | 'danger' | 'info' = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  // Contadores
  const countTotal = approvals.length;
  const countAprovados = approvals.filter((a) => a.status === 'aprovado').length;
  const countPendentes = approvals.filter((a) => a.status === 'pendente').length;
  const countCancelados = approvals.filter((a) => a.status === 'cancelado').length;
  const countRejeitados = approvals.filter((a) => a.status === 'rejeitado').length;

  // Filtragem
  const filteredUsers = useMemo(() => {
    return approvals.filter((u) => {
      const matchesSearch =
        u.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.empresa_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.empresa_cnpj.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.perfil_atribuido && u.perfil_atribuido.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (u.observacoes && u.observacoes.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === 'todos' || u.status === statusFilter;

      const matchesRole =
        roleFilter === 'todos' ||
        u.perfil_atribuido === roleFilter ||
        (roleFilter === 'sem_perfil' && !u.perfil_atribuido);

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [approvals, searchTerm, statusFilter, roleFilter]);

  // Abertura do modal de aprovação rápida
  const handleOpenQuickApprove = (req: UserApprovalRequest) => {
    setQuickApproveReq(req);
    if (req.perfil_solicitado === 'cliente_comprador') {
      setQuickAssignedRole('cliente');
    } else if (req.perfil_solicitado === 'fornecedor_parceiro') {
      setQuickAssignedRole('comercial');
    } else {
      setQuickAssignedRole('engenharia');
    }
  };

  // Confirmar aprovação rápida
  const confirmQuickApprove = () => {
    if (!quickApproveReq) return;
    const updated = decideApprovalRequest(quickApproveReq.id, 'aprovado', currentUserName, quickAssignedRole);
    setApprovals(updated);
    showFeedback(`Usuário "${quickApproveReq.nome}" aprovado com sucesso!`, 'success');
    setQuickApproveReq(null);
  };

  // Cancelar / Bloquear usuário
  const handleCancelUser = (user: UserApprovalRequest) => {
    const isAlreadyCanceled = user.status === 'cancelado';
    const action = isAlreadyCanceled ? 'reativar' : 'cancelar / suspender';
    if (window.confirm(`Deseja realmente ${action} o acesso do usuário "${user.nome}" (${user.email})?`)) {
      const newStatus = isAlreadyCanceled ? 'aprovado' : 'cancelado';
      const updated = decideApprovalRequest(user.id, newStatus, currentUserName);
      setApprovals(updated);
      showFeedback(
        isAlreadyCanceled
          ? `Usuário "${user.nome}" reativado com sucesso!`
          : `Acesso do usuário "${user.nome}" foi cancelado/suspenso.`,
        isAlreadyCanceled ? 'success' : 'danger'
      );
    }
  };

  // Rejeitar solicitação
  const handleReject = (id: string, nome: string) => {
    if (window.confirm(`Deseja realmente recusar a solicitação de "${nome}"?`)) {
      const updated = decideApprovalRequest(id, 'rejeitado', currentUserName);
      setApprovals(updated);
      showFeedback(`Solicitação de "${nome}" recusada.`, 'danger');
    }
  };

  // Excluir usuário definitivamente
  const handleDeleteUser = (user: UserApprovalRequest) => {
    if (
      window.confirm(
        `ATENÇÃO: Deseja EXCLUIR DEFINITIVAMENTE o registro do usuário "${user.nome}" (${user.email}) do sistema? Esta ação não pode ser desfeita.`
      )
    ) {
      const updated = deleteApprovalRequest(user.id);
      setApprovals(updated);
      showFeedback(`Usuário "${user.nome}" excluído definitivamente do sistema.`, 'danger');
    }
  };

  // Abrir Modal de Edição
  const handleOpenEdit = (user: UserApprovalRequest) => {
    setEditingUser(user);
    setEditNome(user.nome);
    setEditEmail(user.email);
    setEditEmpresa(user.empresa_nome);
    setEditCnpj(user.empresa_cnpj);
    setEditPerfilAtribuido(user.perfil_atribuido || 'engenharia');
    setEditStatus(user.status);
    setEditObservacoes(user.observacoes || '');
  };

  // Salvar Edição
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const updated = updateApprovalUser(editingUser.id, {
      nome: editNome.trim(),
      email: editEmail.trim(),
      empresa_nome: editEmpresa.trim(),
      empresa_cnpj: editCnpj.trim(),
      perfil_atribuido: editPerfilAtribuido,
      status: editStatus,
      observacoes: editObservacoes.trim(),
      decidido_por: currentUserName,
      data_decisao: new Date().toISOString()
    });

    setApprovals(updated);
    showFeedback(`Dados do usuário "${editNome}" atualizados com sucesso!`, 'success');
    setEditingUser(null);
  };

  // Salvar Novo Usuário
  const handleCreateNewUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNome.trim() || !newEmail.trim()) return;

    const list = getSavedApprovals();
    const newUserItem: UserApprovalRequest = {
      id: `usr-${Date.now()}`,
      nome: newNome.trim(),
      email: newEmail.trim(),
      empresa_nome: newEmpresa.trim() || 'Delta Parafusos / Interno',
      empresa_cnpj: newCnpj.trim() || '18.452.912/0001-36',
      perfil_solicitado: 'engenharia_especificador',
      perfil_atribuido: newPerfilAtribuido,
      status: newStatus,
      data_solicitacao: new Date().toISOString(),
      data_decisao: new Date().toISOString(),
      decidido_por: currentUserName,
      observacoes: newObservacoes.trim() || 'Usuário cadastrado diretamente pelo Administrador Master.'
    };

    const updated = [newUserItem, ...list];
    if (typeof window !== 'undefined') {
      localStorage.setItem('deltafix_user_approvals', JSON.stringify(updated));
    }
    setApprovals(updated);
    showFeedback(`Novo usuário "${newNome}" cadastrado com sucesso!`, 'success');
    setIsCreateModalOpen(false);
    setNewNome('');
    setNewEmail('');
    setNewEmpresa('');
    setNewCnpj('');
    setNewObservacoes('');
  };

  // Helper de cores de status
  const getStatusBadge = (status: UserApprovalRequest['status']) => {
    switch (status) {
      case 'aprovado':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-950/90 text-emerald-300 border border-emerald-800 flex items-center gap-1.5 shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>ATIVO / APROVADO</span>
          </span>
        );
      case 'pendente':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-950/90 text-amber-300 border border-amber-800 flex items-center gap-1.5 shadow-sm animate-pulse">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>PENDENTE DE APROVAÇÃO</span>
          </span>
        );
      case 'cancelado':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-rose-950/90 text-rose-300 border border-rose-800 flex items-center gap-1.5 shadow-sm">
            <Ban className="w-3.5 h-3.5 text-rose-400" />
            <span>ACESSO CANCELADO / SUSPENSO</span>
          </span>
        );
      case 'rejeitado':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-slate-900 text-slate-400 border border-slate-700 flex items-center gap-1.5 shadow-sm">
            <XCircle className="w-3.5 h-3.5 text-slate-500" />
            <span>REJEITADO</span>
          </span>
        );
      default:
        return null;
    }
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'master':
        return 'Super Admin / Master';
      case 'engenharia':
        return 'Engenharia / Produto';
      case 'comercial':
        return 'Comercial / Vendas';
      case 'pcp_operador':
        return 'PCP & Fábrica (Corte)';
      case 'cliente':
        return 'Cliente / Comprador';
      default:
        return role || 'Sem Perfil';
    }
  };

  return (
    <div className="space-y-6">
      {/* Mensagem de Feedback */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-xl text-xs font-mono font-bold flex items-center justify-between border shadow-lg ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-700 text-emerald-200'
              : feedbackMsg.type === 'danger'
              ? 'bg-rose-950/90 border-rose-700 text-rose-200'
              : 'bg-cyan-950/90 border-cyan-700 text-cyan-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackMsg(null)}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <UserCheck className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-black text-white tracking-wide">
              GESTÃO & APROVAÇÃO GERAL DE USUÁRIOS
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Painel administrativo central: visualize <strong className="text-white">todos os usuários</strong> do sistema
            (aprovados, pendentes e cancelados), edite permissões, cancele/suspenda acessos ou exclua registros com total controle.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-950/80 active:scale-95 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-slate-950 stroke-[3]" />
            <span>+ Novo Usuário</span>
          </button>
        </div>
      </div>

      {/* Barra de Filtros Rápidos de Status e Busca */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900/70 border border-slate-800/80 p-3 rounded-2xl shadow-md">
        {/* Chips de Status (Sempre à vista todos os tipos de usuários) */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setStatusFilter('todos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'todos'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 shadow-md'
                : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <span>Todos os Usuários</span>
            <span className="px-1.5 py-0.2 rounded-full bg-cyan-900/60 text-[10px] font-mono">
              {countTotal}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('aprovado')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'aprovado'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700 shadow-md'
                : 'bg-slate-950/60 text-slate-400 hover:text-emerald-300 border border-slate-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Aprovados / Ativos</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-900/60 text-[10px] font-mono">
              {countAprovados}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('pendente')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'pendente'
                ? 'bg-amber-950 text-amber-300 border border-amber-700 shadow-md'
                : 'bg-slate-950/60 text-slate-400 hover:text-amber-300 border border-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Pendentes</span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-900/60 text-[10px] font-mono">
              {countPendentes}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('cancelado')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'cancelado'
                ? 'bg-rose-950 text-rose-300 border border-rose-700 shadow-md'
                : 'bg-slate-950/60 text-slate-400 hover:text-rose-300 border border-slate-800'
            }`}
          >
            <Ban className="w-3.5 h-3.5 text-rose-400" />
            <span>Cancelados / Suspensos</span>
            <span className="px-1.5 py-0.2 rounded-full bg-rose-900/60 text-[10px] font-mono">
              {countCancelados}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('rejeitado')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'rejeitado'
                ? 'bg-slate-800 text-slate-200 border border-slate-700 shadow-md'
                : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <XCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>Rejeitados</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] font-mono">
              {countRejeitados}
            </span>
          </button>
        </div>

        {/* Alternador de Visualização Cards / Tabela */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0 self-end md:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('cards')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'cards'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Cards</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'table'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Tabela</span>
          </button>
        </div>
      </div>

      {/* Linha de Busca e Filtro de Perfil */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por Nome, Email, Empresa, CNPJ ou Perfil..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-[11px] font-mono text-slate-400 whitespace-nowrap">Filtrar Perfil:</label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono w-full sm:w-auto"
          >
            <option value="todos">Todos os Perfis</option>
            <option value="master">Master / Super Admin</option>
            <option value="engenharia">Engenharia / Produto</option>
            <option value="comercial">Comercial / Vendas</option>
            <option value="pcp_operador">PCP & Chão de Fábrica</option>
            <option value="cliente">Cliente / Comprador</option>
            <option value="sem_perfil">Sem Perfil Definido</option>
          </select>
        </div>
      </div>

      {/* =========================================================================
          LISTAGEM DE USUÁRIOS: CARDS OU TABELA (TODOS OS TIPOS SEMPRE À VISTA)
          ========================================================================= */}
      {filteredUsers.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/50 border border-slate-800 rounded-2xl">
          <UserCheck className="w-12 h-12 text-slate-600 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-300">Nenhum usuário encontrado</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Não há registros correspondentes aos filtros selecionados. Tente alterar os filtros de busca ou cadastre um novo usuário.
          </p>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className={`p-5 rounded-2xl bg-slate-900/80 border transition-all flex flex-col justify-between shadow-lg relative overflow-hidden group ${
                user.status === 'cancelado'
                  ? 'border-rose-900/50 bg-rose-950/10'
                  : user.status === 'pendente'
                  ? 'border-amber-800/60 bg-amber-950/10'
                  : user.status === 'aprovado'
                  ? 'border-slate-800 hover:border-slate-700'
                  : 'border-slate-800/80 opacity-75'
              }`}
            >
              {/* Faixa superior de status */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 ${
                  user.status === 'aprovado'
                    ? 'bg-emerald-500'
                    : user.status === 'pendente'
                    ? 'bg-amber-500'
                    : user.status === 'cancelado'
                    ? 'bg-rose-500'
                    : 'bg-slate-600'
                }`}
              />

              <div className="space-y-3">
                {/* Cabeçalho do Card */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-black text-white group-hover:text-cyan-300 transition-colors">
                      {user.nome}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono mt-0.5">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      <span>{user.email}</span>
                    </div>
                  </div>
                  <div>{getStatusBadge(user.status)}</div>
                </div>

                {/* Dados da Empresa & Perfil */}
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-cyan-400" />
                      <strong className="text-slate-200">{user.empresa_nome}</strong>
                    </span>
                    <span className="font-mono text-[11px] text-slate-500">
                      CNPJ: {user.empresa_cnpj}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                    <span className="text-[11px] font-mono text-slate-400">Perfil Atribuído:</span>
                    <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono text-[11px] font-bold">
                      {getRoleLabel(user.perfil_atribuido)}
                    </span>
                  </div>
                </div>

                {/* Observações / Auditoria */}
                {user.observacoes && (
                  <p className="text-[11px] text-slate-400 italic bg-slate-950/40 p-2 rounded-lg border border-slate-800/40 line-clamp-2">
                    &quot;{user.observacoes}&quot;
                  </p>
                )}

                <div className="text-[10px] font-mono text-slate-500 flex items-center justify-between">
                  <span>
                    Solicitado em: {new Date(user.data_solicitacao).toLocaleDateString('pt-BR')}
                  </span>
                  {user.decidido_por && (
                    <span>Decidido por: {user.decidido_por}</span>
                  )}
                </div>
              </div>

              {/* Barra de Ações: Editar, Cancelar/Suspender, Excluir, Aprovar */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {/* Botão de Editar */}
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(user)}
                    className="px-2.5 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                    title="Editar dados, permissões e status deste usuário"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Editar</span>
                  </button>

                  {/* Botão Cancelar / Suspender ou Reativar */}
                  <button
                    type="button"
                    onClick={() => handleCancelUser(user)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm border ${
                      user.status === 'cancelado'
                        ? 'bg-emerald-950/80 hover:bg-emerald-900 border-emerald-800 text-emerald-300'
                        : 'bg-rose-950/80 hover:bg-rose-900 border-rose-800 text-rose-300'
                    }`}
                    title={
                      user.status === 'cancelado'
                        ? 'Reativar acesso do usuário'
                        : 'Cancelar ou suspender o acesso deste usuário'
                    }
                  >
                    {user.status === 'cancelado' ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Reativar</span>
                      </>
                    ) : (
                      <>
                        <Ban className="w-3.5 h-3.5 text-rose-400" />
                        <span>Cancelar Acesso</span>
                      </>
                    )}
                  </button>

                  {/* Se for pendente, oferece botão de aprovar */}
                  {user.status === 'pendente' && (
                    <button
                      type="button"
                      onClick={() => handleOpenQuickApprove(user)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-black uppercase flex items-center gap-1 shadow-md transition-all cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Aprovar</span>
                    </button>
                  )}
                </div>

                {/* Botão Excluir */}
                <button
                  type="button"
                  onClick={() => handleDeleteUser(user)}
                  className="p-1.5 rounded-lg bg-slate-950 hover:bg-rose-950 border border-slate-800 hover:border-rose-800 text-slate-400 hover:text-rose-300 transition-all cursor-pointer"
                  title="Excluir este usuário definitivamente do sistema"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* VISUALIZAÇÃO EM TABELA COMPLETA */
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-[10px] font-mono uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Nome / Email</th>
                  <th className="p-3.5">Empresa / CNPJ</th>
                  <th className="p-3.5">Perfil de Acesso</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Data Registro</th>
                  <th className="p-3.5 text-right">Ações (Editar / Cancelar / Excluir)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-white font-sans">{user.nome}</div>
                      <div className="text-[11px] text-slate-400">{user.email}</div>
                    </td>

                    <td className="p-3.5">
                      <div className="font-semibold text-cyan-300 font-sans">{user.empresa_nome}</div>
                      <div className="text-[10px] text-slate-500">{user.empresa_cnpj}</div>
                    </td>

                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                        {getRoleLabel(user.perfil_atribuido)}
                      </span>
                    </td>

                    <td className="p-3.5">{getStatusBadge(user.status)}</td>

                    <td className="p-3.5 text-slate-400 text-[11px]">
                      {new Date(user.data_solicitacao).toLocaleDateString('pt-BR')}
                    </td>

                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {user.status === 'pendente' && (
                          <button
                            type="button"
                            onClick={() => handleOpenQuickApprove(user)}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-[11px] font-bold uppercase transition-all cursor-pointer"
                            title="Aprovar Acesso"
                          >
                            Aprovar
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleOpenEdit(user)}
                          className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-300 hover:bg-cyan-900 transition-all cursor-pointer"
                          title="Editar Usuário"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCancelUser(user)}
                          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                            user.status === 'cancelado'
                              ? 'bg-emerald-950 border-emerald-800 text-emerald-300 hover:bg-emerald-900'
                              : 'bg-rose-950 border-rose-800 text-rose-300 hover:bg-rose-900'
                          }`}
                          title={user.status === 'cancelado' ? 'Reativar Usuário' : 'Cancelar / Suspender Acesso'}
                        >
                          {user.status === 'cancelado' ? (
                            <RefreshCw className="w-3.5 h-3.5" />
                          ) : (
                            <Ban className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteUser(user)}
                          className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-950 transition-all cursor-pointer"
                          title="Excluir Registro Definitivamente"
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

      {/* =========================================================================
          MODAL: EDITAR USUÁRIO (NOME, EMAIL, EMPRESA, PERFIL E STATUS)
          ========================================================================= */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col">
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Edit3 className="w-3.5 h-3.5" />
                  Edição Cadastral & Permissões
                </span>
                <h3 className="text-base font-black text-white">EDITAR DADOS DO USUÁRIO</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 font-bold uppercase mb-1">
                    Nome Completo:
                  </label>
                  <input
                    type="text"
                    required
                    value={editNome}
                    onChange={(e) => setEditNome(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-300 font-bold uppercase mb-1">
                    Email de Acesso:
                  </label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 font-bold uppercase mb-1">
                    Empresa / Organização:
                  </label>
                  <input
                    type="text"
                    required
                    value={editEmpresa}
                    onChange={(e) => setEditEmpresa(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-300 font-bold uppercase mb-1">
                    CNPJ da Empresa:
                  </label>
                  <input
                    type="text"
                    value={editCnpj}
                    onChange={(e) => setEditCnpj(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 font-bold uppercase mb-1">
                    Perfil de Permissão:
                  </label>
                  <select
                    value={editPerfilAtribuido}
                    onChange={(e) => setEditPerfilAtribuido(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-cyan-500"
                  >
                    <option value="engenharia">Engenharia / Produto (CAD, Normas e BOM)</option>
                    <option value="comercial">Comercial / Vendas (CRM e Pedidos)</option>
                    <option value="pcp_operador">PCP & Chão de Fábrica (Corte)</option>
                    <option value="cliente">Cliente / Comprador (Portal Externo)</option>
                    <option value="master">Master / Super Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-300 font-bold uppercase mb-1">
                    Status da Conta:
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-cyan-500"
                  >
                    <option value="aprovado">✓ Ativo / Aprovado</option>
                    <option value="pendente">⏳ Pendente de Análise</option>
                    <option value="cancelado">🚫 Cancelado / Suspenso</option>
                    <option value="rejeitado">✕ Rejeitado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-300 font-bold uppercase mb-1">
                  Observações Administrativas / Justificativa:
                </label>
                <textarea
                  rows={2}
                  value={editObservacoes}
                  onChange={(e) => setEditObservacoes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white placeholder-slate-600 focus:border-cyan-500"
                  placeholder="Ex: Acesso autorizado para compras industriais da planta de Carajás..."
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-cyan-950/80 active:scale-95 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4 text-slate-950" />
                  <span>Salvar Alterações</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: NOVO USUÁRIO (CADASTRO DIRETO)
          ========================================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col">
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <UserPlus className="w-3.5 h-3.5" />
                  Administração Master
                </span>
                <h3 className="text-base font-black text-white">CADASTRAR NOVO USUÁRIO</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewUser} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 font-bold uppercase mb-1">
                    Nome Completo:
                  </label>
                  <input
                    type="text"
                    required
                    value={newNome}
                    onChange={(e) => setNewNome(e.target.value)}
                    placeholder="Ex: Carlos Eduardo de Oliveira"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-300 font-bold uppercase mb-1">
                    Email Corporativo:
                  </label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="carlos.eduardo@empresa.com.br"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 font-bold uppercase mb-1">
                    Empresa / Organização:
                  </label>
                  <input
                    type="text"
                    required
                    value={newEmpresa}
                    onChange={(e) => setNewEmpresa(e.target.value)}
                    placeholder="Ex: Vale S.A. ou Delta Fixadores"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-300 font-bold uppercase mb-1">
                    CNPJ:
                  </label>
                  <input
                    type="text"
                    value={newCnpj}
                    onChange={(e) => setNewCnpj(e.target.value)}
                    placeholder="33.592.510/0001-54"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 font-bold uppercase mb-1">
                    Perfil de Acesso:
                  </label>
                  <select
                    value={newPerfilAtribuido}
                    onChange={(e) => setNewPerfilAtribuido(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-cyan-500"
                  >
                    <option value="engenharia">Engenharia / Produto (CAD, Normas e BOM)</option>
                    <option value="comercial">Comercial / Vendas (CRM e Pedidos)</option>
                    <option value="pcp_operador">PCP & Chão de Fábrica (Corte)</option>
                    <option value="cliente">Cliente / Comprador (Portal Externo)</option>
                    <option value="master">Master / Super Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-300 font-bold uppercase mb-1">
                    Status Inicial:
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-cyan-500"
                  >
                    <option value="aprovado">✓ Ativo / Aprovado Imediatamente</option>
                    <option value="pendente">⏳ Pendente de Análise</option>
                    <option value="cancelado">🚫 Cancelado / Suspenso</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-300 font-bold uppercase mb-1">
                  Observações:
                </label>
                <textarea
                  rows={2}
                  value={newObservacoes}
                  onChange={(e) => setNewObservacoes(e.target.value)}
                  placeholder="Informações adicionais do colaborador ou parceiro..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white placeholder-slate-600 focus:border-cyan-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-emerald-950/80 active:scale-95 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4 text-slate-950 stroke-[3]" />
                  <span>Cadastrar Usuário</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: APROVAÇÃO RÁPIDA COM ATRIBUIÇÃO DE PERFIL
          ========================================================================= */}
      {quickApproveReq && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Aprovar Acesso & Definir Perfil
            </h3>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
              <div className="text-white font-bold">{quickApproveReq.nome}</div>
              <div className="text-slate-400 font-mono">{quickApproveReq.email}</div>
              <div className="text-cyan-400">{quickApproveReq.empresa_nome}</div>
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-300 font-bold uppercase block mb-1">
                Atribuir Perfil de Acesso no DeltaFix:
              </label>
              <select
                value={quickAssignedRole}
                onChange={(e) => setQuickAssignedRole(e.target.value as any)}
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
                onClick={() => setQuickApproveReq(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmQuickApprove}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold uppercase tracking-wider cursor-pointer"
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
