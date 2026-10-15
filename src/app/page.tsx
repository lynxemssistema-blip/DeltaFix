// src/app/page.tsx - Multi-tenant Industrial Core Engine Page
import React from 'react';
import { AuthProvider } from '@/components/auth/AuthContext';
import { AuthProtectedApp } from '@/components/auth/AuthProtectedApp';
import { fetchRecentProducts } from '@/lib/supabase/service';

export default async function HomePage() {
  const initialProducts = await fetchRecentProducts();

  return (
    <AuthProvider>
      <AuthProtectedApp initialProducts={initialProducts} />
    </AuthProvider>
  );
}
