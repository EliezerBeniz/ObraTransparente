"use client";

import React, { useState } from 'react';
import { LayoutDashboard, Lock, Eye, EyeOff, MailCheck } from 'lucide-react';

import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError('E-mail ou senha incorretos.');
      setLoading(false);
      return;
    }

    // Full page navigation ensures cookies are sent on the next request.
    // router.push() on iOS/Safari can fire before cookies propagate,
    // causing the middleware to redirect back to "/" in a loop.
    window.location.href = '/dashboard';
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError('Digite seu e-mail no campo acima primeiro.');
      return;
    }

    setLoading(true);
    setError('');

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (error) {
      setError('Erro ao enviar e-mail de recuperação.');
    } else {
      setResetSent(true);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <div className="w-12 h-12 bg-primary rounded-architectural flex items-center justify-center text-white">
            <LayoutDashboard size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-heading text-foreground leading-none">Transparência</h1>
            <p className="text-[10px] text-tertiary uppercase tracking-wider mt-1 opacity-70">Acesso ao Projeto</p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-surface-lowest rounded-architectural p-10 border border-ghost-border shadow-lg">
          <div className="flex items-center gap-2 mb-8">
            <Lock size={18} className="text-primary" />
            <h2 className="text-lg font-heading text-foreground">Acesso ao Sistema</h2>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-tertiary font-bold block">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="socio@obra.com"
                className="w-full bg-surface-low border-none rounded-architectural px-4 py-3.5 text-sm font-body text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-tertiary/40"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] uppercase tracking-widest text-tertiary font-bold block">Senha</label>
                <button
                  type="button"
                  onClick={handleResetPassword}
                  className="text-[10px] text-tertiary hover:text-primary transition-colors font-body"
                >
                  Esqueci minha senha
                </button>
              </div>
              
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-surface-low border-none rounded-architectural px-4 py-3.5 text-sm font-body text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-tertiary/40 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-tertiary hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {resetSent && (
              <div className="bg-primary/5 text-primary text-xs font-body px-4 py-3 rounded-architectural border border-primary/20 flex items-center gap-2">
                <MailCheck size={16} /> Verifique seu e-mail (incluindo spam) para redefinir a senha.
              </div>
            )}

            {error && (
              <div className="bg-red-50 text-red-600 text-xs font-body px-4 py-3 rounded-architectural border border-red-100">
                {error}
              </div>
            )}

            <button
               type="submit"
               disabled={loading}
               className="w-full bg-primary text-white py-3.5 rounded-architectural text-sm font-heading hover:bg-primary-container transition-all shadow-sm active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
             >
               {loading ? (
                 <span className="flex items-center justify-center gap-2">
                   <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                   Autenticando...
                 </span>
               ) : (
                 'Entrar no Painel'
               )}
             </button>
          </form>

          <div className="mt-8 pt-6 border-t border-ghost-border">
            <p className="text-[10px] text-tertiary text-center font-body">
              Acesso exclusivo para sócios e gestores do projeto.<br />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
