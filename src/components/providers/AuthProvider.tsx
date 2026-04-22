"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User, AuthChangeEvent, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  role: 'admin' | 'viewer' | 'convidado' | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'admin' | 'viewer' | 'convidado' | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    let mounted = true;
    
    // Safety timeout: Unlock UI and force role resolution if Supabase hangs
    const timeoutId = setTimeout(() => {
      if (mounted) {
        setLoading(false);
        setRole(prevRole => {
          if (prevRole === null) {
            console.debug('Auth loading safety timeout: defaulting to viewer');
            return 'viewer';
          }
          return prevRole;
        });
      }
    }, 4000);

    const checkRole = async (userId: string) => {
      console.debug('Checking role for user:', userId);
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .maybeSingle(); // Better than limit(1) for single result
        
        if (error) {
          console.error('Role fetch error details:', {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
          });
          return 'viewer';
        }

        if (!data) {
          console.warn('No role mapping found for user:', userId);
          return 'viewer';
        }

        const userRole = data.role?.trim()?.toLowerCase();
        console.debug('Resolved role for', userId, ':', userRole);
        
        if (userRole === 'admin') return 'admin';
        if (userRole === 'convidado') return 'convidado';
        return 'viewer';
      } catch (err) {
        console.error('CheckRole critical failure:', err);
        return 'viewer';
      }
    };

    // Single source of truth for Auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      const newUser = session?.user || null;
      console.debug('Auth event:', event, newUser?.email);
      
      if (mounted) {
        setUser(newUser);
        
        if (newUser) {
          // Fetch role only if we have a user
          const role = await checkRole(newUser.id);
          if (mounted) {
            setRole(role);
            setLoading(false);
          }
        } else {
          setRole(null);
          setLoading(false);
        }
        
        clearTimeout(timeoutId);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signOut = async () => {
    try {
      // Create a timeout promise to ensure we don't hang if Supabase is unresponsive
      const timeoutPromise = new Promise((resolve) => 
        setTimeout(() => resolve('timeout'), 2000)
      );
      
      // Execute sign out with a 2 second timeout FIRST
      await Promise.race([
        supabase.auth.signOut(),
        timeoutPromise
      ]);
      
      // Clear data only after
      localStorage.clear();
      sessionStorage.clear();
    } catch (error) {
      console.warn('Alerta visual durante logout ignorado:', error);
      localStorage.clear();
      sessionStorage.clear();
    } finally {
      // ALWAYS redirect, even if API fails or hangs
      window.location.href = '/?logout=1';
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, loading: loading, signOut }}>
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
