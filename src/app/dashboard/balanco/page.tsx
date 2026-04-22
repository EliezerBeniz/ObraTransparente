"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { 
  TrendingUp, 
  Users, 
  ArrowRightLeft, 
  CheckCircle2, 
  AlertCircle,
  ArrowDownCircle,
  ArrowUpCircle,
  PiggyBank,
  Receipt,
  ChevronDown,
  ChevronUp,
  CalendarDays
} from "lucide-react";
import { formatCurrency } from '@/lib/utils';
import { ExpenseWithAttachments, Profile } from '@/lib/types';
import { calculateProjectBalance, ProjectBalance, Advance } from '@/lib/finance';

export default function BalancoPage() {
  const [balance, setBalance] = useState<ProjectBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSocios, setExpandedSocios] = useState<Record<string, boolean>>({});

  const toggleSocio = (id: string) => {
    setExpandedSocios(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const fetchData = useCallback(async () => {
    try {
      const [expensesRes, sociosRes, advancesRes] = await Promise.all([
        fetch('/api/expenses'),
        fetch('/api/socios'),
        fetch('/api/advances'),
      ]);

      if (expensesRes.ok && sociosRes.ok) {
        const rawExpenses: ExpenseWithAttachments[] = await expensesRes.json();
        const expenses = rawExpenses.filter(e => e.status === 'Pago');
        const rawSocios: Profile[] = await sociosRes.json();
        const advances: Advance[] = advancesRes.ok ? await advancesRes.json() : [];
        const socios = rawSocios.filter((s: any) => {
          const role = Array.isArray(s.user_roles) ? s.user_roles[0]?.role : s.user_roles?.role;
          return role !== 'convidado';
        });
        const calculated = calculateProjectBalance(expenses, socios, advances);
        setBalance(calculated);
      }
    } catch (error) {
      console.error('Failed to fetch balance data', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-sm font-body text-tertiary animate-pulse">Calculando acerto de contas...</p>
      </div>
    );
  }

  if (!balance || balance.totalProject === 0) {
    return (
      <div className="bg-surface-lowest rounded-architectural p-12 border border-ghost-border text-center space-y-4">
        <div className="flex justify-center text-tertiary opacity-20">
          <Receipt size={64} />
        </div>
        <h2 className="text-xl font-heading text-foreground">Sem dados suficientes</h2>
        <p className="text-sm text-tertiary font-body max-w-sm mx-auto">
          Adicione despesas pagas pelos sócios para visualizar o balanço financeiro e as instruções de acerto.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-[fadeIn_0.4s_ease-out]">
      {/* Header Stat Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-surface-lowest p-6 md:p-8 rounded-architectural border border-ghost-border shadow-sm flex items-center justify-between group">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-tertiary mb-1 font-bold">Investimento Total na Obra</p>
            <h2 className="text-2xl md:text-3xl font-heading text-foreground tabular-nums">{formatCurrency(balance.totalProject)}</h2>
          </div>
          <div className="p-3 md:p-4 bg-primary/10 text-primary rounded-architectural group-hover:bg-primary group-hover:text-white transition-all shrink-0">
            <TrendingUp size={24} />
          </div>
        </div>
        <div className="bg-surface-lowest p-6 md:p-8 rounded-architectural border border-ghost-border shadow-sm flex items-center justify-between group">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-tertiary mb-1 font-bold">Cota Ideal por Sócio</p>
            <h2 className="text-2xl md:text-3xl font-heading text-secondary tabular-nums">{formatCurrency(balance.avgPerSocio)}</h2>
          </div>
          <div className="p-3 md:p-4 bg-secondary/10 text-secondary rounded-architectural group-hover:bg-secondary group-hover:text-white transition-all shrink-0">
            <PiggyBank size={24} />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Socio Status Cards */}
        <section className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-3">
            <Users size={20} className="text-primary" />
            <h3 className="text-lg font-heading text-foreground">Participação de Cada Sócio</h3>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {balance.socioBalances.map((socio) => (
              <div key={socio.id} className="bg-surface-lowest p-5 md:p-6 rounded-architectural border border-ghost-border shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${socio.net >= 0 ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'}`}>
                      {socio.net >= 0 ? <ArrowUpCircle size={18} /> : <ArrowDownCircle size={18} />}
                    </div>
                    <div>
                      <h4 className="font-heading text-foreground text-sm md:text-base">{socio.name}</h4>
                      <p className="text-[10px] text-tertiary uppercase font-bold tracking-tight">Investimento Individual</p>
                    </div>
                  </div>
                  <div className="w-full sm:w-auto text-left sm:text-right pt-3 sm:pt-0 border-t sm:border-t-0 border-ghost-border/50">
                    <p className={`text-sm md:text-base font-heading ${socio.net >= 0 ? 'text-secondary' : 'text-primary'}`}>
                      {socio.net >= 0 ? '+' : ''}{formatCurrency(socio.net)}
                    </p>
                    <p className="text-[10px] text-tertiary uppercase font-bold tracking-tight">Saldo Final</p>
                  </div>
                </div>

                {/* Progress Bar / Visualization of Contribution */}
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold text-tertiary">
                    <span>{formatCurrency(socio.paid)}</span>
                    <span>Meta: {formatCurrency(socio.expected)}</span>
                  </div>
                  <div className="w-full h-2 bg-surface-low rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${socio.net >= 0 ? 'bg-secondary' : 'bg-primary'}`}
                      style={{ width: `${Math.min(100, (socio.paid / socio.expected) * 100)}%` }}
                    />
                  </div>
                  {(socio as any).advancesTotal > 0 && (
                    <div className="pt-2">
                      <button 
                        onClick={() => toggleSocio(socio.id)}
                        className="flex items-center gap-2 text-[10px] text-tertiary font-body hover:text-primary transition-colors group/btn"
                      >
                        <span>
                          Inclui <strong>{formatCurrency((socio as any).advancesTotal)}</strong> em aportes ao Caixa
                        </span>
                        {expandedSocios[socio.id] ? <ChevronUp size={14} /> : <ChevronDown size={14} className="group-hover/btn:translate-y-0.5 transition-transform" />}
                      </button>

                      {/* Dropdown Content */}
                      <div className={`transition-all duration-300 ease-in-out scrollbar-thin scrollbar-thumb-ghost-border scrollbar-track-transparent ${expandedSocios[socio.id] ? 'max-h-[450px] opacity-100 mt-4 overflow-y-auto pr-1' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                        <div className="bg-surface-low/50 rounded-lg border border-ghost-border p-3 space-y-3">
                          <h5 className="text-[9px] uppercase tracking-widest font-bold text-tertiary flex items-center gap-2">
                            <Receipt size={12} />
                            Histórico de Aportes
                          </h5>
                          <div className="space-y-2">
                            {socio.advances.map((adv) => (
                              <div key={adv.id} className="flex items-center justify-between text-[11px] bg-surface-lowest p-2 rounded border border-ghost-border/50">
                                <div className="flex items-center gap-2 text-tertiary">
                                  <CalendarDays size={12} />
                                  <span>{new Date(adv.date + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                                </div>
                                <span className="flex-1 px-3 text-foreground italic whitespace-normal leading-tight py-1">
                                  {adv.description || 'Aporte ao Caixa'}
                                </span>
                                <span className="font-bold text-secondary">
                                  {formatCurrency(adv.amount)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Settlement Instructions */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <ArrowRightLeft size={20} className="text-secondary" />
            <h3 className="text-lg font-heading text-foreground">Como acertar as contas?</h3>
          </div>

          <div className="bg-surface-low/30 rounded-architectural border border-ghost-border p-6 space-y-6">
            {balance.instructions.length > 0 ? (
              <div className="space-y-4">
                {balance.instructions.map((ins, i) => (
                  <div key={i} className="bg-surface-lowest p-5 rounded-architectural border border-ghost-border flex items-center justify-between shadow-sm animate-[slideIn_0.3s_ease-out]">
                    <div className="space-y-1">
                      <p className="text-[9px] uppercase tracking-widest text-tertiary font-bold">Quem paga</p>
                      <p className="text-sm font-heading text-primary">{ins.fromName}</p>
                    </div>
                    <div className="flex flex-col items-center gap-1 opacity-20">
                      <ArrowRightLeft size={16} />
                      <p className="text-[8px] font-bold uppercase">{formatCurrency(ins.amount)}</p>
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="text-[9px] uppercase tracking-widest text-tertiary font-bold">Recebe de</p>
                      <p className="text-sm font-heading text-secondary">{ins.toName}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
                <div className="p-3 bg-secondary/10 text-secondary rounded-full">
                  <CheckCircle2 size={32} />
                </div>
                <p className="text-sm font-heading text-foreground">Tudo equilibrado!</p>
                <p className="text-xs text-tertiary font-body">Os gastos informados estão divididos igualmente entre todos os sócios.</p>
              </div>
            )}

            <div className="p-4 bg-tertiary/5 rounded-architectural border border-ghost-border/10 flex gap-3">
              <AlertCircle size={16} className="text-tertiary shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed text-tertiary font-body">
                Este cálculo é baseado no somatório total de gastos já <strong>pagos</strong>. Lançamentos pendentes não entram no acerto de contas até que sua situação seja regularizada.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
