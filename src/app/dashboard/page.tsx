"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { ArrowUpRight, TrendingUp, CreditCard, Clock, CheckCircle2, ChevronRight, ExternalLink, ArrowRightLeft } from "lucide-react";
import Link from 'next/link';
import { ExpenseWithAttachments } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ExpenseList } from '@/components/ExpenseList';

export default function Dashboard() {
  const [expenses, setExpenses] = useState<ExpenseWithAttachments[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [phases, setPhases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [expensesRes, settingsRes, phasesRes] = await Promise.all([
        fetch('/api/expenses'),
        fetch('/api/settings'),
        fetch('/api/phases')
      ]);

      if (expensesRes.ok) {
        setExpenses(await expensesRes.json());
      }
      
      if (settingsRes.ok) {
        setSettings(await settingsRes.json());
      }

      if (phasesRes.ok) {
        setPhases(await phasesRes.json());
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Derived calculations
  const totalBudget = settings?.total_budget || 0; 
  const projectName = settings?.project_name || 'Projeto';
  const progress = settings?.completion_percentage || 0;
  
  // Encontrar a fase atual baseada no status 'in_progress' ou na última concluída
  const activePhase = phases.find(p => p.status === 'in_progress') || 
                      phases.filter(p => p.status === 'completed').sort((a,b) => b.order_index - a.order_index)[0];
                      
  const currentStage = activePhase?.title || settings?.current_stage || 'Planejamento Inicial';
  const totalInvested = expenses
    .filter(e => e.status === 'Pago')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const pendingExpenses = expenses
    .filter(e => e.status === 'Pendente')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const currentBalance = totalBudget - totalInvested;

  const getCategoryTotal = (category: string) => expenses
    .filter(e => e.category === category)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const stats = [
    { label: "Total Investido", value: formatCurrency(totalInvested), icon: TrendingUp, color: "text-primary" },
    { label: "Saldo em Conta", value: formatCurrency(currentBalance), icon: CreditCard, color: "text-secondary" },
    { label: "Gastos Pendentes", value: formatCurrency(pendingExpenses), icon: Clock, color: "text-tertiary" },
  ];

  const recentExpenses = expenses.slice(0, 4); // Take top 4

  if (loading) {
    return <div className="animate-pulse flex items-center justify-center min-h-[50vh] text-tertiary">Carregando painel do projeto...</div>;
  }

  return (
    <div className="space-y-10">
      {/* Hero Section: Project Status */}
      <section className="bg-surface-lowest rounded-architectural p-8 border border-ghost-border shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-tertiary font-body">Status da Obra</span>
            <h2 className="text-3xl font-heading text-foreground">{projectName}</h2>
            <p className="text-sm text-tertiary font-body max-w-md">Etapa atual: <strong className="text-foreground">{currentStage}</strong></p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-secondary font-body font-bold">{progress}% Concluído</span>
            <div className="w-64 h-3 bg-surface-low rounded-full overflow-hidden">
              <div className="h-full bg-secondary rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </section>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-surface-lowest p-8 rounded-architectural border border-ghost-border transition-all hover:translate-y-[-4px] hover:shadow-md cursor-default group">
            <div className="flex justify-between items-start mb-6">
              <div className={`p-3 rounded-architectural bg-surface-low ${stat.color} transition-colors group-hover:bg-primary group-hover:text-white`}>
                <stat.icon size={24} />
              </div>
              <ArrowUpRight size={16} className="text-tertiary opacity-40" />
            </div>
            <p className="text-xs font-body text-tertiary uppercase tracking-wider mb-2">{stat.label}</p>
            <h3 className="text-2xl font-heading text-foreground tracking-tight">{stat.value}</h3>
          </div>
        ))}
        
        {/* Evolution Quick Link (New) */}
        <Link href="/project/evolution" className="bg-primary/5 p-8 rounded-architectural border border-primary/20 transition-all hover:translate-y-[-4px] hover:shadow-md group flex flex-col justify-between">
           <div className="flex justify-between items-start">
              <div className="p-3 rounded-architectural bg-primary text-white">
                <Clock size={24} />
              </div>
              <ExternalLink size={16} className="text-primary opacity-60" />
           </div>
           <div>
              <p className="text-xs font-body text-primary uppercase tracking-wider mb-1">Diário de Obra</p>
              <h3 className="text-lg font-heading text-foreground tracking-tight">Ver Fotos da Evolução</h3>
           </div>
        </Link>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Recent Expenses Ledger */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-heading text-foreground">Últimos Lançamentos</h3>
            <Link href="/expenses" className="text-xs font-body text-primary hover:underline flex items-center gap-1 uppercase tracking-wider">
              Ver Extrato Completo <ChevronRight size={14} />
            </Link>
          </div>
          
          <div className="space-y-3 no-border-gap">
            <ExpenseList expenses={recentExpenses} variant="cards" />
          </div>
        </section>

        {/* Informações Auxiliares / Gráficos de Categoria */}
        <section className="space-y-6 bg-primary/5 rounded-architectural p-8 border border-primary/10">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={20} className="text-primary" />
            <h3 className="text-lg font-heading text-foreground">Resumo de Transparência</h3>
          </div>
          <p className="text-sm text-tertiary leading-relaxed font-body">
            Este painel exibe a prestação de contas em tempo real. Todos os gastos listados possuem comprovantes anexados via Google Drive (acesso restrito aos sócios).
          </p>
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="bg-white/50 p-4 rounded-architectural border border-white">
              <p className="text-[10px] uppercase text-tertiary opacity-70 mb-1">Materiais</p>
              <h4 className="text-xl font-heading text-primary">{formatCurrency(getCategoryTotal('Material'))}</h4>
            </div>
            <div className="bg-white/50 p-4 rounded-architectural border border-white">
              <p className="text-[10px] uppercase text-tertiary opacity-70 mb-1">Mão de Obra</p>
              <h4 className="text-xl font-heading text-secondary">{formatCurrency(getCategoryTotal('Mão de Obra'))}</h4>
            </div>
            <div className="bg-white/50 p-4 rounded-architectural border border-white">
              <p className="text-[10px] uppercase text-tertiary opacity-70 mb-1">Projetos/Taxas</p>
              <h4 className="text-xl font-heading text-tertiary">{formatCurrency(getCategoryTotal('Projetos'))}</h4>
            </div>
            <div className="bg-white/50 p-4 rounded-architectural border border-white">
              <p className="text-[10px] uppercase text-tertiary opacity-70 mb-1">Outros/Legal</p>
              <h4 className="text-xl font-heading text-primary/40">{formatCurrency(getCategoryTotal('Outros') + getCategoryTotal('Legal'))}</h4>
            </div>
          </div>
        </section>
      </div>

      {/* NEW: Financial Balance Quick Summary */}
      <section className="bg-surface-lowest rounded-architectural p-8 border border-ghost-border shadow-sm overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-12 bg-secondary/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-secondary/10 transition-colors" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/10 text-secondary rounded-full text-[10px] font-bold uppercase tracking-widest">
              <ArrowRightLeft size={12} /> Acerto de Contas
            </div>
            <h3 className="text-2xl font-heading text-foreground">Balanço Financeiro entre Sócios</h3>
            <p className="text-sm text-tertiary font-body max-w-lg">
              Veja automaticamente quem pagou a mais ou a menos e obtenha as instruções para zerar as contas da obra hoje mesmo.
            </p>
          </div>
          <Link 
            href="/dashboard/balanco" 
            className="flex items-center gap-3 px-8 py-4 bg-secondary text-white rounded-architectural font-heading hover:bg-secondary-container transition-all shadow-lg active:scale-95 group-hover:shadow-secondary/20"
          >
            Visualizar Balanço Completo <ChevronRight size={18} />
          </Link>
        </div>
      </section>

      {/* NEW: Construction Timeline */}
      <section className="space-y-8 pt-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-secondary/10 rounded-full">
            <Clock size={20} className="text-secondary" />
          </div>
          <h3 className="text-xl font-heading text-foreground">Linha do Tempo da Obra</h3>
          <Link href="/project/timeline" className="text-xs font-body text-primary hover:underline ml-auto flex items-center gap-1 uppercase tracking-wider">
             Ver Cronograma Completo <ChevronRight size={14} />
          </Link>
        </div>

        <div className="relative space-y-8 before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-ghost-border">
          {phases.map((phase, index) => (
            <div key={phase.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              {/* Icon / Dot */}
              <div className="flex items-center justify-center w-8 h-8 rounded-full border border-ghost-border bg-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <div className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-secondary animate-pulse' : 'bg-tertiary/30'}`} />
              </div>
              {/* Content Card */}
              <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] bg-surface-lowest p-6 rounded-architectural border border-ghost-border shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between space-x-2 mb-2">
                  <h4 className="font-heading text-foreground">{phase.title}</h4>
                  <time className="font-body text-[10px] text-tertiary uppercase tracking-wider">{formatDate(phase.phase_date)}</time>
                </div>
                {phase.description && (
                  <p className="text-sm font-body text-tertiary leading-relaxed">
                    {phase.description}
                  </p>
                )}
              </div>
            </div>
          ))}
          {phases.length === 0 && (
            <p className="text-center text-sm text-tertiary italic py-10">Iniciando cronograma do projeto...</p>
          )}
        </div>
      </section>
    </div>
  );
}
