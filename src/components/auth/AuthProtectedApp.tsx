// src/components/auth/AuthProtectedApp.tsx - Orquestrador de Sessão, Landing Page & App Layout
'use client';

import React from 'react';
import { useAuth } from './AuthContext';
import { LandingPage } from '@/components/landing/LandingPage';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProductItem } from '@/lib/standards/types';
import { DeltaLogo } from '@/components/ui/DeltaLogo';

interface AuthProtectedAppProps {
  initialProducts: ProductItem[];
}

export function AuthProtectedApp({ initialProducts }: AuthProtectedAppProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-[#070b12] flex flex-col items-center justify-center space-y-4">
        <DeltaLogo size={64} className="animate-pulse" />
        <div className="text-xs font-mono text-cyan-400">
          Autenticando sessão DeltaFix com Supabase...
        </div>
      </div>
    );
  }

  // Se o usuário não está autenticado: apresenta a Landing Page Institucional Zero Scroll
  if (!user) {
    return <LandingPage />;
  }

  // Se o usuário está autenticado: entra diretamente no ERP/CRM com menu lateral retrátil
  return <AppLayout initialProducts={initialProducts} />;
}
