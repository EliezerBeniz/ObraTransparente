"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, LogOut, FileText, Settings, Users, Store, FolderOpen, Clock, Camera, Hammer, Wrench, ShoppingBag, Wallet } from 'lucide-react';

import { useAuth } from '@/components/providers/AuthProvider';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, role, signOut, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || role !== 'admin')) {
      router.push('/');
    }
  }, [user, role, loading, router]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || role !== 'admin') return null;

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
            className={`flex items-center gap-3 px-4 py-3 text-sm font-body rounded-architectural transition-colors ${
              typeof window !== 'undefined' && window.location.pathname === '/admin/expenses' 
                ? 'bg-surface-low text-foreground' 
                : 'text-tertiary hover:bg-surface-low'
            }`}
          >
            <FileText size={18} className="text-primary" />
            Gerenciar Despesas
          </Link>

          <Link
            href="/admin/compras"
            className={`flex items-center gap-3 px-4 py-3 text-sm font-body rounded-architectural transition-colors ${
              typeof window !== 'undefined' && window.location.pathname === '/admin/compras' 
                ? 'bg-surface-low text-foreground' 
                : 'text-tertiary hover:bg-surface-low'
            }`}
          >
            <ShoppingBag size={18} className="text-primary" />
            Lista de Compras
          </Link>

          <Link
            href="/admin/adiantamentos"
            className={`flex items-center gap-3 px-4 py-3 text-sm font-body rounded-architectural transition-colors ${
              typeof window !== 'undefined' && window.location.pathname === '/admin/adiantamentos' 
                ? 'bg-surface-low text-foreground' 
                : 'text-tertiary hover:bg-surface-low'
            }`}
          >
            <Wallet size={18} className="text-primary" />
            Caixa da Obra
          </Link>

          <Link
            href="/admin/suppliers"
            className={`flex items-center gap-3 px-4 py-3 text-sm font-body rounded-architectural transition-colors ${
              typeof window !== 'undefined' && window.location.pathname === '/admin/suppliers' 
                ? 'bg-surface-low text-foreground' 
                : 'text-tertiary hover:bg-surface-low'
            }`}
          >
            <Store size={18} />
            Fornecedores
          </Link>

          <Link
            href="/admin/pedreiros"
            className={`flex items-center gap-3 px-4 py-3 text-sm font-body rounded-architectural transition-colors ${
              typeof window !== 'undefined' && window.location.pathname === '/admin/pedreiros' 
                ? 'bg-surface-low text-foreground' 
                : 'text-tertiary hover:bg-surface-low'
            }`}
          >
            <Hammer size={18} />
            Equipe de Obra
          </Link>

          <Link
            href="/admin/tools"
            className={`flex items-center gap-3 px-4 py-3 text-sm font-body rounded-architectural transition-colors ${
              typeof window !== 'undefined' && window.location.pathname === '/admin/tools' 
                ? 'bg-surface-low text-foreground' 
                : 'text-tertiary hover:bg-surface-low'
            }`}
          >
            <Wrench className="text-tertiary" size={18} />
            Ferramentas
          </Link>

          <Link
            href="/admin/documents"
            className={`flex items-center gap-3 px-4 py-3 text-sm font-body rounded-architectural transition-colors ${
              typeof window !== 'undefined' && window.location.pathname === '/admin/documents' 
                ? 'bg-surface-low text-foreground' 
                : 'text-tertiary hover:bg-surface-low'
            }`}
          >
            <FolderOpen size={18} />
            Documentos do Projeto
          </Link>

          <Link
            href="/admin/socios"
            className={`flex items-center gap-3 px-4 py-3 text-sm font-body rounded-architectural transition-colors ${
              typeof window !== 'undefined' && window.location.pathname === '/admin/socios' 
                ? 'bg-surface-low text-foreground' 
                : 'text-tertiary hover:bg-surface-low'
            }`}
          >
            <Users size={18} />
            Sócios e Permissões
          </Link>
          <Link
            href="/admin/timeline"
            className={`flex items-center gap-3 px-4 py-3 text-sm font-body rounded-architectural transition-colors ${
              typeof window !== 'undefined' && window.location.pathname === '/admin/timeline' 
                ? 'bg-surface-low text-foreground' 
                : 'text-tertiary hover:bg-surface-low'
            }`}
          >
            <Clock size={18} />
            Cronograma (Etapas)
          </Link>

          <Link
            href="/admin/evolution"
            className={`flex items-center gap-3 px-4 py-3 text-sm font-body rounded-architectural transition-colors ${
              typeof window !== 'undefined' && window.location.pathname === '/admin/evolution' 
                ? 'bg-surface-low text-foreground' 
                : 'text-tertiary hover:bg-surface-low'
            }`}
          >
            <Camera size={18} />
            Diário de Obra (Fotos)
          </Link>

          <Link
            href="/admin/settings"
            className={`flex items-center gap-3 px-4 py-3 text-sm font-body rounded-architectural transition-colors ${
              typeof window !== 'undefined' && window.location.pathname === '/admin/settings' 
                ? 'bg-surface-low text-foreground' 
                : 'text-tertiary hover:bg-surface-low'
            }`}
          >
            <Settings size={18} />
            Configurações Projeto
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
            onClick={signOut}
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
