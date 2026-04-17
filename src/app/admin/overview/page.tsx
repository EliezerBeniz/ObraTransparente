"use client";

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  TrendingUp, TrendingDown, Clock, CheckCircle2, Wallet,
  Users, Hammer, Store, ArrowRightLeft, ChevronRight,
  AlertTriangle, BarChart3, PieChart, Activity
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface Kpis {
  total_pago: number; total_pendente: number; total_advances: number;
  count_pago: number; count_pendente: number;
  active_workers: number; supplier_count: number;
}
interface MonthlyRow { month_year: string; month_label: string; total_pago: number; total_pendente: number; }
interface CategoryRow { category: string; total_pago: number; total_pendente: number; }
interface AdvanceRow  { user_id: string; full_name: string; month_year: string; month_label: string; monthly: number; cumulative: number; }
interface TopRow      { id: string; title: string; category: string; amount: number; date: string; }
interface Settings    { total_budget: number; project_name: string; completion_percentage: number; current_stage: string; }

const CATEGORY_COLORS: Record<string, string> = {
  'Material':    '#3B82F6',
  'Mão de Obra': '#10B981',
  'Projetos':    '#8B5CF6',
  'Legal':       '#F59E0B',
  'Outros':      '#6B7280',
};

const PARTNER_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

// ─────────────────────────────────────────────
// Donut Chart (pure SVG)
// ─────────────────────────────────────────────
function DonutChart({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const total = segments.reduce((s, r) => s + r.value, 0);
  if (total === 0) return (
    <div className="flex items-center justify-center h-48 text-tertiary text-sm">Sem dados no período</div>
  );

  const size = 180; const cx = 90; const cy = 90; const r = 70; const inner = 44;
  const circumference = 2 * Math.PI * r;

  let offset = 0;
  const slices = segments.map((seg, i) => {
    const pct = seg.value / total;
    const dash = pct * circumference;
    const gap = circumference - dash;
    const slice = { ...seg, pct, dash, gap, offset, index: i };
    offset += dash;
    return slice;
  });

  const hov = hovered !== null ? segments[hovered] : null;

  return (
    <div className="flex flex-col md:flex-row items-center gap-6">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          {slices.map((s, i) => (
            <circle
              key={i}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={hovered === i ? 20 : 16}
              strokeDasharray={`${s.dash} ${s.gap}`}
              strokeDashoffset={-s.offset + circumference * 0.25}
              style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px`, transition: 'stroke-width 0.2s, opacity 0.2s', opacity: hovered !== null && hovered !== i ? 0.4 : 1, cursor: 'pointer' }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            />
          ))}
          <circle cx={cx} cy={cy} r={inner} fill="white" />
          <text x={cx} y={cy - 8} textAnchor="middle" className="text-xs" style={{ fontSize: 11, fill: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
            {hov ? hov.label.split(' ')[0] : 'Total'}
          </text>
          <text x={cx} y={cy + 12} textAnchor="middle" style={{ fontSize: 13, fill: '#1F2937', fontWeight: 700 }}>
            {hov ? `${(hov.value / total * 100).toFixed(0)}%` : '100%'}
          </text>
        </svg>
      </div>
      <div className="space-y-2 flex-1 min-w-0">
        {slices.map((s, i) => (
          <div key={i}
            className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg transition-all cursor-default"
            style={{ background: hovered === i ? `${s.color}18` : 'transparent' }}
            onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
              <span className="text-xs font-body text-tertiary truncate">{s.label}</span>
            </div>
            <span className="text-xs font-heading text-foreground tabular-nums whitespace-nowrap">
              {formatCurrency(s.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Monthly Bar Chart (CSS + absolute positioning)
// ─────────────────────────────────────────────
function MonthlyBarsChart({ data }: { data: MonthlyRow[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  if (data.length === 0) return (
    <div className="flex items-center justify-center h-48 text-tertiary text-sm">Sem dados no período</div>
  );
  const maxVal = Math.max(...data.map(d => d.total_pago + d.total_pendente), 1);

  return (
    <div className="space-y-3">
      <div className="flex items-end gap-2 h-44 w-full">
        {data.map((d, i) => {
          const paidH  = (d.total_pago / maxVal) * 100;
          const pendH  = (d.total_pendente / maxVal) * 100;
          const isHov  = hovered === i;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 group"
              onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
            >
              {isHov && (
                <div className="absolute z-20 bg-surface-lowest border border-ghost-border shadow-lg rounded-architectural px-3 py-2 text-xs font-body pointer-events-none whitespace-nowrap -translate-y-full -translate-x-1/2 left-1/2 top-0">
                  <p className="font-bold text-foreground mb-1">{d.month_label}</p>
                  <p className="text-[10px] text-green-600">Pago: {formatCurrency(d.total_pago)}</p>
                  {d.total_pendente > 0 && <p className="text-[10px] text-amber-500">Pendente: {formatCurrency(d.total_pendente)}</p>}
                </div>
              )}
              <div className="relative w-full flex flex-col justify-end" style={{ height: 160 }}>
                {d.total_pendente > 0 && (
                  <div className="w-full rounded-t-sm transition-all"
                    style={{ height: `${pendH}%`, background: '#F59E0B', opacity: isHov ? 1 : 0.7 }}
                  />
                )}
                <div className="w-full transition-all"
                  style={{ height: `${paidH}%`, background: '#10B981', borderRadius: d.total_pendente > 0 ? '0' : '4px 4px 0 0', opacity: isHov ? 1 : 0.85 }}
                />
              </div>
              <span className="text-[9px] text-tertiary font-body truncate w-full text-center">{d.month_label}</span>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-center gap-6 text-[10px] font-body text-tertiary">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />Pago</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />Pendente</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Advances Line Chart (pure SVG)
// ─────────────────────────────────────────────
function AdvancesLineChart({ data }: { data: AdvanceRow[] }) {
  const [hovered, setHovered] = useState<{ month: string; name: string } | null>(null);
  if (data.length === 0) return (
    <div className="flex items-center justify-center h-48 text-tertiary text-sm">Sem aportes no período</div>
  );

  const partners = Array.from(new Set(data.map(d => d.full_name)));
  const months   = Array.from(new Set(data.map(d => d.month_year))).sort();

  // Build a map: partner → [cumulative per month]
  const partnerMap: Record<string, Record<string, number>> = {};
  data.forEach(d => {
    if (!partnerMap[d.full_name]) partnerMap[d.full_name] = {};
    partnerMap[d.full_name][d.month_year] = d.cumulative;
  });

  const maxCumul = Math.max(...data.map(d => d.cumulative), 1);

  const w = 500; const h = 180; const padL = 10; const padR = 10; const padT = 12; const padB = 30;
  const chartW = w - padL - padR;
  const chartH = h - padT - padB;

  const getX = (mIdx: number) => padL + (mIdx / Math.max(months.length - 1, 1)) * chartW;
  const getY = (val: number) => padT + chartH - (val / maxCumul) * chartH;

  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full overflow-visible" style={{ height: h }}>
        {/* Grid lines */}
        {[0.25, 0.5, 0.75, 1].map(pct => (
          <line key={pct}
            x1={padL} y1={padT + chartH * (1 - pct)}
            x2={w - padR} y2={padT + chartH * (1 - pct)}
            stroke="#E5E7EB" strokeWidth={0.5} strokeDasharray="4 4"
          />
        ))}

        {/* Lines per partner */}
        {partners.map((name, pi) => {
          const color = PARTNER_COLORS[pi % PARTNER_COLORS.length];
          const points = months.map((m, mi) => {
            const val = partnerMap[name]?.[m] ?? null;
            return val !== null ? `${getX(mi)},${getY(val)}` : null;
          }).filter(Boolean);

          return (
            <g key={name}>
              <polyline
                points={points.join(' ')}
                fill="none" stroke={color} strokeWidth={2.5}
                strokeLinecap="round" strokeLinejoin="round"
                style={{ transition: 'opacity 0.2s', opacity: hovered && hovered.name !== name ? 0.2 : 1 }}
              />
              {months.map((m, mi) => {
                const val = partnerMap[name]?.[m];
                if (val === undefined) return null;
                const isHov = hovered?.month === m && hovered?.name === name;
                return (
                  <g key={m}>
                    <circle
                      cx={getX(mi)} cy={getY(val)} r={isHov ? 6 : 4}
                      fill={color} stroke="white" strokeWidth={2}
                      style={{ cursor: 'pointer', transition: 'r 0.15s' }}
                      onMouseEnter={() => setHovered({ month: m, name })}
                      onMouseLeave={() => setHovered(null)}
                    />
                    {isHov && (
                      <foreignObject x={getX(mi) - 50} y={getY(val) - 52} width={100} height={48}>
                        <div className="bg-surface-lowest border border-ghost-border rounded-architectural px-2 py-1.5 shadow text-center">
                          <p className="text-[9px] font-bold text-foreground">{name.split(' ')[0]}</p>
                          <p className="text-[10px] text-primary font-heading">{formatCurrency(val)}</p>
                        </div>
                      </foreignObject>
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}

        {/* X-axis labels */}
        {months.map((m, mi) => (
          <text key={m} x={getX(mi)} y={h - 4} textAnchor="middle"
            style={{ fontSize: 9, fill: '#9CA3AF', fontFamily: 'inherit' }}
          >
            {data.find(d => d.month_year === m)?.month_label ?? m}
          </text>
        ))}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 justify-center">
        {partners.map((name, pi) => (
          <span key={name} className="flex items-center gap-1.5 text-[10px] font-body text-tertiary cursor-default"
            onMouseEnter={() => setHovered({ month: '', name })} onMouseLeave={() => setHovered(null)}
          >
            <span className="w-3 h-1.5 rounded-full inline-block" style={{ background: PARTNER_COLORS[pi % PARTNER_COLORS.length] }} />
            {name.split(' ')[0]}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Big Number Card
// ─────────────────────────────────────────────
function KpiCard({ label, value, sub, icon: Icon, color, trend }: {
  label: string; value: string; sub?: string;
  icon: any; color: string; trend?: 'up' | 'down' | 'neutral';
}) {
  return (
    <div className={`bg-surface-lowest p-6 rounded-architectural border border-ghost-border shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 group`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-architectural bg-surface-low transition-colors group-hover:text-white group-hover:bg-primary`} style={{ color }}>
          <Icon size={20} />
        </div>
        {trend === 'up'   && <TrendingUp  size={14} className="text-green-500 mt-1" />}
        {trend === 'down' && <TrendingDown size={14} className="text-red-400 mt-1" />}
      </div>
      <p className="text-[9px] font-heading uppercase tracking-widest text-tertiary mb-1">{label}</p>
      <h3 className="text-xl font-heading text-foreground tabular-nums leading-tight">{value}</h3>
      {sub && <p className="text-[10px] text-tertiary mt-1 font-body">{sub}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
export default function AdminOverviewPage() {
  // Filter state
  const [datePreset, setDatePreset] = useState('');
  const [startDate, setStartDate]   = useState('');
  const [endDate, setEndDate]       = useState('');
  const [activeTab, setActiveTab]   = useState<'categories' | 'monthly' | 'advances'>('monthly');

  // Data state
  const [data, setData]     = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  const buildUrl = useCallback(() => {
    let start = startDate;
    let end   = endDate;
    if (datePreset && datePreset !== 'custom') {
      const days = parseInt(datePreset, 10);
      const d = new Date();
      d.setDate(d.getDate() - days);
      start = d.toISOString().split('T')[0];
      end   = new Date().toISOString().split('T')[0];
    }
    const params = new URLSearchParams();
    if (start) params.set('start', start);
    if (end)   params.set('end', end);
    return `/api/dashboard?${params.toString()}`;
  }, [datePreset, startDate, endDate]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(buildUrl());
      if (!res.ok) throw new Error('Erro ao carregar dados');
      setData(await res.json());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [buildUrl]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Derived values
  const kpis: Kpis       = data?.kpis     ?? null;
  const monthly: MonthlyRow[]  = data?.monthly  ?? [];
  const category: CategoryRow[] = data?.category ?? [];
  const advances: AdvanceRow[]  = data?.advances ?? [];
  const top: TopRow[]           = data?.top      ?? [];
  const settings: Settings     = data?.settings  ?? null;

  const totalPeriod = kpis ? kpis.total_pago + kpis.total_pendente : 0;
  const topMax = top.length > 0 ? top[0].amount : 1;

  const donutSegments = useMemo(() =>
    category.map(c => ({
      label: c.category,
      value: c.total_pago,
      color: CATEGORY_COLORS[c.category] ?? '#6B7280',
    })).filter(s => s.value > 0),
  [category]);

  const radialPct = settings?.completion_percentage ?? 0;

  if (error) return (
    <div className="flex items-center gap-3 p-6 bg-red-50 border border-red-100 rounded-architectural text-red-600 text-sm">
      <AlertTriangle size={18} /> {error}
    </div>
  );

  return (
    <div className="space-y-8 max-w-7xl">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-heading text-foreground">
            {settings?.project_name ?? 'Visão Geral'}
          </h2>
          <p className="text-sm text-tertiary font-body mt-1">
            {settings?.current_stage ?? 'Painel de controle gerencial da obra'}
          </p>
        </div>

        {/* Radial Progress */}
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 shrink-0">
            <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
              <circle cx="18" cy="18" r="15" fill="none" stroke="#E5E7EB" strokeWidth="3" />
              <circle cx="18" cy="18" r="15" fill="none" stroke="#3B82F6" strokeWidth="3"
                strokeDasharray={`${radialPct * 0.942} 100`} strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 1s ease-out' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[11px] font-heading text-primary">{radialPct}%</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] text-tertiary font-heading uppercase tracking-wider">Conclusão</p>
            <p className="text-sm font-heading text-foreground">da obra</p>
          </div>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="bg-surface-lowest border border-ghost-border rounded-architectural px-5 py-4 flex flex-wrap items-center gap-4 shadow-sm">
        <div className="flex items-center gap-2 text-[10px] uppercase font-heading text-tertiary tracking-wider">
          <BarChart3 size={14} /> Período
        </div>
        <select
          value={datePreset} onChange={e => setDatePreset(e.target.value)}
          className="bg-surface-low border-none py-2 pl-3 pr-8 text-xs font-body text-foreground rounded-architectural focus:ring-2 focus:ring-primary/10 outline-none appearance-none"
          style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23a1a1aa' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right .5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em' }}
        >
          <option value="">Todo o período</option>
          <option value="30">Últimos 30 dias</option>
          <option value="60">Últimos 60 dias</option>
          <option value="90">Últimos 90 dias</option>
          <option value="180">Últimos 6 meses</option>
          <option value="365">Último ano</option>
          <option value="custom">Personalizado...</option>
        </select>

        {datePreset === 'custom' && (
          <>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-tertiary font-bold uppercase">De</span>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                className="bg-surface-low border-none px-3 py-2 text-xs font-body text-foreground rounded-architectural focus:ring-2 focus:ring-primary/10 outline-none" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-tertiary font-bold uppercase">Até</span>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                className="bg-surface-low border-none px-3 py-2 text-xs font-body text-foreground rounded-architectural focus:ring-2 focus:ring-primary/10 outline-none" />
            </div>
          </>
        )}

        <div className="h-4 w-px bg-ghost-border hidden md:block" />
        {totalPeriod > 0 && (
          <span className="text-xs font-body text-tertiary">
            <span className="font-heading text-foreground">{formatCurrency(totalPeriod)}</span> no período selecionado
          </span>
        )}
      </div>

      {/* ── KPI Cards ── */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-surface-lowest h-28 rounded-architectural border border-ghost-border animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard label="Total Investido (Pago)" value={formatCurrency(kpis?.total_pago ?? 0)}
            sub={`${kpis?.count_pago ?? 0} despesas`} icon={CheckCircle2} color="#10B981" trend="neutral" />
          <KpiCard label="Pendente a Pagar" value={formatCurrency(kpis?.total_pendente ?? 0)}
            sub={`${kpis?.count_pendente ?? 0} despesas`} icon={Clock} color="#F59E0B" trend="neutral" />
          <KpiCard label="Total em Aportes" value={formatCurrency(kpis?.total_advances ?? 0)}
            sub="Depositado no caixa" icon={Wallet} color="#3B82F6" trend="neutral" />
          <KpiCard label="Saldo Budget" value={formatCurrency((settings?.total_budget ?? 0) - (kpis?.total_pago ?? 0))}
            sub={`de ${formatCurrency(settings?.total_budget ?? 0)}`} icon={TrendingUp} color="#6366F1" trend="neutral" />
          <KpiCard label="Pedreiros Ativos" value={String(kpis?.active_workers ?? 0)}
            sub="na equipe atual" icon={Hammer} color="#8B5CF6" />
          <KpiCard label="Fornecedores" value={String(kpis?.supplier_count ?? 0)}
            sub="cadastrados" icon={Store} color="#EC4899" />
          <div className="col-span-2 bg-surface-lowest p-5 rounded-architectural border border-ghost-border shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
            <div>
              <p className="text-[9px] font-heading uppercase tracking-widest text-tertiary mb-1">Acerto de Contas</p>
              <p className="text-sm font-heading text-foreground">Balanço entre sócios</p>
              <p className="text-[11px] text-tertiary mt-1 font-body">Com base nos gastos pagos e aportes</p>
            </div>
            <Link href="/dashboard/balanco"
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-architectural text-xs font-heading hover:bg-primary/90 transition-all shrink-0">
              Ver Balanço <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      )}

      {/* ── Charts Section ── */}
      <div className="bg-surface-lowest rounded-architectural border border-ghost-border shadow-sm overflow-hidden">
        {/* Tab Header */}
        <div className="flex border-b border-ghost-border">
          {[
            { id: 'monthly',    label: 'Evolução Mensal',       icon: BarChart3 },
            { id: 'categories', label: 'Por Categoria',         icon: PieChart },
            { id: 'advances',   label: 'Aportes por Sócio',     icon: Activity },
          ].map(tab => (
            <button key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-3.5 text-xs font-heading transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-tertiary hover:text-foreground'
              }`}
            >
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {loading ? (
            <div className="h-56 animate-pulse bg-surface-low rounded-architectural" />
          ) : activeTab === 'monthly' ? (
            <MonthlyBarsChart data={monthly} />
          ) : activeTab === 'categories' ? (
            <DonutChart segments={donutSegments} />
          ) : (
            <AdvancesLineChart data={advances} />
          )}
        </div>
      </div>

      {/* ── Bottom Grid: Top 5 + Quick Links ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Top 5 Expenses */}
        <div className="lg:col-span-3 bg-surface-lowest rounded-architectural border border-ghost-border shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-base text-foreground">Top 5 Maiores Despesas Pagas</h3>
            <Link href="/admin/expenses" className="text-[10px] font-body text-primary hover:underline uppercase tracking-wider flex items-center gap-1">
              Ver Todas <ChevronRight size={12} />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-10 animate-pulse bg-surface-low rounded-architectural" />)}</div>
          ) : top.length === 0 ? (
            <p className="text-sm text-tertiary text-center py-8">Sem despesas pagas no período</p>
          ) : (
            <div className="space-y-3">
              {top.map((t, i) => (
                <div key={t.id} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-body text-foreground truncate max-w-[60%] flex items-center gap-2">
                      <span className="text-[9px] font-heading text-tertiary w-4">#{i + 1}</span>
                      {t.title}
                    </span>
                    <span className="font-heading text-foreground tabular-nums">{formatCurrency(t.amount)}</span>
                  </div>
                  <div className="h-1.5 bg-surface-low rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${(t.amount / topMax) * 100}%`, background: CATEGORY_COLORS[t.category] ?? '#6B7280' }}
                    />
                  </div>
                  <span className="text-[9px] text-tertiary font-body">{t.category}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Nav */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-heading text-base text-foreground">Acesso Rápido</h3>
          {[
            { href: '/admin/expenses',      icon: CheckCircle2,    label: 'Gerenciar Despesas',   color: '#10B981' },
            { href: '/admin/adiantamentos', icon: Wallet,          label: 'Caixa da Obra',        color: '#3B82F6' },
            { href: '/admin/pedreiros',     icon: Hammer,          label: 'Equipe de Obra',       color: '#8B5CF6' },
            { href: '/admin/compras',       icon: Store,           label: 'Lista de Compras',     color: '#F59E0B' },
            { href: '/dashboard/balanco',   icon: ArrowRightLeft,  label: 'Balanço Financeiro',   color: '#6366F1' },
          ].map(link => (
            <Link key={link.href} href={link.href}
              className="flex items-center justify-between p-4 bg-surface-lowest rounded-architectural border border-ghost-border hover:shadow-md hover:-translate-y-0.5 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ background: `${link.color}15`, color: link.color }}>
                  <link.icon size={16} />
                </div>
                <span className="text-sm font-heading text-foreground">{link.label}</span>
              </div>
              <ChevronRight size={14} className="text-tertiary group-hover:text-primary transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
