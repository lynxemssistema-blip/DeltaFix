// src/components/landing/LandingPage.tsx - Landing Page Institucional Zero Scroll (100vh) com Card de Acesso
'use client';

import React, { useState } from 'react';
import { DeltaLogo } from '@/components/ui/DeltaLogo';
import { supabase } from '@/lib/supabase/client';
import { addApprovalRequest } from '@/lib/services/commercialService';
import {
  Wrench,
  Compass,
  Factory,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Mail,
  User,
  Building2,
  ArrowRight,
  Search,
  Sparkles,
  HelpCircle,
  AlertCircle,
  PhoneCall,
  MapPin,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export function LandingPage() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Form states - Login
  const [loginEmail, setLoginEmail] = useState('edsonmanoel2012@gmail.com');
  const [loginPassword, setLoginPassword] = useState('10207597Rdv*');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState<string | null>(null);

  // Form states - Register
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regCnpj, setRegCnpj] = useState('');
  const [regCompanyName, setRegCompanyName] = useState('');
  const [regRole, setRegRole] = useState<'cliente_comprador' | 'engenharia_especificador' | 'fornecedor_parceiro'>(
    'cliente_comprador'
  );
  const [regLoading, setRegLoading] = useState(false);
  const [cnpjSearching, setCnpjSearching] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);

  // Modal "Esqueceu sua senha"
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState<string | null>(null);

  // Auto consulta de CNPJ na Receita Federal
  const handleConsultCnpj = async () => {
    const clean = regCnpj.replace(/\D/g, '');
    if (clean.length !== 14) {
      setRegError('Digite um CNPJ válido com 14 dígitos numéricos.');
      return;
    }
    setCnpjSearching(true);
    setRegError(null);
    try {
      const res = await fetch(`/api/cnpj/${clean}`);
      const data = await res.json();
      if (data.razao_social) {
        setRegCompanyName(data.razao_social);
      } else if (data.nome_fantasia) {
        setRegCompanyName(data.nome_fantasia);
      } else {
        setRegError('CNPJ não localizado na base pública. Insira a Razão Social manualmente.');
      }
    } catch {
      setRegError('Falha ao consultar CNPJ. Preencha a Razão Social manualmente.');
    } finally {
      setCnpjSearching(false);
    }
  };

  // Efetuar Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);
    setLoginSuccess(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword
      });

      if (error) {
        throw error;
      }

      setLoginSuccess('Autenticação aprovada! Acessando ecossistema DeltaFix...');
    } catch (err: any) {
      setLoginError(err.message || 'Credenciais inválidas. Verifique seu e-mail e senha.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Solicitar Novo Cadastro
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFullName || !regEmail || !regPassword || !regCompanyName) {
      setRegError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setRegLoading(true);
    setRegError(null);
    setRegSuccess(null);

    try {
      // 1. Criar usuário no Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: regEmail,
        password: regPassword,
        options: {
          data: {
            full_name: regFullName,
            company_name: regCompanyName,
            company_cnpj: regCnpj,
            requested_role: regRole,
            role: 'pending_approval'
          }
        }
      });

      if (error) throw error;

      // 2. Registrar solicitação para aprovação pelo usuário Master / Super Admin
      addApprovalRequest({
        nome: regFullName,
        email: regEmail,
        empresa_nome: regCompanyName,
        empresa_cnpj: regCnpj,
        perfil_solicitado: regRole,
        observacoes: 'Cadastro originado pela Landing Page Institucional DeltaFix.'
      });

      setRegSuccess(
        'Solicitação de cadastro enviada com sucesso! O Administrador Master da Delta irá analisar e aprovar suas permissões.'
      );
      // Limpar campos
      setRegFullName('');
      setRegEmail('');
      setRegPassword('');
      setRegCnpj('');
      setRegCompanyName('');
    } catch (err: any) {
      setRegError(err.message || 'Erro ao processar cadastro. Tente novamente.');
    } finally {
      setRegLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    try {
      await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: window.location.origin
      });
      setForgotMsg('Link de redefinição enviado para seu e-mail corporativo!');
    } catch (err: any) {
      setForgotMsg('Erro: ' + (err.message || 'Não foi possível enviar'));
    }
  };

  return (
    <main className="h-screen w-screen overflow-hidden bg-[#070b12] text-slate-100 flex flex-col justify-between relative selection:bg-cyan-500 selection:text-slate-950 font-sans">
      {/* Background Blueprint Grid Lines & Glow Effects */}
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #38bdf8 1px, transparent 1px), linear-gradient(to bottom, #38bdf8 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* =========================================================================
          1. TOPBAR MINIMALISTA
          ========================================================================= */}
      <header className="w-full border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md px-6 py-2.5 z-20 shrink-0">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between">
          {/* Logo & Razão Social */}
          <div className="flex items-center gap-3">
            <DeltaLogo size={34} />
            <div className="flex items-center gap-2.5">
              <span className="font-black text-lg tracking-wider text-white">DELTA</span>
              <span className="font-black text-lg tracking-wider text-cyan-400">FIX</span>
              <span className="hidden md:inline-block w-1 h-1 rounded-full bg-slate-600" />
              <span className="hidden md:inline text-xs font-semibold text-slate-400 tracking-wide uppercase">
                Parafusos & Fixadores Especiais
              </span>
            </div>
          </div>

          {/* Badges de Qualidade & Status */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700/80 text-[11px] font-mono font-semibold text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>ISO 9001:2015 CERTIFIED</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-emerald-500/30 text-[11px] font-mono">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-slate-400">Status:</span>
              <span className="text-emerald-400 font-bold">Online</span>
            </div>
          </div>
        </div>
      </header>

      {/* =========================================================================
          2. CORPO PRINCIPAL - SPLIT SCREEN (55% / 45%)
          ========================================================================= */}
      <section className="flex-1 w-full max-w-[1920px] mx-auto px-6 py-3 lg:py-4 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-12 overflow-hidden z-10">
        {/* ---------------------------------------------------------------------
            LADO ESQUERDO: APRESENTAÇÃO INSTITUCIONAL & TECH (55%)
            --------------------------------------------------------------------- */}
        <div className="w-full lg:w-[55%] flex flex-col justify-between h-full max-h-[82vh] pr-0 lg:pr-4">
          {/* Tagline de Categoria */}
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              Hub Tecnológico de Engenharia & Manufatura
            </span>
          </div>

          {/* Headline Forte */}
          <div className="my-auto py-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-white leading-[1.15] tracking-tight">
              ENGENHARIA DE FIXAÇÃO DE{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-amber-400">
                ALTA PERFORMANCE
              </span>{' '}
              PARA OPERAÇÕES QUE NÃO PODEM PARAR.
            </h1>
            <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl font-normal">
              Parametrização dimensional exata, desenhos técnicos CAD normatizados e gestão integrada de suprimentos
              para as maiores mineradoras, siderúrgicas e plantas industriais do Brasil.
            </p>
          </div>

          {/* Pilares de Valor (Grid Rápido 3 Ícones) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-2">
            {/* Pilar 1 */}
            <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/90 hover:border-cyan-500/40 transition-colors group">
              <div className="w-8 h-8 rounded-lg bg-cyan-950/90 border border-cyan-800/60 flex items-center justify-center text-cyan-400 mb-2 group-hover:scale-105 transition-transform">
                <Wrench className="w-4 h-4" />
              </div>
              <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Normas DIN/ISO/ASTM
              </h2>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                Matriz paramétrica completa com auto-dimensionamento de bitolas, passos e tolerâncias.
              </p>
            </div>

            {/* Pilar 2 */}
            <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/90 hover:border-sky-500/40 transition-colors group">
              <div className="w-8 h-8 rounded-lg bg-sky-950/90 border border-sky-800/60 flex items-center justify-center text-sky-400 mb-2 group-hover:scale-105 transition-transform">
                <Compass className="w-4 h-4" />
              </div>
              <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Desenho CAD 2D & 3D
              </h2>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                Geração instantânea de pranchas A3/A4 em formato ISO 128, vista isométrica e PDF oficial.
              </p>
            </div>

            {/* Pilar 3 */}
            <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/90 hover:border-amber-500/40 transition-colors group">
              <div className="w-8 h-8 rounded-lg bg-amber-950/90 border border-amber-800/60 flex items-center justify-center text-amber-400 mb-2 group-hover:scale-105 transition-transform">
                <Factory className="w-4 h-4" />
              </div>
              <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Rastreabilidade Total
              </h2>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                Certificados de qualidade 3.1 por lote, controle de corrida de aço e roteamento MES fabril.
              </p>
            </div>
          </div>

          {/* Indicadores Industriais (KPIs em destaque) */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-8 pt-3 border-t border-slate-800/80">
            <div>
              <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono tracking-tight">
                +35 Anos
              </div>
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Tradição & Expertise Fabril
              </div>
            </div>
            <div className="h-8 w-px bg-slate-800 hidden sm:block" />
            <div>
              <div className="text-xl sm:text-2xl font-black text-cyan-400 font-mono tracking-tight">
                100%
              </div>
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Rastreabilidade por Corrida
              </div>
            </div>
            <div className="h-8 w-px bg-slate-800 hidden sm:block" />
            <div>
              <div className="text-xl sm:text-2xl font-black text-slate-100 font-mono tracking-tight">
                ISO 9001
              </div>
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Gestão da Qualidade Assegurada
              </div>
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------------------------
            LADO DIREITO: CARD DE ACESSO AO SISTEMA (45%)
            --------------------------------------------------------------------- */}
        <div className="w-full lg:w-[45%] flex items-center justify-center">
          <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-xl p-5 sm:p-6 relative overflow-hidden">
            {/* Linha decorativa de topo */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-sky-400 to-amber-500" />

            {/* Cabeçalho do Card */}
            <div className="mb-4 text-center sm:text-left">
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                DeltaFix Core Enterprise
              </span>
              <h2 className="text-lg font-black text-white tracking-wide mt-0.5">
                PORTAL DELTAFIX INDUSTRIAL
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Selecione como deseja acessar o ambiente:
              </p>
            </div>

            {/* Tabs de Seleção: [ ENTRAR ] / [ NOVO CADASTRO ] */}
            <div className="grid grid-cols-2 p-1 bg-slate-950/80 rounded-xl border border-slate-800 mb-4">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setLoginError(null);
                  setRegError(null);
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'login'
                    ? 'bg-gradient-to-r from-cyan-600 to-sky-600 text-white shadow-lg shadow-cyan-900/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                ENTRAR
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  setLoginError(null);
                  setRegError(null);
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'register'
                    ? 'bg-gradient-to-r from-cyan-600 to-sky-600 text-white shadow-lg shadow-cyan-900/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                NOVO CADASTRO
              </button>
            </div>

            {/* TAB 1: FORMULÁRIO ENTRAR */}
            {activeTab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-3">
                {loginError && (
                  <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{loginError}</span>
                  </div>
                )}
                {loginSuccess && (
                  <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>{loginSuccess}</span>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-mono text-slate-300 font-bold uppercase mb-1">
                    E-mail Corporativo:
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="seu.email@empresa.com.br"
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-mono text-slate-300 font-bold uppercase">
                      Senha de Acesso:
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className="text-[10px] text-cyan-400 hover:text-cyan-300 hover:underline"
                    >
                      Esqueceu sua senha?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
                    />
                  </div>
                </div>

                {/* Botão Entrar */}
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 via-sky-600 to-cyan-500 hover:from-cyan-500 hover:to-sky-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-950/80 hover:shadow-cyan-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                >
                  {loginLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Autenticando...</span>
                    </>
                  ) : (
                    <>
                      <span>ENTRAR NO DELTAFIX</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Atalho Super Admin */}
                <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginEmail('edsonmanoel2012@gmail.com');
                      setLoginPassword('10207597Rdv*');
                    }}
                    className="text-[10px] font-mono text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1"
                  >
                    <ShieldCheck className="w-3 h-3 text-amber-400" />
                    Preencher Super Admin
                  </button>

                  <a
                    href="https://api.whatsapp.com/send?phone=553133528000&text=Ola%2C%20gostaria%20de%20ajuda%20comercial%20no%20DeltaFix"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-slate-400 hover:text-cyan-400 flex items-center gap-1"
                  >
                    <PhoneCall className="w-3 h-3 text-cyan-400" />
                    Ajuda Comercial
                  </a>
                </div>
              </form>
            )}

            {/* TAB 2: FORMULÁRIO NOVO CADASTRO */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-2.5 max-h-[58vh] overflow-y-auto pr-1">
                {regError && (
                  <div className="p-2 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{regError}</span>
                  </div>
                )}
                {regSuccess && (
                  <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                    <span>{regSuccess}</span>
                  </div>
                )}

                {/* Nome do Usuário */}
                <div>
                  <label className="block text-[10px] font-mono text-slate-300 font-bold uppercase mb-0.5">
                    Nome Completo do Usuário:
                  </label>
                  <input
                    type="text"
                    required
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="Ex: Carlos Eduardo Nogueira"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* CNPJ com Consulta Automática */}
                <div>
                  <label className="block text-[10px] font-mono text-slate-300 font-bold uppercase mb-0.5">
                    CNPJ da Empresa:
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      required
                      value={regCnpj}
                      onChange={(e) => setRegCnpj(e.target.value)}
                      placeholder="00.000.000/0000-00"
                      className="flex-1 bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                    />
                    <button
                      type="button"
                      onClick={handleConsultCnpj}
                      disabled={cnpjSearching}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-400 text-[10px] font-bold rounded-lg flex items-center gap-1 transition-all disabled:opacity-50"
                      title="Consultar dados da empresa na Receita Federal"
                    >
                      {cnpjSearching ? (
                        <div className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Search className="w-3 h-3" />
                      )}
                      <span>Buscar</span>
                    </button>
                  </div>
                </div>

                {/* Razão Social */}
                <div>
                  <label className="block text-[10px] font-mono text-slate-300 font-bold uppercase mb-0.5">
                    Razão Social da Empresa:
                  </label>
                  <input
                    type="text"
                    required
                    value={regCompanyName}
                    onChange={(e) => setRegCompanyName(e.target.value)}
                    placeholder="Nome oficial da empresa ou indústria"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Perfil Inicial */}
                <div>
                  <label className="block text-[10px] font-mono text-slate-300 font-bold uppercase mb-1">
                    Perfil Inicial de Acesso:
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      type="button"
                      onClick={() => setRegRole('cliente_comprador')}
                      className={`p-1.5 text-[10px] font-bold rounded border text-center transition-all ${
                        regRole === 'cliente_comprador'
                          ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Cliente / Compras
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegRole('engenharia_especificador')}
                      className={`p-1.5 text-[10px] font-bold rounded border text-center transition-all ${
                        regRole === 'engenharia_especificador'
                          ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Engenharia / Projeto
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegRole('fornecedor_parceiro')}
                      className={`p-1.5 text-[10px] font-bold rounded border text-center transition-all ${
                        regRole === 'fornecedor_parceiro'
                          ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Fornecedor / Insumos
                    </button>
                  </div>
                </div>

                {/* E-mail e Senha */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-300 font-bold uppercase mb-0.5">
                      E-mail Corporativo:
                    </label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="email@empresa.com"
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-300 font-bold uppercase mb-0.5">
                      Senha de Acesso:
                    </label>
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Mínimo 6 dígitos"
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>
                </div>

                {/* Botão Solicitar */}
                <button
                  type="submit"
                  disabled={regLoading}
                  className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-950/80 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 mt-2 disabled:opacity-50"
                >
                  {regLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Registrando solicitação...</span>
                    </>
                  ) : (
                    <>
                      <span>SOLICITAR ACESSO / CRIAR CONTA</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. RODAPÉ INSTITUCIONAL ZERO SCROLL
          ========================================================================= */}
      <footer className="w-full border-t border-slate-800/80 bg-slate-950/70 backdrop-blur-md px-6 py-2 z-20 shrink-0">
        <div className="max-w-[1920px] mx-auto flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Contagem - MG • Parque Industrial Metropolitano • Brasil</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-slate-500">DeltaFix Core Engine & CAD Parametric • v1.2</span>
            <span className="hidden md:inline text-slate-600">|</span>
            <a
              href="mailto:suporte@parafusosdelta.com.br"
              className="text-cyan-400 hover:underline flex items-center gap-1"
            >
              Suporte Técnico & Comercial
            </a>
          </div>
        </div>
      </footer>

      {/* MODAL ESQUECEU SUA SENHA */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-cyan-400" />
              Recuperar Senha de Acesso
            </h3>
            <p className="text-xs text-slate-400">
              Digite o e-mail cadastrado na plataforma DeltaFix para enviarmos o link seguro de redefinição.
            </p>
            {forgotMsg && (
              <div className="p-2 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 text-xs font-mono">
                {forgotMsg}
              </div>
            )}
            <form onSubmit={handleForgotPassword} className="space-y-3">
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="seu.email@empresa.com.br"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Fechar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-cyan-600 text-slate-950 text-xs font-bold hover:bg-cyan-500"
                >
                  Enviar Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
