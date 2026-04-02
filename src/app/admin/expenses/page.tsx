"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Plus, CheckCircle2 } from 'lucide-react';
import { ExpenseWithAttachments } from '@/lib/types';
import { useSearchParams, useRouter } from 'next/navigation';
import { ExpenseList } from '@/components/ExpenseList';
import { ExpenseForm } from '@/components/ExpenseForm';

export default function AdminExpensesPage() {
  const [expenses, setExpenses] = useState<ExpenseWithAttachments[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showForm, setShowForm] = useState(searchParams.get('new') === 'true');
  const [editingExpense, setEditingExpense] = useState<ExpenseWithAttachments | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchExpenses = useCallback(async () => {
    try {
      const res = await fetch('/api/expenses');
      if (res.ok) {
        const data = await res.json();
        setExpenses(data);
      }
    } catch (error) {
      console.error('Failed to fetch expenses', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // Sync sidebar navigation / query params with local state
  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setShowForm(true);
      setEditingExpense(null);
    }
  }, [searchParams]);

  const handleSubmit = async (payload: any) => {
    setSubmitting(true);
    
    try {
      let res;
      if (editingExpense) {
        res = await fetch(`/api/expenses/${editingExpense.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/expenses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao salvar despesa');
      }

      showToast(editingExpense ? 'Despesa atualizada com sucesso!' : 'Nova despesa cadastrada!');
      setShowForm(false);
      setEditingExpense(null);
      
      // Clean up the URL if we were on ?new=true
      if (searchParams.get('new')) {
        router.push('/admin/expenses');
      }
      
      await fetchExpenses();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (expense: ExpenseWithAttachments) => {
    setEditingExpense(expense);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta despesa?')) return;
    
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao excluir');
      }
      showToast('Despesa removida.');
      setExpenses(expenses.filter(e => e.id !== id));
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingExpense(null);
    if (searchParams.get('new')) {
      router.push('/admin/expenses');
    }
  };

  if (loading) {
    return <div className="animate-pulse flex space-x-4">Carregando dados...</div>;
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-secondary text-white px-5 py-3 rounded-architectural shadow-lg flex items-center gap-2 text-sm font-body animate-[slideIn_0.3s_ease-out]">
          <CheckCircle2 size={18} />
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-heading text-foreground">
            {showForm 
              ? (editingExpense ? 'Editar Registro' : 'Nova Inclusão') 
              : 'Gerenciar Despesas'}
          </h2>
          <p className="text-sm text-tertiary font-body mt-1">
            {showForm 
              ? 'Preencha os dados abaixo com atenção.' 
              : 'Cadastre, edite ou remova lançamentos financeiros da obra.'}
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-architectural text-sm font-heading hover:bg-primary-container transition-all shadow-sm active:scale-95"
          >
            <Plus size={16} /> Nova Despesa
          </button>
        )}
      </div>

      {showForm && (
        <ExpenseForm
          initialData={editingExpense}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitting={submitting}
        />
      )}

      {/* Expenses List Component extracted - Only show when NOT in form mode */}
      {!showForm && (
        <div className="bg-surface-lowest rounded-architectural border border-ghost-border overflow-hidden shadow-sm">
          <div className="px-6 py-4 bg-surface-low/30 border-b border-ghost-border">
            <p className="text-xs text-tertiary font-body">{expenses.length} despesas cadastradas</p>
          </div>
          <ExpenseList 
            expenses={expenses} 
            variant="admin-cards" 
            onEdit={handleEdit} 
            onDelete={handleDelete} 
          />
        </div>
      )}
    </div>
  );
}
