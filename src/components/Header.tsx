"use client";

import React from 'react';
import { LayoutDashboard, FileText, Settings, Search, LogOut, User as UserIcon, Menu, X, FolderOpen, Clock, Camera } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import { usePathname } from 'next/navigation';

const Header = () => {
  const { user, role, signOut, loading } = useAuth();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = React.useState(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fechar menu ao mudar de rota
  React.useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Se estiver em uma rota de admin, não mostramos o header padrão
  const isLoginPage = pathname === '/';

  // Se estiver em uma rota de admin, não mostramos o header padrão
  const isAdminPage = pathname?.startsWith('/admin');
  if (isAdminPage) return null;

  // Renderização comum (Servidor + Cliente) 
  // O que for específico do usuário (botões, nav) será condicional ao isMounted

  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-ghost-border transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-4 lg:gap-8">
          <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-primary rounded-architectural flex items-center justify-center text-white transition-transform group-hover:scale-105 shadow-sm">
              <LayoutDashboard size={20} />
            </div>
            <div>
              <h1 className="text-xl font-heading text-foreground leading-none">Transparência</h1>
              <p className="text-[10px] font-body text-tertiary uppercase tracking-wider mt-1 opacity-70">Construção Civil</p>
            </div>
          </Link>

          {/* Navegação - Apenas se montado e tiver usuário */}
          {isMounted && user && !isLoginPage && (
            <nav className="hidden md:flex items-center gap-1">
              <Link 
                href="/dashboard" 
                className={`px-4 py-2 text-sm font-body rounded-architectural transition-colors ${pathname === '/dashboard' ? 'bg-surface-low text-primary font-bold' : 'text-tertiary hover:bg-surface-low hover:text-foreground'}`}
              >
                Dashboard
              </Link>
              <Link 
                href="/expenses" 
                className={`px-3 py-2 text-sm font-body rounded-architectural transition-colors whitespace-nowrap ${pathname === '/expenses' ? 'bg-surface-low text-primary font-bold' : 'text-tertiary hover:bg-surface-low hover:text-foreground'}`}
              >
                Extrato
              </Link>
              <Link 
                href="/dashboard/balanco" 
                className={`px-3 py-2 text-sm font-body rounded-architectural transition-colors whitespace-nowrap ${pathname === '/dashboard/balanco' ? 'bg-surface-low text-primary font-bold' : 'text-tertiary hover:bg-surface-low hover:text-foreground'}`}
              >
                Balanço
              </Link>
              <Link 
                href="/project/documents" 
                className={`px-3 py-2 text-sm font-body rounded-architectural transition-colors whitespace-nowrap ${pathname === '/project/documents' ? 'bg-surface-low text-primary font-bold' : 'text-tertiary hover:bg-surface-low hover:text-foreground'}`}
              >
                Documentos
              </Link>
              <Link 
                href="/project/timeline" 
                className={`px-3 py-2 text-sm font-body rounded-architectural transition-colors whitespace-nowrap ${pathname === '/project/timeline' ? 'bg-surface-low text-primary font-bold' : 'text-tertiary hover:bg-surface-low hover:text-foreground'}`}
              >
                Etapas
              </Link>
              <Link 
                href="/project/evolution" 
                className={`px-3 py-2 text-sm font-body rounded-architectural transition-colors whitespace-nowrap ${pathname === '/project/evolution' ? 'bg-surface-low text-primary font-bold' : 'text-tertiary hover:bg-surface-low hover:text-foreground'}`}
              >
                Diário
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-4 min-w-[80px] justify-end">
          {isMounted && user && !isLoginPage && (
            <>
              {/* Desktop Search */}
              <div className="relative hidden xl:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary opacity-40 group-focus-within:text-primary transition-colors" size={16} />
                <input 
                  type="text" 
                  placeholder="Buscar..." 
                  className="bg-surface-low border-none rounded-architectural pl-10 pr-4 py-2 text-sm w-48 focus:w-64 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                />
              </div>
              
              <div className="hidden sm:block h-8 w-[1px] bg-ghost-border mx-2" />
              
              {/* Account / Mobile Menu Trigger */}
              <div className="flex items-center gap-2 sm:gap-3">
                {loading ? (
                  <div className="hidden lg:flex items-center justify-center w-28 h-9 bg-surface-low rounded-architectural animate-pulse border border-ghost-border/50 text-[10px] text-tertiary/40 font-heading">
                    Carregando...
                  </div>
                ) : role === 'admin' ? (
                  <Link href="/admin/expenses" className="hidden lg:block bg-primary/10 text-primary px-4 py-2 rounded-architectural text-xs font-heading hover:bg-primary/20 transition-all border border-primary/10 animate-in fade-in duration-300">
                    Área Admin
                  </Link>
                ) : null}
                
                <button 
                  onClick={signOut}
                  className="hidden sm:flex items-center gap-2 text-tertiary hover:text-red-500 transition-colors text-xs font-body group"
                  title="Sair do sistema"
                >
                  <div className="w-8 h-8 rounded-full bg-surface-low flex items-center justify-center group-hover:bg-red-50">
                    <LogOut size={14} />
                  </div>
                  <span className="hidden lg:inline text-xs font-medium">Sair</span>
                </button>

                {/* Mobile Menu Button */}
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="md:hidden w-10 h-10 flex items-center justify-center text-foreground bg-surface-low rounded-architectural transition-all active:scale-95"
                  aria-label="Abrir menu"
                >
                  {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </>
          )}

          {isMounted && !user && !isLoginPage && (
            <div className="flex items-center gap-4">
              <Link 
                href="/project/documents" 
                className="text-tertiary hover:text-primary transition-colors text-sm font-body hidden md:block"
              >
                Documentos do Projeto
              </Link>
              <Link href="/" className="bg-primary text-white px-5 py-2.5 rounded-architectural text-sm font-body hover:bg-primary-container transition-all">
                Login
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMounted && isMenuOpen && user && (
        <div className="md:hidden absolute top-[80px] left-0 w-full h-[calc(100vh-80px)] bg-background/95 backdrop-blur-md z-40 animate-in fade-in slide-in-from-top-4 duration-300 flex flex-col">
          <nav className="flex-1 overflow-y-auto p-6 flex flex-col gap-1.5">
            <Link 
              href="/dashboard" 
              className={`flex items-center gap-4 p-4 rounded-architectural text-base font-heading font-medium transition-all active:scale-[0.98] ${pathname === '/dashboard' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-foreground hover:bg-surface-low'}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${pathname === '/dashboard' ? 'bg-white/20' : 'bg-primary/10 text-primary'}`}>
                <LayoutDashboard size={18} />
              </div>
              Dashboard
            </Link>
            <Link 
              href="/expenses" 
              className={`flex items-center gap-4 p-4 rounded-architectural text-base font-heading font-medium transition-all active:scale-[0.98] ${pathname === '/expenses' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-foreground hover:bg-surface-low'}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${pathname === '/expenses' ? 'bg-white/20' : 'bg-primary/10 text-primary'}`}>
                <FileText size={18} />
              </div>
              Extrato de Obra
            </Link>
            <Link 
              href="/project/documents" 
              className={`flex items-center gap-4 p-4 rounded-architectural text-base font-heading font-medium transition-all active:scale-[0.98] ${pathname === '/project/documents' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-foreground hover:bg-surface-low'}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${pathname === '/project/documents' ? 'bg-white/20' : 'bg-primary/10 text-primary'}`}>
                <FolderOpen size={18} />
              </div>
              Documentos
            </Link>
            <Link 
              href="/dashboard/balanco" 
              className={`flex items-center gap-4 p-4 rounded-architectural text-base font-heading font-medium transition-all active:scale-[0.98] ${pathname === '/dashboard/balanco' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-foreground hover:bg-surface-low'}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${pathname === '/dashboard/balanco' ? 'bg-white/20' : 'bg-primary/10 text-primary'}`}>
                <Settings size={18} className="rotate-90" />
              </div>
              Balanço Financeiro
            </Link>
            <Link 
              href="/project/timeline" 
              className={`flex items-center gap-4 p-4 rounded-architectural text-base font-heading font-medium transition-all active:scale-[0.98] ${pathname === '/project/timeline' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-foreground hover:bg-surface-low'}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${pathname === '/project/timeline' ? 'bg-white/20' : 'bg-primary/10 text-primary'}`}>
                <Clock size={18} />
              </div>
              Etapas da Obra
            </Link>
            <Link 
              href="/project/evolution" 
              className={`flex items-center gap-4 p-4 rounded-architectural text-base font-heading font-medium transition-all active:scale-[0.98] ${pathname === '/project/evolution' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-foreground hover:bg-surface-low'}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${pathname === '/project/evolution' ? 'bg-white/20' : 'bg-primary/10 text-primary'}`}>
                <Camera size={18} />
              </div>
              Diário de Obra
            </Link>

            {role === 'admin' && (
              <div className="mt-4 pt-4 border-t border-ghost-border/50">
                <p className="text-[10px] font-heading text-tertiary uppercase tracking-widest mb-3 px-4">Administração</p>
                <Link 
                  href="/admin/expenses" 
                  className={`flex items-center gap-4 p-4 rounded-architectural text-base font-heading font-medium transition-all active:scale-[0.98] ${pathname.startsWith('/admin') ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-foreground hover:bg-surface-low'}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${pathname.startsWith('/admin') ? 'bg-white/20' : 'bg-primary/10 text-primary'}`}>
                    <Settings size={18} />
                  </div>
                  Painel Administrativo
                </Link>
              </div>
            )}
          </nav>
          
          <div className="p-6 border-t border-ghost-border/50 bg-surface-low/30">
             <button 
              onClick={signOut}
              className="w-full h-14 flex items-center justify-center gap-3 bg-white text-red-500 border border-red-100 rounded-architectural font-heading text-sm font-bold active:scale-[0.98] transition-all shadow-sm"
             >
               <LogOut size={18} />
               Encerrar Sessão
             </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
