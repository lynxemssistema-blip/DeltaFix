// src/components/auth/AuthProtectedApp.tsx - Auth Guard & Multi-user session header
'use client';

import React from 'react';
import { useAuth } from './AuthContext';
import { AuthScreen } from './AuthScreen';
import { EngineeringConfigurator } from '@/components/forms/EngineeringConfigurator';
import { ProductItem } from '@/lib/standards/types';
import { DeltaLogo } from '@/components/ui/DeltaLogo';
import { Database, Bot, LogOut, ShieldAlert, User, ShieldCheck } from 'lucide-react';

interface AuthProtectedAppProps {
  initialProducts: ProductItem[];
}

export function AuthProtectedApp({ initialProducts }: AuthProtectedAppProps) {
  const { user, profile, isLoading, signOut } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070b12] flex flex-col items-center justify-center space-y-4">
        <DeltaLogo size={64} className="animate-pulse" />
        <div className="text-xs font-mono text-cyan-400">
          Autenticando sessão DeltaFix com Supabase...
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  const isSuperAdmin = profile?.role === 'super_admin' || user.email === 'edsonmanoel2012@gmail.com';

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col justify-between">
      {/* Top Multi-Tenant Navbar */}
      <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur sticky top-0 z-50 px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Brand & Delta Official Logo */}
          <div className="flex items-center gap-3">
            <DeltaLogo size={42} />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-wider text-base text-white">DELTA</span>
                <span className="text-cyan-400 font-extrabold text-base tracking-wider">FIX</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                  CORE ENGINE v1.0
                </span>
                {isSuperAdmin && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-extrabold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-amber-400" />
                    SUPER ADMIN
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400 font-medium">
                Delta Parafusos Especiais • Sistema de Engenharia & Prancha Paramétrica A3
              </div>
            </div>
          </div>

          {/* User Profile, System Status & Logout */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Supabase Status */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400 hidden sm:inline">Supabase:</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Online
              </span>
            </div>

            {/* Lynx VPS AI Status */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono">
              <Bot className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400 hidden sm:inline">VPS AI:</span>
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                85.31.60.68
              </span>
            </div>

            {/* User Session Badge */}
            <div className="flex items-center gap-2.5 bg-slate-900 border border-slate-700/80 px-3 py-1 rounded-xl">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-600 to-amber-500 flex items-center justify-center text-slate-950 font-extrabold text-xs">
                {profile?.full_name ? profile.full_name[0].toUpperCase() : 'E'}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-slate-100 leading-tight">
                  {profile?.full_name || 'Edson Manoel'}
                </span>
                <span className="text-[10px] font-mono text-cyan-400 leading-tight">
                  {profile?.departamento || (isSuperAdmin ? 'Diretoria de Engenharia' : 'Engenheiro')}
                </span>
              </div>
              <button
                type="button"
                onClick={signOut}
                title="Encerrar sessão"
                className="ml-1 p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main App Content */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex-1">
        <EngineeringConfigurator initialProducts={initialProducts} />
      </div>

      {/* Industrial Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 px-6 py-6 text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>DeltaFix Parametric Core Engine • Homologado conforme DIN 933, DIN 931, DIN 912, DIN 934, DIN 125, DIN 127</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Usuário Ativo: <strong className="text-slate-200">{user.email}</strong></span>
            <span>•</span>
            <span>Acesso: <strong className="text-amber-400">{profile?.role?.toUpperCase() || 'SUPER_ADMIN'}</strong></span>
          </div>
        </div>
      </footer>
    </div>
  );
}
