'use client';

import React, { useState, useEffect, useCallback } from 'react';
import PageContainer from '@/components/PageContainer';
import { AdvanceModal } from '@/components/admin/AdvanceModal';
import { Profile } from '@/lib/types';
import {
  Wallet, TrendingUp, TrendingDown, AlertTriangle,
  Plus, Trash2, ArrowUpCircle, ArrowDownCircle,
  Pencil, Link
} from 'lucide-react';

interface Advance {
  id: string;
  user_id: string;
  amount: number;
  date: string;
  description: string | null;
  receipt_url: string | null;
  profiles: { full_name: string | null };
}

interface FundExpense {
  id: string;
  title: string;
  amount: number;
  date: string;
  category: string;
}

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

export default function AdminAdvancesPage() {
  const [advances, setAdvances] = useState<Advance[]>([]);
  const [fundExpenses, setFundExpenses] = useState<FundExpense[]>([]);
  const [socios, setSocios] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAdvance, setEditingAdvance] = useState<Advance | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [advRes, expRes, sociosRes] = await Promise.all([
        fetch('/api/advances'),
        fetch('/api/expenses'),
        fetch('/api/socios'),
      ]);

      const [advData, expData, sociosData] = await Promise.all([
        advRes.json(),
        expRes.json(),
        sociosRes.json(),
      ]);

      setAdvances(Array.isArray(advData) ? advData : []);

      // Filter only expenses paid from fund
      const filtered = Array.isArray(expData)
        ? expData.filter((e: any) => e.paid_from_fund === true && e.status === 'Pago')
        : [];
      setFundExpenses(filtered);

      // Filter out convidados
      const filtered_socios = Array.isArray(sociosData)
        ? sociosData.filter((s: any) => {
            const role = Array.isArray(s.user_roles) ? s.user_roles[0]?.role : s.user_roles?.role;
            return role !== 'convidado';
          })
        : [];
      setSocios(filtered_socios);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalDeposited = advances.reduce((sum, a) => sum + a.amount, 0);
  const totalConsumed = fundExpenses.reduce((sum, e) => sum + e.amount, 0);
  const balance = totalDeposited - totalConsumed;
  const isNegative = balance < 0;

  const handleSubmit = async (data: any) => {
    setSubmitting(true);
    try {
      const url = editingAdvance ? `/api/advances/${editingAdvance.id}` : '/api/advances';
      const method = editingAdvance ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Erro ao salvar.');
        return;
      }
      setShowForm(false);
      setEditingAdvance(null);
      await fetchData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (advance: Advance) => {
    setEditingAdvance(advance);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingAdvance(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Remover este aporte?')) return;
    await fetch(`/api/advances/${id}`, { method: 'DELETE' });
    await fetchData();
  };

  return (
    <PageContainer>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading text-foreground tracking-tight">Caixa da Obra</h1>
            <p className="text-tertiary font-body mt-1 text-sm">
              Aportes e consumos do fundo comum dos sócios
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-architectural transition-colors font-heading text-sm shadow-sm"
          >
            <Plus size={16} /> Novo Aporte
          </button>
        </div>

        {/* Negative Balance Alert */}
        {isNegative && (
          <div className="flex items-center gap-3 p-4 rounded-architectural bg-red-500/10 border border-red-500/30 text-red-500">
            <AlertTriangle size={20} className="shrink-0" />
            <div>
              <p className="font-heading text-sm">Saldo do Caixa negativo</p>
              <p className="text-xs font-body opacity-80">
                O Caixa está {fmt(balance)} — um novo aporte é necessário.
              </p>
            </div>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-surface-lowest border border-ghost-border rounded-architectural p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-full bg-green-500/10">
                <TrendingUp size={18} className="text-green-500" />
              </div>
              <span className="text-xs font-heading uppercase tracking-wide text-tertiary">Total Arrecadado</span>
            </div>
            <p className="text-2xl font-heading text-foreground">{fmt(totalDeposited)}</p>
            <p className="text-xs text-tertiary font-body mt-1">{advances.length} aportes</p>
          </div>

          <div className="bg-surface-lowest border border-ghost-border rounded-architectural p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-full bg-amber-500/10">
                <TrendingDown size={18} className="text-amber-500" />
              </div>
              <span className="text-xs font-heading uppercase tracking-wide text-tertiary">Total Consumido</span>
            </div>
            <p className="text-2xl font-heading text-foreground">{fmt(totalConsumed)}</p>
            <p className="text-xs text-tertiary font-body mt-1">{fundExpenses.length} despesas do caixa</p>
          </div>

          <div className={`border rounded-architectural p-6 ${
            isNegative
              ? 'bg-red-500/5 border-red-500/30'
              : 'bg-surface-lowest border-ghost-border'
          }`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-full ${isNegative ? 'bg-red-500/10' : 'bg-primary/10'}`}>
                <Wallet size={18} className={isNegative ? 'text-red-500' : 'text-primary'} />
              </div>
              <span className="text-xs font-heading uppercase tracking-wide text-tertiary">Saldo Atual</span>
              {isNegative && <AlertTriangle size={14} className="text-red-500 ml-auto" />}
            </div>
            <p className={`text-2xl font-heading ${isNegative ? 'text-red-500' : 'text-foreground'}`}>
              {fmt(balance)}
            </p>
          </div>
        </div>

        {/* Modal */}
        <AdvanceModal
          isOpen={showForm}
          onClose={handleCancel}
          socios={socios}
          onSubmit={handleSubmit}
          submitting={submitting}
          initialData={editingAdvance ? {
            user_id: editingAdvance.user_id,
            amount: editingAdvance.amount,
            date: editingAdvance.date,
            description: editingAdvance.description,
            receipt_url: editingAdvance.receipt_url
          } : undefined}
        />

        {loading ? (
          <div className="text-center py-12 text-tertiary animate-pulse font-body">Carregando...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Advances History */}
            <div>
              <h2 className="text-lg font-heading text-foreground mb-4 flex items-center gap-2">
                <ArrowUpCircle size={18} className="text-green-500" /> Histórico de Aportes
              </h2>
              {advances.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-ghost-border rounded-architectural">
                  <p className="text-tertiary font-body text-sm">Nenhum aporte registrado ainda.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {advances.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between p-4 bg-surface-lowest border border-ghost-border rounded-architectural hover:border-green-500/30 transition-colors group"
                    >
                      <div className="space-y-0.5">
                        <p className="font-heading text-sm text-foreground">
                          {a.profiles?.full_name || 'Sócio'}
                        </p>
                        <p className="text-xs text-tertiary font-body">
                          {new Date(a.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                          {a.description && ` · ${a.description}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {a.receipt_url && (
                          <a
                            href={a.receipt_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-secondary hover:text-secondary-container transition-all"
                            title="Ver comprovante"
                          >
                            <Link size={14} />
                          </a>
                        )}
                        <span className="font-heading text-green-600 text-sm">{fmt(a.amount)}</span>
                        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-all">
                          <button
                            onClick={() => handleEdit(a)}
                            className="p-1.5 text-tertiary hover:text-primary transition-all"
                            title="Editar aporte"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(a.id)}
                            className="p-1.5 text-tertiary hover:text-red-500 transition-all"
                            title="Remover aporte"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Consumption History */}
            <div>
              <h2 className="text-lg font-heading text-foreground mb-4 flex items-center gap-2">
                <ArrowDownCircle size={18} className="text-amber-500" /> Histórico de Consumos
              </h2>
              {fundExpenses.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-ghost-border rounded-architectural">
                  <p className="text-tertiary font-body text-sm">Nenhuma despesa paga pelo Caixa ainda.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {fundExpenses.map((e) => (
                    <div
                      key={e.id}
                      className="flex items-center justify-between p-4 bg-surface-lowest border border-ghost-border rounded-architectural hover:border-amber-500/30 transition-colors"
                    >
                      <div className="space-y-0.5">
                        <p className="font-heading text-sm text-foreground">{e.title}</p>
                        <p className="text-xs text-tertiary font-body">
                          {new Date(e.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                          {e.category && ` · ${e.category}`}
                        </p>
                      </div>
                      <span className="font-heading text-amber-600 text-sm">{fmt(e.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
