"use client";

import React from 'react';
import { LayoutDashboard, FileText, Settings, Search, LogOut, User as UserIcon, Menu, X, FolderOpen, Clock, Camera } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import { usePathname } from 'next/navigation';

const Header = () => {
  const { user, role, signOut, loading } = useAuth();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const isMounted = React.useRef(false);
  const [, setReRender] = React.useState({});

  React.useEffect(() => {
    isMounted.current = true;
    setReRender({});
  }, []);

  // Fechar menu ao mudar de rota
  React.useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Se estiver em uma rota de admin, não mostramos o header padrão
  const isAdminPage = pathname?.startsWith('/admin');
  if (isAdminPage) return null;

  // Se for SSR ou primeira renderização, retornamos o esqueleto fixo
  if (!isMounted.current) return <div className="h-20 w-full border-b border-ghost-border" />;

  const isLoginPage = pathname === '/';

  // Skeleton UI apenas se ainda estiver carregando a auth e NÃO estiver na landing
  if (loading && !isLoginPage) {
    return (
      <div className="h-20 w-full flex items-center px-6 animate-pulse border-b border-ghost-border bg-white">
        <div className="w-10 h-10 bg-surface-low rounded-architectural mr-3" />
        <div className="h-4 w-32 bg-surface-low rounded-architectural" />
      </div>
    );
  }

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

        <div className="flex items-center gap-2 sm:gap-4">
          {user && !isLoginPage && (
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
              href="/project/documents" 
              className={`flex items-center gap-4 p-4 rounded-architectural text-base font-body transition-colors ${pathname === '/project/documents' ? 'bg-primary/10 text-primary font-bold' : 'text-foreground hover:bg-surface-low'}`}
            >
              <FolderOpen size={20} />
              Documentos do Projeto
            </Link>
            <Link 
              href="/dashboard/balanco" 
              className={`flex items-center gap-4 p-4 rounded-architectural text-base font-body transition-colors ${pathname === '/dashboard/balanco' ? 'bg-primary/10 text-primary font-bold' : 'text-foreground hover:bg-surface-low'}`}
            >
              <Settings size={20} className="rotate-90" />
              Balanço Financeiro
            </Link>
            <Link 
              href="/project/timeline" 
              className={`flex items-center gap-4 p-4 rounded-architectural text-base font-body transition-colors ${pathname === '/project/timeline' ? 'bg-primary/10 text-primary font-bold' : 'text-foreground hover:bg-surface-low'}`}
            >
              <Clock size={20} />
              Cronograma de Obra
            </Link>
            <Link 
              href="/project/evolution" 
              className={`flex items-center gap-4 p-4 rounded-architectural text-base font-body transition-colors ${pathname === '/project/evolution' ? 'bg-primary/10 text-primary font-bold' : 'text-foreground hover:bg-surface-low'}`}
            >
              <Camera size={20} />
              Diário de Obra (Fotos)
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
