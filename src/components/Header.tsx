"use client";

import React from 'react';
import { LayoutDashboard, FileText, Settings, Search, LogOut, User as UserIcon, Menu, X } from 'lucide-react';
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

  // Se não estiver montado no cliente, renderize o esqueleto (SSR-safe)
  if (!isMounted) return <div className="h-20" />;

  // Se estiver na página de login, mostramos um header simplificado ou nada
  const isLoginPage = pathname === '/';

  if (loading && !isLoginPage) return <div className="h-20" />;

  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-ghost-border transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-primary rounded-architectural flex items-center justify-center text-white transition-transform group-hover:scale-105 shadow-sm">
              <LayoutDashboard size={20} />
            </div>
            <div>
              <h1 className="text-xl font-heading text-foreground leading-none">Transparência</h1>
              <p className="text-[10px] font-body text-tertiary uppercase tracking-wider mt-1 opacity-70">Construção Civil</p>
            </div>
          </Link>

          {user && !isLoginPage && (
            <nav className="hidden md:flex items-center gap-1">
              <Link 
                href="/dashboard" 
                className={`px-4 py-2 text-sm font-body rounded-architectural transition-colors ${pathname === '/dashboard' ? 'bg-surface-low text-primary font-bold' : 'text-tertiary hover:bg-surface-low hover:text-foreground'}`}
              >
                Dashboard
              </Link>
              <Link 
                href="/expenses" 
                className={`px-4 py-2 text-sm font-body rounded-architectural transition-colors ${pathname === '/expenses' ? 'bg-surface-low text-primary font-bold' : 'text-tertiary hover:bg-surface-low hover:text-foreground'}`}
              >
                Extrato de Obra
              </Link>
              <Link 
                href="/dashboard/balanco" 
                className={`px-4 py-2 text-sm font-body rounded-architectural transition-colors ${pathname === '/dashboard/balanco' ? 'bg-surface-low text-primary font-bold' : 'text-tertiary hover:bg-surface-low hover:text-foreground'}`}
              >
                Balanço
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {user && !isLoginPage && (
            <>
              {/* Desktop Search */}
              <div className="relative hidden lg:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary opacity-40" size={16} />
                <input 
                  type="text" 
                  placeholder="Buscar..." 
                  className="bg-surface-low border-none rounded-architectural pl-10 pr-4 py-2 text-sm lg:w-64 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                />
              </div>
              
              {/* Admin Area Shortcut (Desktop) */}
              {role === 'admin' && (
                <Link 
                  href="/admin/expenses" 
                  className="hidden md:flex w-10 h-10 items-center justify-center text-tertiary hover:bg-surface-low rounded-architectural transition-colors"
                  title="Configurações Admin"
                >
                  <Settings size={20} />
                </Link>
              )}
              
              <div className="hidden sm:block h-8 w-[1px] bg-ghost-border mx-2" />
              
              {/* Account / Mobile Menu Trigger */}
              <div className="flex items-center gap-2 sm:gap-3">
                {role === 'admin' && (
                  <Link href="/admin/expenses" className="hidden lg:block bg-primary/10 text-primary px-4 py-2 rounded-architectural text-xs font-heading hover:bg-primary/20 transition-all">
                    Área Admin
                  </Link>
                )}
                
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

          {!user && !isLoginPage && (
             <Link href="/" className="bg-primary text-white px-5 py-2.5 rounded-architectural text-sm font-body hover:bg-primary-container transition-all">
               Login
             </Link>
          )}
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMenuOpen && user && (
        <div className="md:hidden absolute top-[80px] left-0 w-full h-[calc(100vh-80px)] bg-background/95 backdrop-blur-md z-40 animate-in fade-in slide-in-from-top-4 duration-300">
          <nav className="flex flex-col p-6 gap-2">
            <Link 
              href="/dashboard" 
              className={`flex items-center gap-4 p-4 rounded-architectural text-base font-body transition-colors ${pathname === '/dashboard' ? 'bg-primary/10 text-primary font-bold' : 'text-foreground hover:bg-surface-low'}`}
            >
              <LayoutDashboard size={20} />
              Dashboard
            </Link>
            <Link 
              href="/expenses" 
              className={`flex items-center gap-4 p-4 rounded-architectural text-base font-body transition-colors ${pathname === '/expenses' ? 'bg-primary/10 text-primary font-bold' : 'text-foreground hover:bg-surface-low'}`}
            >
              <FileText size={20} />
              Extrato de Obra
            </Link>
            <Link 
              href="/dashboard/balanco" 
              className={`flex items-center gap-4 p-4 rounded-architectural text-base font-body transition-colors ${pathname === '/dashboard/balanco' ? 'bg-primary/10 text-primary font-bold' : 'text-foreground hover:bg-surface-low'}`}
            >
              <Settings size={20} className="rotate-90" />
              Balanço Financeiro
            </Link>

            {role === 'admin' && (
              <div className="mt-4 pt-4 border-t border-ghost-border">
                <p className="text-[10px] font-heading text-tertiary uppercase tracking-widest mb-2 px-4">Administração</p>
                <Link 
                  href="/admin/expenses" 
                  className={`flex items-center gap-4 p-4 rounded-architectural text-base font-body transition-colors ${pathname.startsWith('/admin') ? 'bg-primary/10 text-primary font-bold' : 'text-foreground hover:bg-surface-low'}`}
                >
                  <Settings size={20} />
                  Área do Administrador
                </Link>
              </div>
            )}

            <div className="mt-auto mb-10 pt-4 border-t border-ghost-border">
               <button 
                onClick={signOut}
                className="w-full h-14 flex items-center justify-center gap-3 bg-red-50 text-red-600 rounded-architectural font-heading text-sm active:scale-[0.98] transition-all"
               >
                 <LogOut size={18} />
                 Sair da Conta
               </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
