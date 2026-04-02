"use client";

import React, { useState, useEffect } from 'react';
import { KeyRound, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // When the user lands on this page via an email link, Supabase will 
    // automatically parse the hash fragments and establish an active session.
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("Link expirado ou inválido. Por favor, tente redefinir a senha novamente.");
      }
    };
    checkSession();
  }, [supabase.auth]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
    });

    if (updateError) {
      setError(updateError.message || 'Erro ao atualizar a senha.');
      setLoading(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      router.refresh();
      router.push('/admin/expenses');
    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary rounded-architectural flex items-center justify-center text-white mx-auto mb-4">
            <KeyRound size={24} />
          </div>
          <h1 className="text-2xl font-heading text-foreground">Definição de Senha</h1>
          <p className="text-sm text-tertiary mt-2">Escolha uma nova senha para acessar o painel de transparência.</p>
        </div>

        {/* Form Card */}
        <div className="bg-surface-lowest rounded-architectural p-10 border border-ghost-border shadow-lg">
          {success ? (
            <div className="text-center space-y-4 animate-[fadeIn_0.5s_ease-out]">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto text-secondary">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-lg font-heading text-foreground">Senha Salva!</h2>
              <p className="text-sm text-tertiary font-body">Sua senha foi redefinida com sucesso. Redirecionando para o painel...</p>
            </div>
          ) : (
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-tertiary font-bold block">Nova Senha</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-surface-low border-none rounded-architectural px-4 py-3.5 text-sm font-body text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all pr-12"
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

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-tertiary font-bold block">Confirmar Senha</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-surface-low border-none rounded-architectural px-4 py-3.5 text-sm font-body text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-tertiary/40"
                  required
                />
              </div>

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
                     Salvando...
                   </span>
                 ) : (
                   'Salvar e Entrar'
                 )}
               </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
