// src/components/layout/AppLayout.tsx - Layout ERP/CRM com Menu Lateral Retrátil e Topbar Contextual
'use client';

import React, { useState, useEffect } from 'react';
import { DeltaLogo } from '@/components/ui/DeltaLogo';
import { useAuth } from '@/components/auth/AuthContext';
import { ProductItem } from '@/lib/standards/types';
import {
  getSavedOrganizations,
  getSavedApprovals
} from '@/lib/services/commercialService';
import { OverviewDashboard } from '@/components/dashboard/OverviewDashboard';
import { CompaniesManagement } from '@/components/commercial/CompaniesManagement';
import { OrdersQuotesManagement } from '@/components/commercial/OrdersQuotesManagement';
import { EngineeringConfigurator } from '@/components/forms/EngineeringConfigurator';
import { PcpManagement } from '@/components/pcp/PcpManagement';
import { MultiCompanyManagement } from '@/components/admin/MultiCompanyManagement';
import { UserApprovalsManagement } from '@/components/admin/UserApprovalsManagement';
import {
  LayoutDashboard,
  Building2,
  FileText,
  Compass,
  BookOpen,
  Boxes,
  Layers,
  Cpu,
  Building,
  UserCheck,
  Search,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  ChevronDown,
  CheckCircle2,
  Sliders,
  Sparkles,
  Command,
  Flame,
  FileCode2,
  HardHat
} from 'lucide-react';

interface AppLayoutProps {
  initialProducts: ProductItem[];
}

export type ActiveModule =
  | 'visao_geral'
  | 'empresas'
  | 'pedidos'
  | 'produtos'
  | 'normas'
  | 'desenho'
  | 'pcp_estrutura'
  | 'pcp_roteiros'
  | 'pcp_recursos'
  | 'multi_empresa'
  | 'aprovacoes';

