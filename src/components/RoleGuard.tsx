"use client";

import React from 'react';
import { useAuth } from '@/components/providers/AuthProvider';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: ('admin' | 'viewer' | 'convidado')[];
  fallback?: React.ReactNode;
}

/**
 * Componente utilitário para renderização condicional baseada no cargo do usuário.
 * Remove os elementos do DOM caso o usuário não tenha permissão.
 */
export function RoleGuard({ children, allowedRoles, fallback = null }: RoleGuardProps) {
  const { role, loading } = useAuth();

  if (loading) return null;

  if (!role || !allowedRoles.includes(role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
