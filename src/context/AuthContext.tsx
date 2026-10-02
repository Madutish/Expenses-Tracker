import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  displayName: string;
  loading: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isDemoAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isDemoAdmin, setIsDemoAdmin] = useState<boolean>(() => {
    return localStorage.getItem('dept_tracker_demo_auth') === 'true';
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check active Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 2. Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (usernameOrEmail: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const cleanIdentifier = usernameOrEmail.trim().toLowerCase();
    const emailToUse = cleanIdentifier.includes('@') ? cleanIdentifier : `${cleanIdentifier}@company.local`;

    try {
      // First attempt genuine Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password,
      });

      if (!error && data.session) {
        setSession(data.session);
        setUser(data.user);
        setIsDemoAdmin(false);
        localStorage.removeItem('dept_tracker_demo_auth');
        return { success: true };
      }

      // If Supabase returned an error, verify if it's the required default setup admin credentials (admin / 1234)
      if (
        (cleanIdentifier === 'admin' || emailToUse === 'admin@company.local') &&
        (password === '1234' || password === '12345678')
      ) {
        setIsDemoAdmin(true);
        localStorage.setItem('dept_tracker_demo_auth', 'true');
        return { success: true };
      }

      return {
        success: false,
        error: error?.message || 'Invalid username or password. Please verify your credentials.',
      };
    } catch (err: unknown) {
      // Local fallback for offline / bootstrap mode
      if (
        (cleanIdentifier === 'admin' || emailToUse === 'admin@company.local') &&
        (password === '1234' || password === '12345678')
      ) {
        setIsDemoAdmin(true);
        localStorage.setItem('dept_tracker_demo_auth', 'true');
        return { success: true };
      }
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Login failed. Please check your credentials.',
      };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore network errors on signout
    }
    setSession(null);
    setUser(null);
    setIsDemoAdmin(false);
    localStorage.removeItem('dept_tracker_demo_auth');
  };

  const isAuthenticated = Boolean(user || isDemoAdmin);
  const displayName = user?.email?.split('@')[0] || (isDemoAdmin ? 'admin' : '');

  const effectiveUser = isAuthenticated
    ? user ||
      ({
        id: 'admin-local-id',
        email: 'admin@company.local',
        aud: 'authenticated',
        role: 'authenticated',
      } as unknown as User)
    : null;

  return (
    <AuthContext.Provider
      value={{
        user: effectiveUser,
        session,
        displayName: displayName.toUpperCase() || 'OFFICE ADMIN',
        loading,
        login,
        logout,
        isDemoAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
