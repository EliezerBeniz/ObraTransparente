'use client';

import React, { useState } from 'react';
import { Profile } from '@/lib/types';
import { Save, X } from 'lucide-react';

interface AdvanceFormProps {
  socios: Profile[];
  onSubmit: (data: { user_id: string; amount: number; date: string; description: string }) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
}

export function AdvanceForm({ socios, onSubmit, onCancel, submitting }: AdvanceFormProps) {
  const [form, setForm] = useState({
    user_id: socios[0]?.id || '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      user_id: form.user_id,
      amount: parseFloat(form.amount),
      date: form.date,
      description: form.description,
    });
  };

  return (
    <div className="bg-surface-lowest border border-ghost-border rounded-architectural p-6 md:p-8 animate-[fadeIn_0.2s_ease-out]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-heading text-foreground">Novo Aporte ao Caixa</h3>
        <button onClick={onCancel} className="text-tertiary hover:text-foreground transition-colors">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-tertiary font-bold block">Sócio *</label>
            <select
              required
              value={form.user_id}
              onChange={(e) => setForm({ ...form, user_id: e.target.value })}
              className="w-full bg-surface-low border-none rounded-architectural px-4 py-3 text-sm font-body text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none"
            >
              {socios.map((s) => (
                <option key={s.id} value={s.id}>{s.full_name || 'Sem nome'}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-tertiary font-bold block">Data do Aporte *</label>
            <input
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full bg-surface-low border-none rounded-architectural px-4 py-3 text-sm font-body text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-tertiary font-bold block">Valor (R$) *</label>
            <input
              type="number"
              required
              step="0.01"
              min="0.01"
              placeholder="0,00"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="w-full bg-surface-low border-none rounded-architectural px-4 py-3 text-sm font-body text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-tertiary/40"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-tertiary font-bold block">Descrição (Opcional)</label>
            <input
              type="text"
              placeholder="Ex: Aporte inicial para fundação"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full bg-surface-low border-none rounded-architectural px-4 py-3 text-sm font-body text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-tertiary/40"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-ghost-border">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="px-5 py-2.5 text-sm font-body text-tertiary hover:text-foreground transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting || !form.user_id || !form.amount || !form.date}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-architectural text-sm font-heading hover:bg-primary/90 transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            <Save size={16} />
            {submitting ? 'Salvando...' : 'Registrar Aporte'}
          </button>
        </div>
      </form>
    </div>
  );
}
