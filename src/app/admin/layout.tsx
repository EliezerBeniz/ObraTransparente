"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, LogOut, FileText, Settings, Users } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, role, loading: authLoading, signOut } = useAuth();

  useEffect(() => {
    if (!authLoading && (!user || role !== 'admin')) {
      router.push('/');
    }
  }, [user, role, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || role !== 'admin') {
    return null;
  }

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-surface-lowest border-r border-ghost-border flex flex-col fixed h-full z-10">
        <div className="p-6 border-b border-ghost-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-architectural flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <LayoutDashboard size={20} />
            </div>
            <div>
              <h1 className="text-base font-heading text-foreground leading-none">Admin</h1>
              <p className="text-[9px] text-tertiary uppercase tracking-wider mt-0.5">Painel de Controle</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
          <Link
            href="/admin/expenses"
            className="flex items-center gap-3 px-4 py-3 text-sm font-body text-foreground bg-surface-low rounded-architectural transition-colors"
          >
            <FileText size={18} className="text-primary" />
            Gerenciar Despesas
          </Link>

          <Link
            href="/admin/socios"
            className="flex items-center gap-3 px-4 py-3 text-sm font-body text-tertiary hover:bg-surface-low rounded-architectural transition-colors"
          >
            <Users size={18} />
            Sócios e Permissões
          </Link>
          <Link
            href="/admin/settings"
            className="flex items-center gap-3 px-4 py-3 text-sm font-body text-tertiary hover:bg-surface-low rounded-architectural transition-colors"
          >
            <Settings size={18} />
            Configurações
          </Link>
        </nav>

        <div className="p-4 border-t border-ghost-border bg-surface-lowest mt-auto">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-2 text-xs font-body text-tertiary hover:text-foreground transition-colors mb-2"
          >
            ← Voltar ao Início
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-sm font-heading text-red-500 hover:bg-red-50 rounded-architectural transition-all w-full border border-transparent hover:border-red-100"
          >
            <LogOut size={18} />
            Sair do Painel
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 ml-64 flex flex-col">
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
