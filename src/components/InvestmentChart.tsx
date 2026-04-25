"use client";

import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { formatDate, formatCurrency } from '@/lib/utils';
import { ExpenseWithAttachments, Profile } from '@/lib/types';
import { Advance } from '@/lib/finance';

interface InvestmentChartProps {
  expenses: ExpenseWithAttachments[];
  socios: Profile[];
  advances: Advance[];
  title?: string;
}

const COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#8B5CF6', // Violet
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#06B6D4', // Cyan
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface-lowest p-4 border border-ghost-border rounded-architectural shadow-xl">
        <p className="text-[10px] font-bold text-tertiary uppercase tracking-wider mb-2">
          {formatDate(label)}
        </p>
        <div className="space-y-1.5">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
                <span className="text-xs font-body text-foreground">{entry.name}</span>
              </div>
              <span className="text-xs font-heading text-foreground font-bold">
                {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export function InvestmentChart({ expenses, socios, advances, title }: InvestmentChartProps) {
  const chartData = useMemo(() => {
    if (socios.length === 0) return [];

    // Get all relevant dates
    const datesSet = new Set<string>();
    expenses.forEach(exp => datesSet.add(exp.date));
    advances.forEach(adv => datesSet.add(adv.date));
    
    const sortedDates = Array.from(datesSet).sort();
    
    // Initialize cumulative totals map
    const cumulativeTotals: Record<string, number> = {};
    socios.forEach(s => {
      cumulativeTotals[s.id] = 0;
    });

    const dataPoints = sortedDates.map(date => {
      // 1. Add advances for this date
      advances
        .filter(adv => adv.date === date)
        .forEach(adv => {
          if (cumulativeTotals[adv.user_id] !== undefined) {
            cumulativeTotals[adv.user_id] += Number(adv.amount);
          }
        });

      // 2. Add direct payments for this date
      expenses
        .filter(exp => exp.date === date)
        .forEach(exp => {
          if (exp.expense_participants) {
            exp.expense_participants.forEach(p => {
              if (cumulativeTotals[p.user_id] !== undefined) {
                cumulativeTotals[p.user_id] += Number(p.amount_paid);
              }
            });
          }
        });

      // Create data point
      const point: Record<string, any> = { date };
      socios.forEach(s => {
        point[s.full_name || s.id] = cumulativeTotals[s.id];
      });
      return point;
    });

    return dataPoints;
  }, [expenses, socios, advances]);

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-surface-low/30 rounded-architectural border border-dashed border-ghost-border">
        <p className="text-sm text-tertiary font-body">Nenhum dado disponível para o gráfico</p>
      </div>
    );
  }

  return (
    <div className="bg-surface-lowest p-6 rounded-architectural border border-ghost-border shadow-sm space-y-4">
      {title && <h3 className="text-base font-heading text-foreground">{title}</h3>}
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.5} />
            <XAxis 
              dataKey="date" 
              tickFormatter={(date) => {
                const d = new Date(date + 'T12:00:00');
                if (isNaN(d.getTime())) return date;
                return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
              }}
              tick={{ fontSize: 10, fill: '#6B7280' }}
              axisLine={false}
              tickLine={false}
              minTickGap={30}
            />
            <YAxis 
              tickFormatter={(value) => `R$ ${value >= 1000 ? (value/1000).toFixed(0) + 'k' : value}`}
              tick={{ fontSize: 10, fill: '#6B7280' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="top" 
              align="right" 
              iconType="circle"
              wrapperStyle={{ fontSize: '10px', fontFamily: 'var(--font-heading)', paddingBottom: '20px' }}
            />
            {socios.map((s, idx) => (
              <Line 
                key={s.id}
                type="monotone"
                dataKey={s.full_name || s.id}
                stroke={COLORS[idx % COLORS.length]}
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, strokeWidth: 0 }}
                animationDuration={1500}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
