// src/components/landing/LandingPage.tsx - Landing Page Institucional DeltaFix Ultra-Detalhada & Criativa
'use client';

import React, { useState } from 'react';
import { DeltaLogo } from '@/components/ui/DeltaLogo';
import { supabase } from '@/lib/supabase/client';
import { addApprovalRequest } from '@/lib/services/commercialService';
import { formatCpfCnpj, getDocumentType } from '@/lib/utils/formatters';
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
  AlertCircle,
  PhoneCall,
  MapPin,
  ExternalLink,
  ChevronRight,
  Award,
  Layers,
  Cpu,
  Flame,
  FileCheck2,
  Info
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';

export function LandingPage() {
  const { loginAsDemo } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [infoTab, setInfoTab] = useState<'solucoes' | 'sobre' | 'setores' | 'qualidade'>('solucoes');

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
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword
      });

      if (error) throw error;
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
      const { error } = await supabase.auth.signUp({
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
    <main className="h-screen w-screen overflow-hidden bg-[#060a12] text-slate-100 flex flex-col justify-between relative selection:bg-cyan-500 selection:text-slate-950 font-sans">
      {/* Background Factory Imagery & Blueprint Grid */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none bg-cover bg-center"
        style={{
          backgroundImage: `url('https://parafusosdelta.com.br/site/wp-content/uploads/2016/05/banner-5.jpg')`
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #38bdf8 1px, transparent 1px), linear-gradient(to bottom, #38bdf8 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* =========================================================================
          1. TOPBAR MINIMALISTA & CONTATO OFICIAL
          ========================================================================= */}
      <header className="w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md px-4 sm:px-6 py-2.5 z-20 shrink-0">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between gap-3">
          {/* Logo Oficial Delta + Marca DeltaFix */}
          <div className="flex items-center gap-3">
            <DeltaLogo size={36} />
            <div className="h-6 w-px bg-slate-800 hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="font-black text-lg tracking-wider text-white">DELTA</span>
              <span className="font-black text-lg tracking-wider text-cyan-400">FIX</span>
              <span className="hidden lg:inline-block w-1 h-1 rounded-full bg-slate-600" />
              <span className="hidden lg:inline text-xs font-semibold text-slate-400 tracking-wide uppercase">
                Indústria de Parafusos & Fixadores Especiais
              </span>
            </div>
          </div>

          {/* Dados de Contato Delta & Certificações */}
          <div className="flex items-center gap-3 sm:gap-4">
            <a
              href="tel:3133932466"
              className="hidden xl:flex items-center gap-1.5 text-xs text-slate-300 hover:text-cyan-400 transition-colors"
              title="Central Telefônica Delta Contagem"
            >
              <PhoneCall className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-mono font-semibold">(31) 3393-2466</span>
            </a>

            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700/80 text-[11px] font-mono font-semibold text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>ISO 9001 • ABNT</span>
            </div>

            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900/90 border border-emerald-500/30 text-[11px] font-mono">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-slate-400 hidden xs:inline">Sistema:</span>
              <span className="text-emerald-400 font-bold">Online</span>
            </div>

            {/* Botão de Entrada Imediata */}
            <button
              type="button"
              onClick={loginAsDemo}
              className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-cyan-500 via-sky-500 to-teal-400 hover:from-cyan-400 hover:to-sky-400 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-cyan-950/80 active:scale-95 transition-all cursor-pointer"
              title="Acessar o ERP DeltaFix imediatamente"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Entrar no Sistema</span>
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          2. CORPO PRINCIPAL - SPLIT SCREEN (55% / 45%)
          ========================================================================= */}
      <section className="flex-1 w-full max-w-[1920px] mx-auto px-4 sm:px-6 py-2 sm:py-3 lg:py-4 flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-8 overflow-hidden z-10">
        {/* ---------------------------------------------------------------------
            LADO ESQUERDO: APRESENTAÇÃO INSTITUCIONAL & TECH (55%)
            --------------------------------------------------------------------- */}
        <div className="w-full lg:w-[55%] flex flex-col justify-between h-full max-h-[82vh] pr-0 lg:pr-3">
          {/* Badge & Navegação de Conteúdo Institucional (#sobre / Soluções / Setores) */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-red-950/80 border border-red-800 text-red-300 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
              <Award className="w-3 h-3 text-red-400" />
              Delta Parafusos Especiais • Desde Contagem/MG
            </span>

            {/* Abas Rápidas de Detalhamento Institucional */}
            <div className="flex items-center gap-1 bg-slate-950/80 p-0.5 rounded-lg border border-slate-800 text-[11px]">
              <button
                type="button"
                onClick={() => setInfoTab('solucoes')}
                className={`px-2.5 py-1 rounded-md transition-all font-semibold ${
                  infoTab === 'solucoes'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Soluções Tech
              </button>
              <button
                type="button"
                onClick={() => setInfoTab('sobre')}
                className={`px-2.5 py-1 rounded-md transition-all font-semibold ${
                  infoTab === 'sobre'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Nossa Empresa (#sobre)
              </button>
              <button
                type="button"
                onClick={() => setInfoTab('setores')}
                className={`px-2.5 py-1 rounded-md transition-all font-semibold ${
                  infoTab === 'setores'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Setores Atendidos
              </button>
              <button
                type="button"
                onClick={() => setInfoTab('qualidade')}
                className={`px-2.5 py-1 rounded-md transition-all font-semibold ${
                  infoTab === 'qualidade'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Ligas & Qualidade
              </button>
            </div>
          </div>

          {/* CONTEÚDO CONDICIONAL DAS ABAS INSTITUCIONAIS */}
          <div className="my-auto py-2">
            {infoTab === 'solucoes' && (
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-black text-white leading-[1.15] tracking-tight">
                  ENGENHARIA DE FIXAÇÃO DE{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-cyan-300 to-amber-300">
                    ALTA PERFORMANCE
                  </span>{' '}
                  PARA OPERAÇÕES CRÍTICAS.
                </h1>
                <p className="mt-2 text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl font-normal">
                  Cálculo paramétrico exato, catálogo com normas internacionais (DIN/ISO/ASTM) e suporte completo a
                  peças especiais livres sob desenho técnico para as maiores plantas industriais do Brasil.
                </p>

                {/* 3 Pilares */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-3">
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition-colors">
                    <div className="w-7 h-7 rounded-lg bg-cyan-950/90 border border-cyan-800/60 flex items-center justify-center text-cyan-400 mb-1.5">
                      <Wrench className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="text-xs font-bold text-slate-200 uppercase">Catálogo & Normas</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      DIN, ISO e ASTM com cadastro livre de peças especiais sob amostra ou desenho.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-sky-500/40 transition-colors">
                    <div className="w-7 h-7 rounded-lg bg-sky-950/90 border border-sky-800/60 flex items-center justify-center text-sky-400 mb-1.5">
                      <Compass className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="text-xs font-bold text-slate-200 uppercase">Desenho CAD 2D A3</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      Geração vetorial ISO 128 com cotagem de rosca, cabeça e sobremetal de serra.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-red-500/40 transition-colors">
                    <div className="w-7 h-7 rounded-lg bg-red-950/90 border border-red-800/60 flex items-center justify-center text-red-400 mb-1.5">
                      <Factory className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="text-xs font-bold text-slate-200 uppercase">Rastreabilidade MES</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      Certificados 3.1, pontas pintadas por liga e roteiros fabris informatizados.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {infoTab === 'sobre' && (
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://parafusosdelta.com.br/site/wp-content/uploads/2024/03/iconegrande-delta-1.png"
                    alt="Delta Fixadores"
                    className="w-12 h-12 object-contain"
                  />
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">
                      Informações Oficiais de paratusosdelta.com.br
                    </span>
                    <h2 className="text-base font-black text-white">NOSSA EMPRESA</h2>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Atuando no segmento de fixadores, a <strong>Delta</strong> é uma empresa que produz grande variedade
                  de parafusos especiais, nas mais diversas ligas e perfis de cabeça, obedecendo rigorosamente padrões
                  internacionais. Todas as normas, desenhos ou amostras são rigorosamente respeitadas, numa total
                  obediência ao documento do cliente.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px] text-slate-300">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Parque industrial moderno e informatizado em Contagem - MG</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Ensaios mecânicos, metalográficos e análise química credenciada</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                  <span>📍 Av. Delta, 50 - Distrito Industrial - Contagem - MG</span>
                  <a
                    href="https://parafusosdelta.com.br/site/#sobre"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:underline flex items-center gap-1 font-bold"
                  >
                    <span>Visitar site oficial</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}

            {infoTab === 'setores' && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">Aplicações Pesadas</span>
                    <h2 className="text-base font-black text-white">SETORIZAÇÃO INDUSTRIAL</h2>
                  </div>
                  <span className="text-xs font-mono text-slate-400">Alto Torque & Carga</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-red-950/80 border border-red-800 flex items-center justify-center text-red-400 shrink-0">
                      <Flame className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Cimenteiro & Siderúrgico</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                        Fixadores para moinhos de bolas, fornos rotativos, carcaças de britadores e laminadores.
                      </p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-950/80 border border-amber-800 flex items-center justify-center text-amber-400 shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Construção Civil & Estruturas</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                        Chumbadores estruturais, barras roscadas de ancoragem e parafusos estruturais ASTM A325.
                      </p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-800 flex items-center justify-center text-emerald-400 shrink-0">
                      <Factory className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Sucroalcooleiro & Mineração</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                        Parafusos especiais de desfibra, transportadores, britagem primária e flotação de minério.
                      </p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-800 flex items-center justify-center text-cyan-400 shrink-0">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Petróleo, Gás & Energia</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                        Prisioneiros ASTM A193 B7/B7M/L7 com porcas pesadas 2H para flanges sob pressão extrema.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {infoTab === 'qualidade' && (
              <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">Metalurgia Delta</span>
                    <h2 className="text-base font-black text-white">LIGAS ESPECIAIS & TRATAMENTOS</h2>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-amber-300">
                    <ShieldCheck className="w-3 h-3" />
                    ISO 9001:2015
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <div className="font-mono font-bold text-cyan-400">SAE 4140 / 4340</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Aço Liga Têmpera</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <div className="font-mono font-bold text-emerald-400">A193 B7 / B7M</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Alta Temperatura</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <div className="font-mono font-bold text-amber-400">INOX 304 / 316</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Anti-corrosão A2/A4</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <div className="font-mono font-bold text-rose-400">CLASSES 8.8 / 12.9</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Grau 5, Grau 8</div>
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800 text-[11px] text-slate-300 flex items-center justify-between">
                  <span>Tratamentos: Zincado Eletrolítico, Galvanizado a Fogo (GF), Geomet e Fosfatizado.</span>
                  <span className="font-mono text-cyan-400 font-bold text-[10px]">Certificado 3.1</span>
                </div>
              </div>
            )}
          </div>

          {/* Indicadores Industriais (KPIs em destaque no rodapé do lado esquerdo) */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2.5 border-t border-slate-800/80">
            <div>
              <div className="text-lg sm:text-xl font-black text-amber-400 font-mono tracking-tight">+35 Anos</div>
              <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Tradição & Expertise</div>
            </div>
            <div className="h-6 w-px bg-slate-800 hidden sm:block" />
            <div>
              <div className="text-lg sm:text-xl font-black text-cyan-400 font-mono tracking-tight">100%</div>
              <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Rastreabilidade Lote</div>
            </div>
            <div className="h-6 w-px bg-slate-800 hidden sm:block" />
            <div>
              <div className="text-lg sm:text-xl font-black text-white font-mono tracking-tight">ISO 9001</div>
              <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Gestão Assegurada</div>
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------------------------
            LADO DIREITO: CARD DE ACESSO AO SISTEMA (45%)
            --------------------------------------------------------------------- */}
        <div className="w-full lg:w-[45%] flex items-center justify-center">
          <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-xl p-4 sm:p-5 relative overflow-hidden">
            {/* Linha decorativa de topo */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-cyan-400 to-amber-500" />

            {/* Cabeçalho do Card */}
            <div className="mb-3 text-center sm:text-left">
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                DeltaFix Core Enterprise
              </span>
              <h2 className="text-base sm:text-lg font-black text-white tracking-wide mt-0.5">
                PORTAL DELTA INDUSTRIAL
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Selecione como deseja acessar o ambiente:
              </p>
            </div>

            {/* Tabs de Seleção: [ ENTRAR ] / [ NOVO CADASTRO ] */}
            <div className="grid grid-cols-2 p-1 bg-slate-950/80 rounded-xl border border-slate-800 mb-3">
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
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 via-sky-600 to-cyan-500 hover:from-cyan-500 hover:to-sky-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-950/80 hover:shadow-cyan-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-1 disabled:opacity-50"
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

                {/* Botão Acesso Imediato / Demonstração */}
                <button
                  type="button"
                  onClick={loginAsDemo}
                  className="w-full py-2 px-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500 text-cyan-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Acesso Imediato / Ver Sistema Completo</span>
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
                    href="https://parafusosdelta.com.br/site/#sobre"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-slate-400 hover:text-cyan-400 flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3 text-cyan-400" />
                    Sobre a Delta
                  </a>
                </div>
              </form>
            )}

            {/* TAB 2: FORMULÁRIO NOVO CADASTRO */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-2.5 max-h-[56vh] overflow-y-auto pr-1">
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

                {/* CNPJ ou CPF com Consulta Automática e Máscara Dinâmica */}
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="block text-[10px] font-mono text-slate-300 font-bold uppercase">
                      CPF ou CNPJ:
                    </label>
                    <span className="text-[9px] font-mono text-cyan-400 font-bold">
                      {getDocumentType(regCnpj) === 'CPF'
                        ? '👤 Pessoa Física (CPF)'
                        : getDocumentType(regCnpj) === 'CNPJ'
                        ? '🏢 Pessoa Jurídica (CNPJ)'
                        : 'Formatando...'}
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      required
                      value={regCnpj}
                      onChange={(e) => setRegCnpj(formatCpfCnpj(e.target.value))}
                      placeholder="000.000.000-00 ou 00.000.000/0000-00"
                      className="flex-1 bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                    />
                    {regCnpj.replace(/\D/g, '').length === 14 && (
                      <button
                        type="button"
                        onClick={handleConsultCnpj}
                        disabled={cnpjSearching}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-400 text-[10px] font-bold rounded-lg flex items-center gap-1 transition-all disabled:opacity-50 shrink-0"
                        title="Consultar dados da empresa na Receita Federal"
                      >
                        {cnpjSearching ? (
                          <div className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Search className="w-3 h-3" />
                        )}
                        <span>Buscar Receita</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Razão Social ou Nome do Cliente */}
                <div>
                  <label className="block text-[10px] font-mono text-slate-300 font-bold uppercase mb-0.5">
                    {getDocumentType(regCnpj) === 'CPF' ? 'Nome do Cliente / Comprador:' : 'Razão Social da Empresa:'}
                  </label>
                  <input
                    type="text"
                    required
                    value={regCompanyName}
                    onChange={(e) => setRegCompanyName(e.target.value)}
                    placeholder={
                      getDocumentType(regCnpj) === 'CPF'
                        ? 'Nome completo da pessoa física'
                        : 'Nome oficial da empresa ou indústria'
                    }
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
      <footer className="w-full border-t border-slate-800/80 bg-slate-950/85 backdrop-blur-md px-4 sm:px-6 py-2 z-20 shrink-0">
        <div className="max-w-[1920px] mx-auto flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
            <span>Av. Delta, 50 - Distrito Industrial • Contagem - MG • Brasil</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-slate-500">DeltaFix Core Engine & CAD Parametric • v1.2</span>
            <span className="hidden md:inline text-slate-600">|</span>
            <a
              href="mailto:deltaparafusos@parafusosdelta.com.br"
              className="text-cyan-400 hover:underline flex items-center gap-1 font-mono"
            >
              deltaparafusos@parafusosdelta.com.br
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
