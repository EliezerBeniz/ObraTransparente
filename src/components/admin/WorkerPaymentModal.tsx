"use client";

import React, { useState, useEffect } from 'react';
import { Worker, Profile } from '@/lib/types';
import { X, Save, RotateCcw, Loader2, DollarSign, Calendar, FileText, Users, UserPlus, Trash2, Equal } from 'lucide-react';

interface WorkerPaymentModalProps {
  worker: Worker;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
}

export function WorkerPaymentModal({ worker, onSubmit, onCancel, submitting }: WorkerPaymentModalProps) {
  const [formData, setFormData] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    payment_type: 'Diária' as 'Diária' | 'Empreitada' | 'Outro',
    description: '',
    status: 'Pago' as 'Pendente' | 'Pago',
  });

  const [socios, setSocios] = useState<Profile[]>([]);
  const [participants, setParticipants] = useState<{ user_id: string, amount_paid: number }[]>([]);

  useEffect(() => {
    fetch('/api/socios')
      .then(res => res.json())
      .then(data => {
        const filtered = data.filter((s: any) => {
          const role = Array.isArray(s.user_roles) ? s.user_roles[0]?.role : s.user_roles?.role;
          return role !== 'convidado';
        });
        setSocios(filtered);
      })
      .catch(err => console.error('Error fetching socios:', err));
  }, []);

  const addParticipant = () => {
    if (socios.length > 0) {
      setParticipants([...participants, { user_id: socios[0].id, amount_paid: 0 }]);
    }
  };

  const removeParticipant = (index: number) => {
    setParticipants(participants.filter((_, i) => i !== index));
  };

  const updateParticipant = (index: number, field: string, value: any) => {
    const newParticipants = [...participants];
    newParticipants[index] = { ...newParticipants[index], [field]: value };
    setParticipants(newParticipants);
  };

  const splitEqually = () => {
    const total = parseFloat(formData.amount) || 0;
    if (participants.length === 0 || total === 0) return;
    
    const equalShare = parseFloat((total / participants.length).toFixed(2));
    const newParticipants = participants.map((p, i) => ({
      ...p,
      amount_paid: i === participants.length - 1 
        ? parseFloat((total - (equalShare * (participants.length - 1))).toFixed(2))
        : equalShare
    }));
    setParticipants(newParticipants);
  };

  const totalPaid = participants.reduce((acc, p) => acc + (p.amount_paid || 0), 0);
  const isValidSplit = Math.abs(totalPaid - (parseFloat(formData.amount) || 0)) < 0.01 && participants.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidSplit) return;

    const payload = {
      worker_id: worker.id,
      worker_name: worker.name,
      amount: parseFloat(formData.amount),
      date: formData.date,
      payment_type: formData.payment_type,
      description: formData.description,
      status: formData.status,
      participants: participants.map(p => ({
        user_id: p.user_id,
        amount_paid: p.amount_paid
      }))
    };
    await onSubmit(payload);
  };

  return (
    <div className="bg-surface-lowest rounded-architectural border border-ghost-border p-8 shadow-2xl animate-[fadeIn_0.3s_ease-out] max-w-2xl w-full">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-ghost-border">
        <div>
          <h3 className="text-xl font-heading text-foreground">Registrar Pagamento</h3>
          <p className="text-sm text-tertiary">Profissional: <span className="text-primary font-bold">{worker.name}</span></p>
        </div>
        <button onClick={onCancel} className="p-2 text-tertiary hover:text-foreground transition-all">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-tertiary">Valor (R$)</label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                className="w-full pl-10 pr-4 py-3 bg-surface-low rounded-architectural text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-body"
              />
              <DollarSign size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-tertiary/50" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-tertiary">Data</label>
            <div className="relative">
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-surface-low rounded-architectural text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-body"
              />
              <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-tertiary/50" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-tertiary">Tipo de Trabalho</label>
            <select
              value={formData.payment_type}
              onChange={(e) => setFormData({ ...formData, payment_type: e.target.value as any })}
              className="w-full px-4 py-3 bg-surface-low rounded-architectural text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-body appearance-none cursor-pointer"
            >
              <option value="Diária">Diária</option>
              <option value="Empreitada">Empreitada</option>
              <option value="Outro">Outro</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-tertiary">Descrição / OBS</label>
            <div className="relative">
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ex: Pagamento da semana"
                className="w-full pl-10 pr-4 py-3 bg-surface-low rounded-architectural text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-body"
              />
              <FileText size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-tertiary/50" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-tertiary">Status do Pagamento</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className={`w-full px-4 py-3 rounded-architectural text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-body appearance-none cursor-pointer ${
                formData.status === 'Pago' ? 'bg-primary/5 text-primary' : 'bg-red-50 text-red-600'
              }`}
            >
              <option value="Pago">Pago ✅</option>
              <option value="Pendente">Pendente ⏳</option>
            </select>
          </div>
        </div>

        {/* Participant Splitting logic */}
        <div className="pt-6 border-t border-ghost-border space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-[10px] uppercase tracking-widest text-tertiary font-bold flex items-center gap-2">
              <Users size={14} /> Quem pagou? (Sócios)
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={splitEqually}
                className="flex items-center gap-1 px-3 py-1.5 bg-surface-low text-tertiary hover:text-foreground rounded-architectural text-[10px] transition-all uppercase tracking-wider font-bold"
              >
                <Equal size={12} /> Sugerir Divisão
              </button>
              <button
                type="button"
                onClick={addParticipant}
                disabled={socios.length === 0}
                className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-architectural text-[10px] transition-all uppercase tracking-wider font-bold"
              >
                <UserPlus size={12} /> Adicionar
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {participants.map((p, idx) => (
              <div key={idx} className="flex gap-3 items-center animate-[slideIn_0.2s_ease-out]">
                <select
                  value={p.user_id}
                  onChange={(e) => updateParticipant(idx, 'user_id', e.target.value)}
                  className="flex-grow bg-surface-low rounded-architectural px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  {socios.map(s => (
                    <option key={s.id} value={s.id}>{s.full_name}</option>
                  ))}
                </select>
                <input
                  type="number"
                  step="0.01"
                  value={p.amount_paid}
                  onChange={(e) => updateParticipant(idx, 'amount_paid', parseFloat(e.target.value) || 0)}
                  className="w-32 bg-surface-low rounded-architectural px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="0.00"
                />
                <button
                  type="button"
                  onClick={() => removeParticipant(idx)}
                  className="p-3 text-red-400 hover:bg-hover-surface transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            
            {participants.length === 0 && (
              <p className="text-xs text-center text-tertiary py-4 italic border border-dashed border-ghost-border rounded-architectural">
                Nenhum sócio adicionado.
              </p>
            )}

            <div className="flex justify-between items-center p-3 bg-surface-low/30 rounded-architectural border border-ghost-border">
              <span className="text-xs text-tertiary">Total informado:</span>
              <span className={`text-sm font-bold ${isValidSplit ? 'text-primary' : 'text-red-500'}`}>
                R$ {totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-ghost-border">
          <button type="button" onClick={onCancel} className="px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-tertiary hover:text-foreground">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting || !isValidSplit}
            className="flex items-center gap-2 px-8 py-3 bg-primary text-white text-xs font-bold uppercase tracking-widest rounded-architectural hover:bg-primary-container transition-all shadow-lg shadow-primary/25 disabled:opacity-50"
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Confirmar Pagamento
          </button>
        </div>
      </form>
    </div>
  );
}
