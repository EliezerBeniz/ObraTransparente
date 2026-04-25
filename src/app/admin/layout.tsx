"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, LogOut, FileText, Settings, Users, Store, FolderOpen, Clock, Camera, Hammer, Wrench, ShoppingBag, Wallet, ChevronRight, BarChart3, X, Menu } from 'lucide-react';

import { useAuth } from '@/components/providers/AuthProvider';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, role, signOut, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Only redirect if loading is definitively finished, and we are sure there is no user OR the role is definitively not admin
    if (!loading) {
      if (!user) {
        router.push('/');
      } else if (role !== null && role !== 'admin') {
        router.push('/');
      }
    }
  }, [user, role, loading, router]);

  // Close mobile menu when pathname changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || role !== 'admin') return null;

  const SidebarLink = ({ href, icon: Icon, label, color = "text-primary" }: { href: string, icon: any, label: string, color?: string }) => {
    const isActive = pathname === href;
    return (
      <Link
        href={href}
        className={`flex items-center justify-between group px-4 py-2.5 text-sm font-heading rounded-architectural transition-all duration-200 ${
          isActive 
            ? 'bg-primary/10 text-primary shadow-sm' 
            : 'text-tertiary hover:bg-surface-low hover:text-foreground'
        }`}
      >
        <div className="flex items-center gap-3">
          <Icon size={18} className={`${isActive ? color : 'text-tertiary group-hover:text-primary transition-colors'}`} />
          <span className={isActive ? 'font-bold' : 'font-medium'}>{label}</span>
        </div>
        {isActive && <div className="w-1 h-4 bg-primary rounded-full animate-in zoom-in duration-300" />}
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex bg-background relative">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-ghost-border z-20 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-architectural flex items-center justify-center text-white shadow-md">
            <LayoutDashboard size={16} />
          </div>
          <h1 className="text-sm font-heading font-bold text-foreground uppercase tracking-tight">Admin</h1>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-tertiary hover:text-primary transition-colors"
          aria-label="Toggle Menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <div className="p-1 space-y-1.5 w-8">
            <div className="h-0.5 w-full bg-current rounded-full" />
            <div className="h-0.5 w-full bg-current rounded-full" />
            <div className="h-0.5 w-3/4 bg-current rounded-full" />
          </div>}
        </button>
      </div>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-30 transition-opacity animate-in fade-in duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-surface-lowest border-r border-ghost-border flex flex-col h-full shadow-xl lg:shadow-sm
        transition-transform duration-300 ease-in-out transform
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 border-b border-ghost-border bg-white flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-primary rounded-architectural flex items-center justify-center text-white shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
              <LayoutDashboard size={20} />
            </div>
            <div>
              <h1 className="text-base font-heading text-foreground leading-none">Admin</h1>
              <p className="text-[9px] text-tertiary uppercase tracking-wider mt-0.5 font-bold">Painel de Controle</p>
            </div>
          </Link>
          <button 
            className="lg:hidden text-tertiary hover:text-foreground"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-6 overflow-y-auto custom-scrollbar">
          {/* Categoria: Financeiro */}
          <div className="space-y-1">
            <p className="px-4 text-[10px] uppercase tracking-[0.15em] font-heading text-tertiary/60 font-black mb-3">Visão Geral</p>
            <SidebarLink href="/admin/overview" icon={BarChart3} label="Dashboard" color="text-primary" />
          </div>

          <div className="space-y-1">
            <p className="px-4 text-[10px] uppercase tracking-[0.15em] font-heading text-tertiary/60 font-black mb-3">Financeiro</p>
            <SidebarLink href="/admin/expenses" icon={FileText} label="Gerenciar Despesas" />
            <SidebarLink href="/admin/adiantamentos" icon={Wallet} label="Caixa da Obra" />
            <SidebarLink href="/admin/compras" icon={ShoppingBag} label="Lista de Compras" />
            <SidebarLink href="/admin/socios" icon={Users} label="Sócios e Acessos" />
          </div>

          {/* Categoria: Logística */}
          <div className="space-y-1">
            <p className="px-4 text-[10px] uppercase tracking-[0.15em] font-heading text-tertiary/60 font-black mb-3">Equipe & Logística</p>
            <SidebarLink href="/admin/pedreiros" icon={Hammer} label="Equipe de Obra" />
            <SidebarLink href="/admin/suppliers" icon={Store} label="Fornecedores" />
            <SidebarLink href="/admin/tools" icon={Wrench} label="Ferramentas" />
          </div>

          {/* Categoria: Projeto */}
          <div className="space-y-1">
            <p className="px-4 text-[10px] uppercase tracking-[0.15em] font-heading text-tertiary/60 font-black mb-3">Projeto</p>
            <SidebarLink href="/admin/timeline" icon={Clock} label="Cronograma" />
            <SidebarLink href="/admin/evolution" icon={Camera} label="Diário de Obra" />
            <SidebarLink href="/admin/documents" icon={FolderOpen} label="Documentos" />
          </div>

          {/* Categoria: Configurações */}
          <div className="space-y-1 pt-4 border-t border-ghost-border/50">
            <SidebarLink href="/admin/settings" icon={Settings} label="Configurações" />
          </div>
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
      <div className="flex-1 lg:ml-72 flex flex-col pt-16 lg:pt-0 min-w-0 overflow-x-hidden">
        <main className="p-4 md:p-8 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
