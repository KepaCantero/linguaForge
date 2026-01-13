'use client';

import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

// Credenciales de admin para desarrollo/demo
const ADMIN_CREDENTIALS = {
  email: 'admin',
  password: 'admin',
};

interface DemoUser {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
  };
}

interface AuthContextType {
  user: User | DemoUser | null;
  session: Session | null;
  loading: boolean;
  isConfigured: boolean; // Indica si Supabase está configurado
  isDemoUser: boolean; // Indica si el usuario actual es el demo admin
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithMagicLink: (email: string) => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | DemoUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoUser, setIsDemoUser] = useState(false);

  useEffect(() => {
    // Check for demo user in localStorage
    const demoUser = localStorage.getItem('linguaforge-demo-user');
    if (demoUser) {
      try {
        const parsed = JSON.parse(demoUser);
        setUser(parsed);
        setIsDemoUser(true);
        setLoading(false);
        return;
      } catch {
        localStorage.removeItem('linguaforge-demo-user');
      }
    }

    // Skip if Supabase is not configured
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    // Check for demo admin credentials
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      const demoUser: DemoUser = {
        id: 'demo-admin',
        email: 'admin@linguaforge.demo',
        user_metadata: {
          full_name: 'Admin Demo',
        },
      };
      setUser(demoUser);
      setIsDemoUser(true);
      localStorage.setItem('linguaforge-demo-user', JSON.stringify(demoUser));
      return { error: null };
    }

    if (!supabase) {
      return { error: { message: 'Supabase is not configured', status: 500 } as AuthError };
    }
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName?: string) => {
    if (!supabase) {
      return { error: { message: 'Supabase is not configured', status: 500 } as AuthError };
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    return { error };
  }, []);

  const signOut = useCallback(async () => {
    // Clear demo user
    if (isDemoUser) {
      setUser(null);
      setIsDemoUser(false);
      localStorage.removeItem('linguaforge-demo-user');
      return;
    }

    if (!supabase) return;
    await supabase.auth.signOut();
  }, [isDemoUser]);

  const signInWithGoogle = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    if (!supabase) {
      return { error: { message: 'Supabase is not configured', status: 500 } as AuthError };
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    return { error };
  }, []);

  const signInWithMagicLink = useCallback(async (email: string) => {
    if (!supabase) {
      return { error: { message: 'Supabase is not configured', status: 500 } as AuthError };
    }
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error };
  }, []);

  const value = useMemo(() => ({
    user,
    session,
    loading,
    isConfigured: !!supabase,
    isDemoUser,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    signInWithMagicLink,
    resetPassword,
  }), [user, session, loading, isDemoUser, signIn, signUp, signOut, signInWithGoogle, signInWithMagicLink, resetPassword]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

