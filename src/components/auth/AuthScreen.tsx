// src/components/auth/AuthScreen.tsx - Multi-tenant Industrial Login & Registration Screen
'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Cpu, ShieldCheck, Lock, Mail, User, Briefcase, ArrowRight, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';

export function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('edsonmanoel2012@gmail.com');
  const [password, setPassword] = useState('10207597Rdv*');
  const [fullName, setFullName] = useState('Edson Manoel');
  const [departamento, setDepartamento] = useState('Engenharia de Produto');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      setSuccessMessage('Autenticação autorizada! Carregando ambiente DeltaFix...');
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMessage(err.message || 'Credenciais inválidas. Verifique o e-mail e senha.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            departamento,
            role: email === 'edsonmanoel2012@gmail.com' ? 'super_admin' : 'engineer'
          }
        }
      });

      if (error) throw error;

      // Upsert into user_profiles
      if (data.user?.id) {
        await supabase.from('user_profiles').upsert({
          id: data.user.id,
          email,
          full_name: fullName,
          departamento,
          role: email === 'edsonmanoel2012@gmail.com' ? 'super_admin' : 'engineer'
        });
      }

      setSuccessMessage('Cadastro realizado com sucesso! Você já pode efetuar o login.');
      setIsSignUp(false);
    } catch (err: any) {
      console.error('Registration error:', err);
      setErrorMessage(err.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const fillSuperAdminCredentials = () => {
    setEmail('edsonmanoel2012@gmail.com');
    setPassword('10207597Rdv*');
    setIsSignUp(false);
  };

  return (
    <div className="min-h-screen bg-[#070b12] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Industrial Grid */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #38bdf8 1px, transparent 1px), linear-gradient(to bottom, #38bdf8 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }}
      />

      {/* Atmospheric Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-8 shadow-2xl relative z-10 backdrop-blur">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-amber-500 flex items-center justify-center font-extrabold text-slate-950 shadow-xl shadow-cyan-950/60 mb-3">
            <Cpu className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-xl font-extrabold tracking-wider text-white">
            DELTA<span className="text-cyan-400">FIX</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Delta Parafusos Especiais • Sistema MES / Engenharia
          </p>
          <div className="mt-2 text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
            Acesso Restrito • Multiusuário Autenticado
          </div>
        </div>

        {/* Quick Fill Super Admin Banner */}
        <div className="mb-5 bg-slate-950/80 border border-amber-500/30 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="text-[11px] font-mono text-slate-300">
              <span className="text-amber-400 font-bold">Super Admin:</span> edsonmanoel2012...
            </div>
          </div>
          <button
            type="button"
            onClick={fillSuperAdminCredentials}
            className="text-[10px] font-mono font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 px-2.5 py-1 rounded transition-colors"
          >
            Preencher
          </button>
        </div>

        {/* Feedback Alerts */}
        {errorMessage && (
          <div className="mb-4 bg-rose-950/50 border border-rose-800/80 rounded-lg p-3 flex items-start gap-2.5 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 bg-emerald-950/50 border border-emerald-800/80 rounded-lg p-3 flex items-start gap-2.5 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={isSignUp ? handleRegister : handleLogin} className="space-y-4 text-xs font-mono">
          {isSignUp && (
            <div>
              <label className="text-slate-400 block mb-1">Nome Completo</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                />
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              </div>
            </div>
          )}

          <div>
            <label className="text-slate-400 block mb-1">E-mail Corporativo</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@deltafix.ind.br"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 font-sans text-xs"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Senha de Acesso</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 font-sans text-xs"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            </div>
          </div>

          {isSignUp && (
            <div>
              <label className="text-slate-400 block mb-1">Departamento</label>
              <div className="relative">
                <select
                  value={departamento}
                  onChange={(e) => setDepartamento(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500 font-sans text-xs"
                >
                  <option value="Engenharia de Produto">Engenharia de Produto</option>
                  <option value="Controle de Qualidade (CQ)">Controle de Qualidade (CQ)</option>
                  <option value="Usinagem & Produção MES">Usinagem & Produção MES</option>
                  <option value="PCP & Suprimentos">PCP & Suprimentos</option>
                  <option value="Comercial Técnico">Comercial Técnico</option>
                </select>
                <Briefcase className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-950/40 disabled:opacity-50 mt-2"
          >
            <span>{loading ? 'Validando...' : isSignUp ? 'Criar Conta de Engenharia' : 'Entrar no Sistema'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Toggle Sign In / Sign Up */}
        <div className="mt-5 pt-4 border-t border-slate-800 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className="text-xs text-slate-400 hover:text-cyan-400 font-mono transition-colors"
          >
            {isSignUp
              ? 'Já possui uma conta? Efetue o login aqui.'
              : 'Novo engenheiro? Cadastre um novo usuário aqui.'}
          </button>
        </div>

        {/* Bottom Security Assurance */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>Autenticação Criptografada Supabase Auth • AES-256</span>
        </div>
      </div>
    </div>
  );
}
