import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { DEMO_CREDENTIALS, dummyUser, dummyTenant } from '../lib/dummyData';
import type { User, Tenant, TenantMember } from '../types';

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  tenantMember: TenantMember | null;
  loading: boolean;
  isDemoMode: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [tenantMember, setTenantMember] = useState<TenantMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const loadUserData = async (supabaseUser: SupabaseUser) => {
    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (profile) {
        setUser({
          id: supabaseUser.id,
          email: supabaseUser.email!,
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone: profile.phone,
          avatar_url: profile.avatar_url,
        });

        const { data: membership } = await supabase
          .from('tenant_members')
          .select(`
            *,
            tenant:tenants(*)
          `)
          .eq('user_id', supabaseUser.id)
          .eq('status', 'active')
          .single();

        if (membership) {
          setTenantMember(membership as TenantMember);
          setTenant(membership.tenant as unknown as Tenant);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const refreshSession = async () => {
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();
    if (supabaseUser) {
      await loadUserData(supabaseUser);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const demoMode = localStorage.getItem('demoMode');
      if (demoMode === 'true') {
        setIsDemoMode(true);
        setUser(dummyUser);
        setTenant(dummyTenant);
        setLoading(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        await loadUserData(session.user);
      }

      setLoading(false);
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await loadUserData(session.user);
      } else {
        setUser(null);
        setTenant(null);
        setTenantMember(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    if (email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) {
      setIsDemoMode(true);
      setUser(dummyUser);
      setTenant(dummyTenant);
      localStorage.setItem('demoMode', 'true');
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    setIsDemoMode(false);
    localStorage.removeItem('demoMode');
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    if (isDemoMode) {
      localStorage.removeItem('demoMode');
      setIsDemoMode(false);
      setUser(null);
      setTenant(null);
      setTenantMember(null);
      return;
    }

    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setTenant(null);
    setTenantMember(null);
  };

  return (
    <AuthContext.Provider value={{ user, tenant, tenantMember, loading, isDemoMode, signIn, signUp, signOut, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
