"use client";

import React from 'react';
import { LayoutDashboard, FileText, Settings, Search, LogOut, User as UserIcon, Menu, X, FolderOpen, Clock, Camera, Wrench, ShoppingBag, ChevronDown, Wallet, Construction, Activity } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import { usePathname } from 'next/navigation';

const Header = () => {
  const { user, role, signOut, loading } = useAuth();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = React.useState(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [activeDropdown, setActiveDropdown] = React.useState<string | null>(null);

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
                className={`px-4 py-2 text-sm font-heading rounded-architectural transition-all ${pathname === '/dashboard' ? 'bg-primary/10 text-primary font-bold shadow-sm border border-primary/10' : 'text-tertiary hover:bg-surface-low hover:text-foreground'}`}
              >
                Dashboard
              </Link>
              
              {/* Dropdown Financeiro */}
              <div 
                className="relative group px-1"
                onMouseEnter={() => setActiveDropdown('finance')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button 
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm font-heading rounded-architectural transition-all ${pathname.includes('/expenses') || pathname.includes('/balanco') || pathname.includes('/compras') ? 'text-primary font-bold' : 'text-tertiary hover:bg-surface-low hover:text-foreground'}`}
                >
                  <Wallet size={14} className="opacity-70" />
                  Financeiro
                  <ChevronDown size={14} className={`transition-transform duration-200 ${activeDropdown === 'finance' ? 'rotate-180' : ''}`} />
                </button>
                
                {activeDropdown === 'finance' && (
                  <div className="absolute top-full left-0 w-56 pt-2 z-[60]">
                    <div className="glass border border-ghost-border rounded-architectural shadow-xl p-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                      <Link href="/expenses" className="flex items-center gap-3 px-3 py-2.5 text-xs text-tertiary hover:text-primary hover:bg-primary/5 rounded-architectural transition-colors">
                        <FileText size={14} className="text-secondary" />
                        Extrato de Obra
                      </Link>
                      <Link href="/dashboard/balanco" className="flex items-center gap-3 px-3 py-2.5 text-xs text-tertiary hover:text-primary hover:bg-primary/5 rounded-architectural transition-colors">
                        <Activity size={14} className="text-tertiary" />
                        Balanço de Sócios
                      </Link>
                      <Link href="/project/compras" className="flex items-center gap-3 px-3 py-2.5 text-xs text-tertiary hover:text-primary hover:bg-primary/5 rounded-architectural transition-colors">
                        <ShoppingBag size={14} className="text-amber-500" />
                        Lista de Compras
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Dropdown Execução */}
              <div 
                className="relative group px-1"
                onMouseEnter={() => setActiveDropdown('construction')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button 
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm font-heading rounded-architectural transition-all ${pathname.includes('/timeline') || pathname.includes('/evolution') || pathname.includes('/documents') ? 'text-primary font-bold' : 'text-tertiary hover:bg-surface-low hover:text-foreground'}`}
                >
                  <Construction size={14} className="opacity-70" />
                  Execução
                  <ChevronDown size={14} className={`transition-transform duration-200 ${activeDropdown === 'construction' ? 'rotate-180' : ''}`} />
                </button>
                
                {activeDropdown === 'construction' && (
                  <div className="absolute top-full left-0 w-56 pt-2 z-[60]">
                    <div className="glass border border-ghost-border rounded-architectural shadow-xl p-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                      <Link href="/project/evolution" className="flex items-center gap-3 px-3 py-2.5 text-xs text-tertiary hover:text-primary hover:bg-primary/5 rounded-architectural transition-colors">
                        <Camera size={14} className="text-secondary" />
                        Diário de Obra
                      </Link>
                      <Link href="/project/timeline" className="flex items-center gap-3 px-3 py-2.5 text-xs text-tertiary hover:text-primary hover:bg-primary/5 rounded-architectural transition-colors">
                        <Clock size={14} className="text-tertiary" />
                        Etapas da Obra
                      </Link>
                      <Link href="/project/documents" className="flex items-center gap-3 px-3 py-2.5 text-xs text-tertiary hover:text-primary hover:bg-primary/5 rounded-architectural transition-colors">
                        <FolderOpen size={14} className="text-amber-500" />
                        Documentos
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Dropdown Utilidades */}
              <div 
                className="relative group px-1"
                onMouseEnter={() => setActiveDropdown('utility')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button 
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm font-heading rounded-architectural transition-all ${pathname.includes('/tools') ? 'text-primary font-bold' : 'text-tertiary hover:bg-surface-low hover:text-foreground'}`}
                >
                  <Wrench size={14} className="opacity-70" />
                  Extras
                  <ChevronDown size={14} className={`transition-transform duration-200 ${activeDropdown === 'utility' ? 'rotate-180' : ''}`} />
                </button>
                
                {activeDropdown === 'utility' && (
                  <div className="absolute top-full left-0 w-56 pt-2 z-[60]">
                    <div className="glass border border-ghost-border rounded-architectural shadow-xl p-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                      <Link href="/project/tools" className="flex items-center gap-3 px-3 py-2.5 text-xs text-tertiary hover:text-primary hover:bg-primary/5 rounded-architectural transition-colors">
                        <Wrench size={14} className="text-secondary" />
                        Ferramentas
                      </Link>
                    </div>
                  </div>
                )}
              </div>
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
              
              {/* Account Dropdown & Mobile Trigger */}
              <div className="flex items-center gap-2 sm:gap-3">
                <div 
                  className="relative hidden sm:block px-1"
                  onMouseEnter={() => setActiveDropdown('profile')}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button 
                    className={`flex items-center gap-2 p-1.5 rounded-full transition-all ${activeDropdown === 'profile' ? 'bg-primary/10 text-primary shadow-sm' : 'text-tertiary hover:bg-surface-low hover:text-foreground'}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                      <UserIcon size={16} />
                    </div>
                    <ChevronDown size={14} className={`transition-transform duration-200 ${activeDropdown === 'profile' ? 'rotate-180' : ''}`} />
                  </button>

                  {activeDropdown === 'profile' && (
                    <div className="absolute top-full right-0 w-56 pt-2 z-[60]">
                      <div className="glass border border-ghost-border rounded-architectural shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="px-4 py-3 bg-surface-low/50 border-b border-ghost-border">
                          <p className="text-[10px] font-heading text-tertiary uppercase tracking-widest leading-none mb-1">Usuário</p>
                          <p className="text-xs font-bold text-foreground truncate">{user.email?.split('@')[0]}</p>
                        </div>
                        
                        <div className="p-1.5">
                          {role === 'admin' && (
                            <Link 
                              href="/admin/overview" 
                              className="flex items-center gap-3 px-3 py-2.5 text-xs text-tertiary hover:text-primary hover:bg-primary/5 rounded-architectural transition-colors"
                            >
                              <Settings size={14} className="text-primary" />
                              Área Administrativa
                            </Link>
                          )}
                          
                          <button 
                            onClick={signOut}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-xs text-red-500 hover:bg-red-50 rounded-architectural transition-colors"
                          >
                            <LogOut size={14} />
                            Encerrar Sessão
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

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
                href="/project/tools" 
                className="text-tertiary hover:text-primary transition-colors text-sm font-body hidden md:block"
              >
                Ferramentas
              </Link>
              <Link 
                href="/project/documents" 
                className="text-tertiary hover:text-primary transition-colors text-sm font-body hidden md:block"
              >
                Documentos
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

            <div className="mt-4 mb-2 px-4 flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest font-heading text-tertiary font-bold">Financeiro</span>
              <div className="h-[1px] flex-1 bg-ghost-border"></div>
            </div>

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
              href="/dashboard/balanco" 
              className={`flex items-center gap-4 p-4 rounded-architectural text-base font-heading font-medium transition-all active:scale-[0.98] ${pathname === '/dashboard/balanco' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-foreground hover:bg-surface-low'}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${pathname === '/dashboard/balanco' ? 'bg-white/20' : 'bg-primary/10 text-primary'}`}>
                <Settings size={18} className="rotate-90" />
              </div>
              Balanço Financeiro
            </Link>
            <Link 
              href="/project/compras" 
              className={`flex items-center gap-4 p-4 rounded-architectural text-base font-heading font-medium transition-all active:scale-[0.98] ${pathname === '/project/compras' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-foreground hover:bg-surface-low'}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${pathname === '/project/compras' ? 'bg-white/20' : 'bg-primary/10 text-primary'}`}>
                <ShoppingBag size={18} />
              </div>
              Lista de Compras
            </Link>

            <div className="mt-4 mb-2 px-4 flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest font-heading text-tertiary font-bold">Execução</span>
              <div className="h-[1px] flex-1 bg-ghost-border"></div>
            </div>

            <Link 
              href="/project/evolution" 
              className={`flex items-center gap-4 p-4 rounded-architectural text-base font-heading font-medium transition-all active:scale-[0.98] ${pathname === '/project/evolution' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-foreground hover:bg-surface-low'}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${pathname === '/project/evolution' ? 'bg-white/20' : 'bg-primary/10 text-primary'}`}>
                <Camera size={18} />
              </div>
              Diário de Obra
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
              href="/project/documents" 
              className={`flex items-center gap-4 p-4 rounded-architectural text-base font-heading font-medium transition-all active:scale-[0.98] ${pathname === '/project/documents' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-foreground hover:bg-surface-low'}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${pathname === '/project/documents' ? 'bg-white/20' : 'bg-primary/10 text-primary'}`}>
                <FolderOpen size={18} />
              </div>
              Documentos
            </Link>

            <div className="mt-4 mb-2 px-4 flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest font-heading text-tertiary font-bold">Extras</span>
              <div className="h-[1px] flex-1 bg-ghost-border"></div>
            </div>

            <Link 
              href="/project/tools" 
              className={`flex items-center gap-4 p-4 rounded-architectural text-base font-heading font-medium transition-all active:scale-[0.98] ${pathname === '/project/tools' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-foreground hover:bg-surface-low'}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${pathname === '/project/tools' ? 'bg-white/20' : 'bg-primary/10 text-primary'}`}>
                <Wrench size={18} />
              </div>
              Ferramentas Emprestadas
            </Link>

            {loading ? (
              <div className="mt-4 pt-4 border-t border-ghost-border/50 px-4">
                <div className="h-3 w-20 bg-surface-low rounded animate-pulse mb-3"></div>
                <div className="h-14 w-full bg-surface-low rounded-architectural animate-pulse"></div>
              </div>
            ) : role === 'admin' ? (
              <div className="mt-4 pt-4 border-t border-ghost-border/50">
                <p className="text-[10px] font-heading text-tertiary uppercase tracking-widest mb-3 px-4">Administração</p>
                <Link 
                  href="/admin/overview" 
                  className={`flex items-center gap-4 p-4 rounded-architectural text-base font-heading font-medium transition-all active:scale-[0.98] ${pathname.startsWith('/admin') ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-foreground hover:bg-surface-low'}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${pathname.startsWith('/admin') ? 'bg-white/20' : 'bg-primary/10 text-primary'}`}>
                    <Settings size={18} />
                  </div>
                  Painel Administrativo
                </Link>
              </div>
            ) : null}
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
