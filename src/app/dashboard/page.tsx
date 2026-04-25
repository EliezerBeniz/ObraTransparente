"use client";

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  TrendingUp, Clock, CheckCircle2, ChevronRight, ArrowRightLeft,
  CalendarDays, Camera, Building2, Users, Wrench
} from "lucide-react";
import Link from 'next/link';
import { ExpenseWithAttachments } from '@/lib/types';
import { formatCurrency, formatDate, getDirectDriveImageUrl, isLendingDelayed } from '@/lib/utils';
import { ExpenseList } from '@/components/ExpenseList';
import { useAuth } from '@/components/providers/AuthProvider';

// ─────────────────────────────────────────────
// Mini Donut Chart (SVG puro)
// ─────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  'Material':    '#3B82F6',
  'Equipamento': '#F43F5E',
  'Mão de Obra': '#10B981',
  'Projetos':    '#8B5CF6',
  'Legal':       '#F59E0B',
  'Outros':      '#6B7280',
};

function MiniDonut({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const total = segments.reduce((s, r) => s + r.value, 0);
  if (total === 0) return null;
  const r = 56; const cx = 64; const cy = 64; const inner = 34;
  const circ = 2 * Math.PI * r;
  let off = 0;
  const slices = segments.map((s, i) => {
    const pct = s.value / total;
    const item = { ...s, pct, dash: pct * circ, gap: circ - pct * circ, off };
    off += pct * circ;
    return item;
  });
  const hov = hovered !== null ? slices[hovered] : null;

  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start sm:py-2 gap-6 sm:gap-8">
      <div className="relative shrink-0" style={{ width: 140, height: 140 }}>
        <svg width={140} height={140} viewBox="0 0 128 128" className="overflow-visible">
          {slices.map((s, i) => (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none"
              stroke={s.color} strokeWidth={hovered === i ? 16 : 13}
              strokeDasharray={`${s.dash} ${s.gap}`}
              strokeDashoffset={-s.off + circ * 0.25}
              style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px`, transition: 'stroke-width 0.15s, opacity 0.15s', opacity: hovered !== null && hovered !== i ? 0.3 : 1, cursor: 'pointer' }}
              onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
            />
          ))}
          <circle cx={cx} cy={cy} r={inner} fill="white" />
          <text x={cx} y={cy - 5} textAnchor="middle" style={{ fontSize: 10, fill: '#6B7280', fontWeight: 700 }}>
            {hov ? hov.label.split(' ')[0] : 'Total'}
          </text>
          <text x={cx} y={cy + 10} textAnchor="middle" style={{ fontSize: 11, fill: '#111827', fontWeight: 700 }}>
            {hov ? `${(hov.pct * 100).toFixed(0)}%` : '100%'}
          </text>
        </svg>
      </div>
      <div className="space-y-2.5 flex-1 w-full sm:w-auto min-w-0">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center justify-between gap-2 cursor-default"
            onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
              <span className="text-[11px] font-body text-tertiary truncate">{s.label}</span>
            </div>
            <span className="text-[11px] font-heading text-foreground tabular-nums">
              {formatCurrency(s.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Phase Status Icon
// ─────────────────────────────────────────────
function PhaseIcon({ status }: { status: string }) {
  if (status === 'completed') return (
    <div className="w-8 h-8 rounded-full bg-green-100 border-2 border-green-400 flex items-center justify-center">
      <CheckCircle2 size={14} className="text-green-600" />
    </div>
  );
  if (status === 'in_progress') return (
    <div className="w-8 h-8 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center">
      <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
    </div>
  );
  return (
    <div className="w-8 h-8 rounded-full bg-surface-low border-2 border-ghost-border flex items-center justify-center">
      <div className="w-2 h-2 rounded-full bg-tertiary/30" />
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Dashboard
// ─────────────────────────────────────────────
export default function Dashboard() {
  const { user, role } = useAuth();

  const [expenses, setExpenses]             = useState<ExpenseWithAttachments[]>([]);
  const [settings, setSettings]             = useState<any>(null);
  const [phases, setPhases]                 = useState<any[]>([]);
  const [latestEvolution, setLatestEvolution] = useState<any>(null);
  const [myAdvances, setMyAdvances]         = useState<any[]>([]);
  const [lendings, setLendings]             = useState<any[]>([]);
  const [loading, setLoading]               = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const fetches: Promise<any>[] = [
        fetch('/api/expenses').then(r => r.ok ? r.json() : []),
        fetch('/api/settings').then(r => r.ok ? r.json() : null),
        fetch('/api/phases').then(r => r.ok ? r.json() : []),
        fetch('/api/evolution').then(r => r.ok ? r.json() : []),
        fetch('/api/tool-lendings').then(r => r.ok ? r.json() : []),
      ];
      // Sócios podem ver seus aportes pessoais
      if (user && role !== 'convidado') {
        fetches.push(fetch('/api/advances').then(r => r.ok ? r.json() : []));
      }
      const [exp, set, ph, evo, tools, adv] = await Promise.all(fetches);
      setExpenses(exp);
      setSettings(set);
      setPhases(ph);
      setLendings(tools || []);
      if (evo?.length > 0) setLatestEvolution(evo[0]);
      if (adv) {
        // Filtra apenas aportes do usuário logado
        setMyAdvances(adv.filter((a: any) => a.user_id === user?.id));
      }
    } catch (err) {
      console.error('Dashboard fetch error', err);
    } finally {
      setLoading(false);
    }
  }, [user, role]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Derived calculations ──────────────────────
  const totalBudget  = settings?.total_budget ?? 0;
  const projectName  = settings?.project_name ?? 'Projeto';
  const progress     = settings?.completion_percentage ?? 0;

  const activePhase  = phases.find(p => p.status === 'in_progress') ??
                       phases.filter(p => p.status === 'completed').sort((a, b) => b.order_index - a.order_index)[0];
  const currentStage = activePhase?.title ?? settings?.current_stage ?? 'Planejamento Inicial';

  const paidExpenses    = expenses.filter(e => e.status === 'Pago');
  const totalInvested   = paidExpenses.reduce((s, e) => s + e.amount, 0);
  const totalPending    = expenses.filter(e => e.status === 'Pendente').reduce((s, e) => s + e.amount, 0);
  const currentBalance  = totalBudget - totalInvested;

  // Contador de dias desde o início (primeira despesa ou data da primeira fase)
  const startDate = useMemo(() => {
    const dates = [
      ...expenses.map(e => e.date),
      ...phases.map(p => p.phase_date),
    ].filter(Boolean).sort();
    return dates[0] ?? null;
  }, [expenses, phases]);

  const daysElapsed = useMemo(() => {
    if (!startDate) return null;
    const diff = Date.now() - new Date(startDate + 'T12:00:00').getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }, [startDate]);

  // Categorias para mini donut (apenas pagas)
  const categorySegments = useMemo(() => {
    const map: Record<string, number> = {};
    paidExpenses.forEach(e => {
      map[e.category] = (map[e.category] ?? 0) + e.amount;
    });
    return Object.entries(map)
      .map(([label, value]) => ({ label, value, color: CATEGORY_COLORS[label] ?? '#6B7280' }))
      .sort((a, b) => b.value - a.value);
  }, [paidExpenses]);

  // Aportes pessoais (sócio logado)
  const myTotalAdvances = myAdvances.reduce((s, a) => s + Number(a.amount), 0);
  // Cota esperada = totalInvested / (contar sócios não convidados) — mas aqui simplificamos sem buscar todos os sócios
  // Mostramos apenas o total depositado pelo sócio

  const recentExpenses = expenses.slice(0, 4);
  const pendingTools = lendings.filter(l => l.status !== 'Devolvido');

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-52 bg-surface-low rounded-architectural" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-surface-low rounded-architectural" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">

      {/* ─── HERO: Foto + Status ──────────────────────── */}
      <section className="relative rounded-architectural overflow-hidden border border-ghost-border shadow-sm bg-surface-lowest">
        {latestEvolution?.image_url ? (
          <div className="relative">
            <img
              src={getDirectDriveImageUrl(latestEvolution.image_url)}
              alt={latestEvolution.title}
              className="w-full h-52 object-cover"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 p-5 text-white">
              <div className="flex items-center gap-2 mb-1">
                <Camera size={12} className="opacity-70" />
                <span className="text-[10px] uppercase tracking-widest opacity-70 font-bold">Última atualização</span>
              </div>
              <p className="font-heading text-sm font-bold leading-snug">{latestEvolution.title}</p>
              <p className="text-[11px] opacity-60 mt-0.5">{formatDate(latestEvolution.date)}</p>
            </div>
          </div>
        ) : (
          <div className="h-24 bg-gradient-to-r from-primary/10 to-secondary/10 flex items-center justify-center">
            <Building2 size={32} className="text-primary/20" />
          </div>
        )}

        {/* Project name + progress */}
        <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-[0.2em] text-tertiary font-body font-bold">
              {daysElapsed !== null && (
                <span className="inline-flex items-center gap-1.5 mr-3">
                  <CalendarDays size={10} />
                  {daysElapsed} dias de obra
                </span>
              )}
            </span>
            <h2 className="text-2xl font-heading text-foreground">{projectName}</h2>
            <p className="text-sm text-tertiary font-body">
              Etapa atual: <strong className="text-foreground">{currentStage}</strong>
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 min-w-[180px]">
            <div className="flex items-center justify-between w-full">
              <span className="text-[10px] text-tertiary font-body">Progresso</span>
              <span className="text-[11px] font-heading text-primary font-bold">{progress}%</span>
            </div>
            <div className="w-full h-2.5 bg-surface-low rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-700"
                style={{ width: `${progress}%` }} />
            </div>
            <div className="w-full flex justify-between text-[9px] text-tertiary font-body">
              <span>{formatCurrency(totalInvested)} gasto</span>
              <span>Meta: {formatCurrency(totalBudget)}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── KPI CARDS ─────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          { label: "Total Investido", value: formatCurrency(totalInvested), sub: `${paidExpenses.length} despesas pagas`, icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
          { label: "Saldo Disponível", value: formatCurrency(currentBalance), sub: `de ${formatCurrency(totalBudget)} de orçamento`, icon: CheckCircle2, color: "text-primary", bg: "bg-primary/5" },
          { label: "Gastos Pendentes", value: formatCurrency(totalPending), sub: "aguardando pagamento", icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
        ].map((s, i) => (
          <div key={i} className="bg-surface-lowest p-6 rounded-architectural border border-ghost-border shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all group cursor-default">
            <div className="flex justify-between items-start mb-5">
              <div className={`p-2.5 rounded-architectural ${s.bg} ${s.color} group-hover:bg-primary group-hover:text-white transition-colors`}>
                <s.icon size={20} />
              </div>
            </div>
            <p className="text-[9px] font-body text-tertiary uppercase tracking-widest mb-1">{s.label}</p>
            <h3 className="text-xl font-heading text-foreground tabular-nums">{s.value}</h3>
            {s.sub && <p className="text-[10px] text-tertiary mt-1 font-body">{s.sub}</p>}
          </div>
        ))}
      </div>

      {/* ─── MAIN GRID ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Últimos lançamentos */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-heading text-foreground">Últimos Lançamentos</h3>
            <Link href="/expenses" className="text-[10px] font-body text-primary hover:underline flex items-center gap-1 uppercase tracking-wider">
              Ver Extrato <ChevronRight size={12} />
            </Link>
          </div>
          <ExpenseList expenses={recentExpenses} variant="cards" />
        </section>

        {/* Gastos por categoria + Mini Donut */}
        <section className="bg-surface-lowest rounded-architectural border border-ghost-border p-6 space-y-5">
          <h3 className="text-base font-heading text-foreground">Distribuição de Gastos</h3>
          {categorySegments.length > 0 ? (
            <MiniDonut segments={categorySegments} />
          ) : (
            <p className="text-sm text-tertiary text-center py-6">Sem despesas pagas registradas</p>
          )}
          <div className="pt-4 border-t border-ghost-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] text-tertiary font-body">
            <span className="flex items-center justify-between sm:justify-start w-full sm:w-auto gap-2">
              Total Pago: <strong className="text-foreground font-heading text-xs">{formatCurrency(totalInvested)}</strong>
            </span>
            <span className="flex items-center justify-between sm:justify-start w-full sm:w-auto gap-2">
              Pendente: <strong className="text-amber-500 font-heading text-xs">{formatCurrency(totalPending)}</strong>
            </span>
          </div>
        </section>
      </div>

      {/* ─── SÓCIO: Mini contribuição pessoal ─────────── */}
      {role === 'viewer' && user && myTotalAdvances > 0 && (
        <section className="bg-primary/5 rounded-architectural border border-primary/10 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users size={16} className="text-primary" />
            <h3 className="text-base font-heading text-foreground">Sua Participação</h3>
          </div>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <p className="text-[10px] text-tertiary uppercase tracking-widest font-bold mb-1">Total Aportado</p>
              <p className="text-2xl font-heading text-primary tabular-nums">{formatCurrency(myTotalAdvances)}</p>
              <p className="text-xs text-tertiary mt-1 font-body">em {myAdvances.length} aporte{myAdvances.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-tertiary uppercase tracking-widest font-bold mb-2">Último aporte</p>
              {myAdvances[0] && (
                <>
                  <p className="text-sm font-heading text-foreground">{formatCurrency(myAdvances[0].amount)}</p>
                  <p className="text-xs text-tertiary">{formatDate(myAdvances[0].date)}</p>
                  {myAdvances[0].description && (
                    <p className="text-[11px] text-tertiary/70 italic mt-1">{myAdvances[0].description}</p>
                  )}
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ─── Balanço CTA ───────────────────────────────── */}
      {role !== 'convidado' && (
        <section className="bg-surface-lowest rounded-architectural p-6 border border-ghost-border shadow-sm overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-40 h-40 bg-secondary/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-secondary/10 transition-colors" />
          <div className="relative flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/10 text-secondary rounded-full text-[10px] font-bold uppercase tracking-widest">
                <ArrowRightLeft size={10} /> Acerto de Contas
              </div>
              <h3 className="text-lg font-heading text-foreground">Balanço Financeiro entre Sócios</h3>
              <p className="text-sm text-tertiary font-body max-w-md">
                Veja quem pagou a mais ou a menos e obtenha as instruções de acerto automáticas.
              </p>
            </div>
            <Link href="/dashboard/balanco"
              className="flex items-center gap-3 px-6 py-3 bg-secondary text-white rounded-architectural font-heading text-sm hover:bg-secondary/90 transition-all shadow-md active:scale-95 shrink-0">
              Ver Balanço <ChevronRight size={16} />
            </Link>
          </div>
        </section>
      )}

      {/* ─── Ferramentas em Uso ────────────────────────── */}
      {pendingTools.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wrench size={18} className="text-primary" />
              <h3 className="text-base font-heading text-foreground">Equipamentos em Uso</h3>
            </div>
            <Link href="/project/tools" className="text-[10px] font-body text-primary hover:underline flex items-center gap-1 uppercase tracking-wider">
              Ver Todas <ChevronRight size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {pendingTools.slice(0, 4).map((tool) => (
              <div key={tool.id} className="bg-surface-lowest p-4 rounded-architectural border border-ghost-border shadow-sm hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-3">
                   <h4 className="text-xs font-heading font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">{tool.tool_description}</h4>
                   <div className="flex gap-1 flex-wrap justify-end">
                    {isLendingDelayed(tool.expected_return_date, tool.status) && (
                      <span className="text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase bg-red-600 text-white animate-pulse">
                        Atrasado
                      </span>
                    )}
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase ${tool.status === 'Pendente' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>
                      {tool.status}
                    </span>
                   </div>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-6 h-6 rounded-full bg-surface-low flex items-center justify-center text-tertiary">
                      <Users size={10} />
                   </div>
                   <p className="text-[10px] text-tertiary truncate">{tool.worker?.name || tool.borrower_name || 'Desconhecido'}</p>
                </div>
                <p className="text-[9px] text-tertiary mt-3 pt-3 border-t border-ghost-border/50">
                  Emprestado em {formatDate(tool.lend_date)}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ─── Linha do Tempo ────────────────────────────── */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-heading text-foreground">Linha do Tempo da Obra</h3>
          <Link href="/project/timeline" className="text-[10px] font-body text-primary hover:underline flex items-center gap-1 uppercase tracking-wider">
            Ver Cronograma <ChevronRight size={12} />
          </Link>
        </div>

        {/* Phase Status Legend */}
        <div className="flex items-center gap-5 text-[10px] text-tertiary font-body">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-green-400 inline-block" /> Concluída
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block animate-pulse" /> Em andamento
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-ghost-border inline-block" /> Planejada
          </span>
        </div>

        <div className="relative space-y-6 before:absolute before:left-4 before:-translate-x-px before:top-0 before:h-full before:w-0.5 before:bg-ghost-border">
          {[...phases].reverse().map((phase) => (
            <div key={phase.id} className="relative flex items-start gap-4 pl-12">
              <div className="absolute left-0 z-10">
                <PhaseIcon status={phase.status} />
              </div>
              <div className={`flex-1 p-5 rounded-architectural border shadow-sm hover:shadow-md transition-all ${
                phase.status === 'in_progress'
                  ? 'bg-primary/5 border-primary/20'
                  : phase.status === 'completed'
                  ? 'bg-surface-lowest border-ghost-border'
                  : 'bg-surface-low/30 border-ghost-border/40'
              }`}>
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <h4 className="font-heading text-foreground text-sm">{phase.title}</h4>
                  <time className="text-[10px] text-tertiary uppercase tracking-wider font-body whitespace-nowrap shrink-0">
                    {formatDate(phase.phase_date)}
                  </time>
                </div>
                {phase.description && (
                  <p className="text-sm font-body text-tertiary leading-relaxed">{phase.description}</p>
                )}
                {phase.status === 'in_progress' && (
                  <span className="inline-flex items-center gap-1 mt-2 text-[9px] font-bold uppercase tracking-widest text-primary">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse inline-block" />
                    Em execução
                  </span>
                )}
              </div>
            </div>
          ))}
          {phases.length === 0 && (
            <p className="text-center text-sm text-tertiary italic py-10 pl-12">Cronograma em elaboração...</p>
          )}
        </div>
      </section>

    </div>
  );
}
