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

// Helper to manage cookies in the browser
const setRoleCookie = (role: string | null) => {
  if (typeof document === 'undefined') return;
  if (!role) {
    document.cookie = "app-user-role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
    return;
  }
  // Set cookie for 7 days
  const date = new Date();
  date.setTime(date.getTime() + (7 * 24 * 60 * 60 * 1000));
  document.cookie = `app-user-role=${role}; path=/; expires=${date.toUTCString()}; SameSite=Lax`;
};

const getRoleCookie = (): 'admin' | 'viewer' | 'convidado' | null => {
  if (typeof document === 'undefined') return null;
  const name = "app-user-role=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1);
    if (c.indexOf(name) === 0) {
      const val = c.substring(name.length, c.length);
      if (val === 'admin' || val === 'viewer' || val === 'convidado') return val;
    }
  }
  return null;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'admin' | 'viewer' | 'convidado' | null>(() => getRoleCookie());
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
    }, 10000);

    const checkRole = async (userId: string, retryCount = 0): Promise<'admin' | 'viewer' | 'convidado'> => {
      console.debug('Checking role for user:', userId, retryCount > 0 ? `(retry ${retryCount})` : '');
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .maybeSingle();
        
        if (error) {
          if ((error.message?.includes('Lock') || error.details?.includes('Lock')) && retryCount < 3) {
            console.warn(`Auth lock conflict detected for role fetch. Retrying in ${500 * (retryCount + 1)}ms...`);
            await new Promise(resolve => setTimeout(resolve, 500 * (retryCount + 1)));
            return checkRole(userId, retryCount + 1);
          }
          
          console.error('Role fetch failed permanently:', error);
          return role || 'viewer';
        }

        if (!data) {
          console.warn('No role mapping found for user:', userId);
          return 'viewer';
        }

        const userRole = data.role?.trim()?.toLowerCase();
        console.debug('Resolved role for', userId, ':', userRole);
        
        const finalRole = (userRole === 'admin' || userRole === 'convidado') ? userRole : 'viewer';
        setRoleCookie(finalRole); // Cache it
        return finalRole;
      } catch (err) {
        console.error('CheckRole critical failure:', err);
        return role || 'viewer';
      }
    };

    // Single source of truth for Auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      const newUser = session?.user || null;
      console.debug('Auth event:', event, newUser?.email);
      
      if (mounted) {
        setUser(newUser);
        
        if (newUser) {
          const fetchedRole = await checkRole(newUser.id);
          if (mounted) {
            setRole(fetchedRole);
            setLoading(false);
          }
        } else {
          setRole(null);
          setRoleCookie(null);
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
      const timeoutPromise = new Promise((resolve) => 
        setTimeout(() => resolve('timeout'), 2000)
      );
      
      await Promise.race([
        supabase.auth.signOut(),
        timeoutPromise
      ]);
      
      localStorage.clear();
      sessionStorage.clear();
      setRoleCookie(null);
    } catch (error) {
      console.warn('Alerta visual durante logout ignorado:', error);
      localStorage.clear();
      sessionStorage.clear();
      setRoleCookie(null);
    } finally {
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
