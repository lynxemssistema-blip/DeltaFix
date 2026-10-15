// src/components/auth/AuthContext.tsx - Multi-tenant Authentication Context for DeltaFix
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'super_admin' | 'engineering_manager' | 'engineer' | 'quality_inspector' | 'operator';
  departamento?: string;
  is_active?: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  loginAsDemo: () => void;
}

const DEMO_USER: User = {
  id: 'demo-user-id',
  app_metadata: {},
  user_metadata: { full_name: 'Edson Manoel (Demo)' },
  aud: 'authenticated',
  created_at: new Date().toISOString()
} as User;

const DEMO_PROFILE: UserProfile = {
  id: 'demo-user-id',
  email: 'edsonmanoel2012@gmail.com',
  full_name: 'Edson Manoel',
  role: 'super_admin',
  departamento: 'Diretoria de Engenharia & Manufatura',
  is_active: true
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isLoading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
  loginAsDemo: () => {}
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (currentUser: User) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (data && !error) {
        setProfile(data);
      } else {
        // Fallback default profile from user metadata or super admin match
        const isSuperAdmin = currentUser.email === 'edsonmanoel2012@gmail.com';
        setProfile({
          id: currentUser.id,
          email: currentUser.email || '',
          full_name: currentUser.user_metadata?.full_name || (isSuperAdmin ? 'Edson Manoel' : 'Engenheiro Delta'),
          role: isSuperAdmin ? 'super_admin' : (currentUser.user_metadata?.role || 'engineer'),
          departamento: isSuperAdmin ? 'Diretoria de Engenharia & Manufatura' : 'Engenharia de Produto'
        });
      }
    } catch (err) {
      console.error('Failed to load user profile:', err);
    }
  };

  useEffect(() => {
    // Check if demo mode was active
    if (typeof window !== 'undefined' && localStorage.getItem('deltafix_demo_session') === 'true') {
      setUser(DEMO_USER);
      setProfile(DEMO_PROFILE);
      setIsLoading(false);
      return;
    }

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loginAsDemo = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('deltafix_demo_session', 'true');
    }
    setUser(DEMO_USER);
    setProfile(DEMO_PROFILE);
    setIsLoading(false);
  };

  const signOut = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('deltafix_demo_session');
    }
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Error signing out:', err);
    }
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, isLoading, signOut, refreshProfile, loginAsDemo }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
