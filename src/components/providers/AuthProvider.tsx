"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  role: 'admin' | 'viewer' | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'admin' | 'viewer' | null>(null);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let mounted = true;
    
    // Safety timeout: Unlock UI after 3 seconds even if Supabase hangs
    const timeoutId = setTimeout(() => {
      if (mounted) {
        setLoading(false);
        console.debug('Auth loading safety timeout reached');
      }
    }, 3000);

    const checkRole = async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId);
        
        if (error) {
          console.warn('Role fetch error:', error);
          return 'viewer';
        }

        const userRole = data?.[0]?.role?.trim()?.toLowerCase();
        console.debug('Resolved role for', userId, ':', userRole);
        
        // Expondo para debug global (opcional)
        if (typeof window !== 'undefined') {
          (window as any)._last_role = userRole;
          (window as any)._last_user = userId;
        }

        return (userRole === 'admin') ? 'admin' : 'viewer';
      } catch (err) {
        console.error('CheckRole critical failure:', err);
        return 'viewer';
      }
    };

    async function initializeAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const initialUser = session?.user || null;
        
        if (mounted) {
          setUser(initialUser);
          if (initialUser) {
            const role = await checkRole(initialUser.id);
            if (mounted) setRole(role);
          } else {
            if (mounted) setRole(null);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const newUser = session?.user || null;
      console.debug('Auth state change:', event, newUser?.email);
      
      if (newUser) {
        setUser(newUser);
        const role = await checkRole(newUser.id);
        if (mounted) {
          setRole(role);
          setLoading(false);
          console.debug('Role updated from event:', role);
        }
      } else {
        if (mounted) {
          setUser(null);
          setRole(null);
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  // UI should only be unlocked when we have both user (if any) and their role resolved
  const isActuallyLoading = loading || (!!user && role === null);

  return (
    <AuthContext.Provider value={{ user, role, loading: isActuallyLoading, signOut }}>
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
