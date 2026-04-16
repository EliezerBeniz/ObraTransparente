"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { ToolLending } from '@/lib/types';
import { ToolLendingList } from '@/components/admin/ToolLendingList';
import { ToolLendingForm } from '@/components/admin/ToolLendingForm';

export default function AdminToolsPage() {
  const [lendings, setLendings] = useState<ToolLending[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLending, setEditingLending] = useState<ToolLending | null>(null);
  const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchLendings = useCallback(async () => {
    try {
      const res = await fetch('/api/tool-lendings');
      if (res.ok) {
        const data = await res.json();
        setLendings(data);
      }
    } catch (error) {
      console.error('Failed to fetch tool lendings', error);
      showToast('Erro ao carregar empréstimos', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLendings();
  }, [fetchLendings]);

  const handleLendingSubmit = async (payload: Partial<ToolLending>) => {
    setSubmitting(true);
    try {
      let res;
      if (editingLending) {
        res = await fetch(`/api/tool-lendings/${editingLending.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/tool-lendings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao salvar empréstimo');
      }

      showToast(editingLending ? 'Empréstimo atualizado!' : 'Empréstimo registrado!');
      setShowForm(false);
      setEditingLending(null);
      await fetchLendings();
    } catch (error: any) {
      showToast(error.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/tool-lendings/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Erro ao excluir empréstimo');

      showToast('Empréstimo excluído com sucesso.');
      await fetchLendings();
    } catch (error: any) {
      showToast(error.message, 'error');
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] px-5 py-3 rounded-architectural shadow-lg flex items-center gap-2 text-sm font-body animate-[slideIn_0.3s_ease-out] ${toast.type === 'success' ? 'bg-primary text-white' : 'bg-red-500 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {toast.msg}
        </div>
      )}

      {/* Hero Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-heading text-foreground">Controle de Ferramentas</h2>
          <p className="text-sm text-tertiary font-body mt-1">
            Gerencie o empréstimo e devolução de equipamentos da obra.
          </p>
        </div>
      </div>

      {showForm ? (
        <ToolLendingForm
          initialData={editingLending}
          onSubmit={handleLendingSubmit}
          onCancel={() => { setShowForm(false); setEditingLending(null); }}
          submitting={submitting}
        />
      ) : (
        <ToolLendingList 
          lendings={lendings}
          onAdd={() => setShowForm(true)}
          onEdit={(l) => { setEditingLending(l); setShowForm(true); }}
          onDelete={handleDelete}
          loading={loading}
        />
      )}
    </div>
  );
}