export function AppLayout({ initialProducts }: AppLayoutProps) {
  const { user, profile, signOut } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeModule, setActiveModule] = useState<ActiveModule>('visao_geral');

  // Multi-empresa state
  const [organizations, setOrganizations] = useState(getSavedOrganizations());
  const [currentOrgId, setCurrentOrgId] = useState(organizations[0]?.id || 'org-01');
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);

  // Notificações
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);

  // Busca Global [Ctrl+K]
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');

  // Identificação de papéis
  const isSuperAdmin =
    profile?.role === 'super_admin' || user?.email === 'edsonmanoel2012@gmail.com';
  const isMaster = isSuperAdmin || profile?.role === 'engineering_manager';

  const currentOrg = organizations.find((o) => o.id === currentOrgId) || organizations[0];

  useEffect(() => {
    const approvals = getSavedApprovals().filter((a) => a.status === 'pendente');
    setPendingApprovalsCount(approvals.length);

    // Listener para o atalho Ctrl+K
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectModule = (mod: ActiveModule) => {
    setActiveModule(mod);
    setIsSearchModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* =========================================================================
          TOPBAR CONTEXTUAL
          ========================================================================= */}
      <header className="h-14 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md sticky top-0 z-40 px-4 flex items-center justify-between gap-4">
        {/* Left: Brand & Sidebar Toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-all"
            title={sidebarCollapsed ? 'Expandir Menu' : 'Recolher Menu'}
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          <div
            onClick={() => setActiveModule('visao_geral')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <DeltaLogo size={32} />
            <div className="hidden sm:flex items-center gap-2">
              <span className="font-black text-base tracking-wider text-white">DELTA</span>
              <span className="font-black text-base tracking-wider text-cyan-400">FIX</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                ERP CORE
              </span>
            </div>
          </div>
        </div>

        {/* Center: Busca Global [Ctrl+K] */}
        <div className="flex-1 max-w-md hidden md:block">
          <button
            type="button"
            onClick={() => setIsSearchModalOpen(true)}
            className="w-full bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-400 flex items-center justify-between transition-all"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-500" />
              <span>Busca rápida em todo o ecossistema...</span>
            </div>
            <kbd className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded text-[10px] font-mono text-slate-400">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Right: Seletor Multi-Empresa, Notificações & Perfil do Usuário */}
        <div className="flex items-center gap-2.5">
          {/* Seletor Multi-Empresa */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-800/80 text-xs flex items-center gap-2 transition-all max-w-[220px]"
            >
              <Building className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <div className="truncate text-left">
                <span className="text-[9px] font-mono text-slate-500 uppercase block leading-none">
                  Empresa Ativa:
                </span>
                <span className="font-bold text-slate-200 text-[11px] truncate block leading-tight">
                  {currentOrg ? currentOrg.nome.split('(')[0].trim() : 'Delta Matriz'}
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-500 shrink-0" />
            </button>

            {isOrgDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-500 font-bold px-2 py-1 block">
                  Alternar Unidade Operacional:
                </span>
                {organizations.map((org) => (
                  <button
                    key={org.id}
                    type="button"
                    onClick={() => {
                      setCurrentOrgId(org.id);
                      setIsOrgDropdownOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded-xl text-xs transition-all flex items-center justify-between ${
                      org.id === currentOrgId
                        ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <div className="font-bold">{org.nome}</div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {org.cidade} - {org.uf} • {org.tipo.toUpperCase()}
                      </div>
                    </div>
                    {org.id === currentOrgId && <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notificações */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white relative transition-all"
            >
              <Bell className="w-4 h-4" />
              {pendingApprovalsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-slate-950 rounded-full text-[9px] font-mono font-black flex items-center justify-center animate-pulse">
                  {pendingApprovalsCount}
                </span>
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-3 z-50 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-white">Central de Notificações</span>
                  <span className="text-[10px] font-mono text-slate-500">DeltaFix</span>
                </div>
                {pendingApprovalsCount > 0 ? (
                  <div
                    onClick={() => {
                      setActiveModule('aprovacoes');
                      setIsNotificationsOpen(false);
                    }}
                    className="p-2.5 rounded-xl bg-amber-950/50 border border-amber-800/80 cursor-pointer hover:bg-amber-950/80 transition-all text-xs"
                  >
                    <div className="font-bold text-amber-300">
                      {pendingApprovalsCount} Solicitação(ões) de Cadastro
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Novos parceiros aguardam liberação de perfil Master.
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 py-3 text-center">
                    Nenhuma notificação pendente no momento.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Session Profile & Logout */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-xl">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-600 to-amber-500 flex items-center justify-center text-slate-950 font-black text-xs shrink-0">
              {profile?.full_name ? profile.full_name[0].toUpperCase() : 'E'}
            </div>
            <div className="hidden lg:flex flex-col text-left leading-tight">
              <span className="text-xs font-bold text-slate-100 truncate max-w-[130px]">
                {profile?.full_name || 'Edson Manoel'}
              </span>
              <span className="text-[10px] font-mono text-cyan-400">
                {isSuperAdmin ? 'SUPER ADMIN' : isMaster ? 'MASTER' : 'ENGENHARIA'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => signOut()}
              className="p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/40 transition-all ml-1"
              title="Sair do Sistema DeltaFix"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          BODY: SIDEBAR RETRÁTIL + ÁREA DE TRABALHO
          ========================================================================= */}
      <div className="flex-1 flex overflow-hidden">
        {/* MENU LATERAL ESQUERDO RETRÁTIL */}
        <aside
          className={`border-r border-slate-800 bg-slate-950/90 backdrop-blur shrink-0 transition-all duration-300 flex flex-col justify-between z-30 ${
            sidebarCollapsed ? 'w-16' : 'w-64'
          }`}
        >
          {/* Navigation Links */}
          <nav className="p-3 space-y-4 overflow-y-auto">
            {/* 1. VISÃO GERAL */}
            <div>
              <button
                type="button"
                onClick={() => setActiveModule('visao_geral')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeModule === 'visao_geral'
                    ? 'bg-cyan-600 text-slate-950 shadow-md shadow-cyan-950/80 font-black'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                {!sidebarCollapsed && <span>📊 Visão Geral</span>}
              </button>
            </div>

            {/* 2. COMERCIAL */}
            <div className="space-y-1">
              {!sidebarCollapsed && (
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold px-3">
                  🤝 COMERCIAL & CRM
                </span>
              )}
              <div className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => setActiveModule('empresas')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-all ${
                    activeModule === 'empresas'
                      ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                  title="Gestão de Parceiros Comerciais PJ"
                >
                  <Building2 className="w-4 h-4 shrink-0 text-cyan-400" />
                  {!sidebarCollapsed && <span>├ Empresas / PJ</span>}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveModule('pedidos')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-all ${
                    activeModule === 'pedidos'
                      ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                  title="CRM & Gestão de Pedidos e Cotações"
                >
                  <FileText className="w-4 h-4 shrink-0 text-emerald-400" />
                  {!sidebarCollapsed && <span>└ Pedidos / Cotações</span>}
                </button>
              </div>
            </div>

            {/* 3. ENGENHARIA */}
            <div className="space-y-1">
              {!sidebarCollapsed && (
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold px-3">
                  ⚙️ ENGENHARIA DE PRODUTO
                </span>
              )}
              <div className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => setActiveModule('produtos')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-all ${
                    activeModule === 'produtos'
                      ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                  title="Configurador de Produtos e Peças Especiais"
                >
                  <Compass className="w-4 h-4 shrink-0 text-sky-400" />
                  {!sidebarCollapsed && <span>├ Produtos & Especiais</span>}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveModule('normas')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-all ${
                    activeModule === 'normas'
                      ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                  title="Normas Técnicas DIN / ISO / ASTM"
                >
                  <BookOpen className="w-4 h-4 shrink-0 text-amber-400" />
                  {!sidebarCollapsed && <span>├ Normas Técnicas</span>}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveModule('desenho')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-all ${
                    activeModule === 'desenho'
                      ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                  title="Prancha Técnica CAD 2D A3 & PDF"
                >
                  <FileCode2 className="w-4 h-4 shrink-0 text-cyan-300" />
                  {!sidebarCollapsed && <span>└ Desenho CAD 2D A3</span>}
                </button>
              </div>
            </div>

            {/* 4. PCP & CHÃO DE FÁBRICA */}
            <div className="space-y-1">
              {!sidebarCollapsed && (
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold px-3">
                  🏭 PCP & CHÃO DE FÁBRICA
                </span>
              )}
              <div className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => setActiveModule('pcp_estrutura')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-all ${
                    activeModule === 'pcp_estrutura'
                      ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                  title="Estrutura de Materiais BOM & Barras de 6m"
                >
                  <Boxes className="w-4 h-4 shrink-0 text-amber-400" />
                  {!sidebarCollapsed && <span>├ Estrutura (BOM 6m)</span>}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveModule('pcp_roteiros')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-all ${
                    activeModule === 'pcp_roteiros'
                      ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                  title="Roteiros e Sequenciamento de Operações MES"
                >
                  <Layers className="w-4 h-4 shrink-0 text-teal-400" />
                  {!sidebarCollapsed && <span>├ Roteiros MES</span>}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveModule('pcp_recursos')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-all ${
                    activeModule === 'pcp_recursos'
                      ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                  title="Recursos Fabris Agrupados"
                >
                  <Cpu className="w-4 h-4 shrink-0 text-indigo-400" />
                  {!sidebarCollapsed && <span>└ Recursos Fabris</span>}
                </button>
              </div>
            </div>

            {/* 5. ADMINISTRAÇÃO & MULTI-EMPRESA (Master / Super Admin) */}
            {(isMaster || isSuperAdmin) && (
              <div className="space-y-1 pt-2 border-t border-slate-800/80">
                {!sidebarCollapsed && (
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold px-3 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-amber-400" /> ADMINISTRAÇÃO MASTER
                  </span>
                )}
                <div className="space-y-0.5">
                  <button
                    type="button"
                    onClick={() => setActiveModule('multi_empresa')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-all ${
                      activeModule === 'multi_empresa'
                        ? 'bg-amber-950 text-amber-300 font-bold border border-amber-800'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    }`}
                    title="Gestão de Unidades e Multi-Empresa"
                  >
                    <Building className="w-4 h-4 shrink-0 text-amber-400" />
                    {!sidebarCollapsed && <span>├ Multi-Empresa / Filiais</span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveModule('aprovacoes')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-all ${
                      activeModule === 'aprovacoes'
                        ? 'bg-amber-950 text-amber-300 font-bold border border-amber-800'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    }`}
                    title="Aprovação de Novos Cadastros"
                  >
                    <UserCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                    {!sidebarCollapsed && (
                      <div className="flex items-center justify-between w-full">
                        <span>└ Aprovações</span>
                        {pendingApprovalsCount > 0 && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 text-[10px] font-mono font-bold">
                            {pendingApprovalsCount}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                </div>
              </div>
            )}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-slate-800 text-[11px] text-slate-500">
            {!sidebarCollapsed ? (
              <div>
                <div className="font-bold text-slate-300">DeltaFix v1.2</div>
                <div className="text-[10px] text-slate-500 font-mono">Contagem - MG • Brasil</div>
              </div>
            ) : (
              <div className="text-center font-bold text-cyan-400">DF</div>
            )}
          </div>
        </aside>

        {/* ÁREA DE TRABALHO PRINCIPAL */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#070b12]">
          <div className="max-w-[1920px] mx-auto">
            {activeModule === 'visao_geral' && (
              <OverviewDashboard onNavigate={(mod) => setActiveModule(mod as ActiveModule)} />
            )}

            {activeModule === 'empresas' && <CompaniesManagement />}

            {activeModule === 'pedidos' && <OrdersQuotesManagement />}

            {activeModule === 'produtos' && (
              <EngineeringConfigurator initialProducts={initialProducts} defaultSubTab="configurador" />
            )}

            {activeModule === 'normas' && (
              <EngineeringConfigurator initialProducts={initialProducts} defaultSubTab="normas" />
            )}

            {activeModule === 'desenho' && (
              <EngineeringConfigurator initialProducts={initialProducts} defaultSubTab="desenho" />
            )}

            {activeModule === 'pcp_estrutura' && <PcpManagement initialSubTab="estrutura" />}

            {activeModule === 'pcp_roteiros' && <PcpManagement initialSubTab="roteiros" />}

            {activeModule === 'pcp_recursos' && <PcpManagement initialSubTab="recursos" />}

            {activeModule === 'multi_empresa' && (
              <MultiCompanyManagement
                currentOrgId={currentOrgId}
                onSelectOrg={(id) => setCurrentOrgId(id)}
              />
            )}

            {activeModule === 'aprovacoes' && (
              <UserApprovalsManagement currentUserName={profile?.full_name || 'Super Admin'} />
            )}
          </div>
        </main>
      </div>

      {/* =========================================================================
          MODAL DE BUSCA GLOBAL [CTRL+K]
          ========================================================================= */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-20 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-4 shadow-2xl space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                autoFocus
                value={globalSearchTerm}
                onChange={(e) => setGlobalSearchTerm(e.target.value)}
                placeholder="Navegar para módulo, parceiro comercial, norma técnica..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1 text-xs">
              <span className="text-[10px] font-mono uppercase text-slate-500 font-bold px-2 block">
                Módulos do Sistema:
              </span>
              <button
                type="button"
                onClick={() => handleSelectModule('visao_geral')}
                className="w-full text-left p-2 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center justify-between"
              >
                <span>📊 Visão Geral & CRM Pipeline</span>
                <span className="text-[10px] font-mono text-cyan-400">Ir</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectModule('empresas')}
                className="w-full text-left p-2 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center justify-between"
              >
                <span>🤝 Gestão de Empresas / Clientes PJ</span>
                <span className="text-[10px] font-mono text-cyan-400">Ir</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectModule('pedidos')}
                className="w-full text-left p-2 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center justify-between"
              >
                <span>📄 Cotações & Pedidos Industriais</span>
                <span className="text-[10px] font-mono text-cyan-400">Ir</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectModule('produtos')}
                className="w-full text-left p-2 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center justify-between"
              >
                <span>⚙️ Configurador de Produtos & Peça Especial</span>
                <span className="text-[10px] font-mono text-cyan-400">Ir</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectModule('desenho')}
                className="w-full text-left p-2 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center justify-between"
              >
                <span>📐 Prancha Técnica CAD 2D A3 & PDF</span>
                <span className="text-[10px] font-mono text-cyan-400">Ir</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectModule('pcp_estrutura')}
                className="w-full text-left p-2 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center justify-between"
              >
                <span>🏭 PCP & Barras Comerciais de 6 Metros</span>
                <span className="text-[10px] font-mono text-cyan-400">Ir</span>
              </button>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-[10px] text-slate-500 font-mono">
              <span>Pressione ESC para fechar</span>
              <button
                type="button"
                onClick={() => setIsSearchModalOpen(false)}
                className="text-cyan-400 hover:underline"
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
