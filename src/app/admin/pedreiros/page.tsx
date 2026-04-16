"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Worker } from '@/lib/types';
import { WorkerList } from '@/components/admin/WorkerList';
import { WorkerForm } from '@/components/admin/WorkerForm';
import { WorkerPaymentModal } from '@/components/admin/WorkerPaymentModal';

export default function AdminWorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [payingWorker, setPayingWorker] = useState<Worker | null>(null);
  const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchWorkers = useCallback(async () => {
    try {
      const res = await fetch('/api/workers');
      if (res.ok) {
        const data = await res.json();
        setWorkers(data);
      }
    } catch (error) {
      console.error('Failed to fetch workers', error);
      showToast('Erro ao carregar profissionais', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  const handleWorkerSubmit = async (payload: Partial<Worker>) => {
    setSubmitting(true);
    try {
      let res;
      if (editingWorker) {
        res = await fetch(`/api/workers/${editingWorker.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/workers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao salvar profissional');
      }

      showToast(editingWorker ? 'Dados atualizados!' : 'Profissional cadastrado!');
      setShowForm(false);
      setEditingWorker(null);
      await fetchWorkers();
    } catch (error: any) {
      showToast(error.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentSubmit = async (payload: any) => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/worker-payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao processar pagamento');
      }

      showToast('Pagamento registrado com sucesso!');
      setPayingWorker(null);
    } catch (error: any) {
      showToast(error.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (worker: Worker) => {
    try {
      const res = await fetch(`/api/workers/${worker.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !worker.is_active })
      });

      if (!res.ok) throw new Error('Erro ao alterar status');

      showToast(worker.is_active ? 'Profissional inativado.' : 'Profissional reativado!');
      await fetchWorkers();
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
          <h2 className="text-3xl font-heading text-foreground">Gestão de Pedreiros</h2>
          <p className="text-sm text-tertiary font-body mt-1">
            Controle de profissionais, especialidades e pagamentos integrados.
          </p>
        </div>
      </div>

      {showForm ? (
        <WorkerForm
          initialData={editingWorker}
          onSubmit={handleWorkerSubmit}
          onCancel={() => { setShowForm(false); setEditingWorker(null); }}
          submitting={submitting}
        />
      ) : (
        <WorkerList 
          workers={workers}
          onAdd={() => setShowForm(true)}
          onEdit={(w) => { setEditingWorker(w); setShowForm(true); }}
          onPay={(w) => setPayingWorker(w)}
          onToggleStatus={handleToggleStatus}
          loading={loading}
        />
      )}

      {/* Payment Modal Overlay */}
      {payingWorker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <WorkerPaymentModal
            worker={payingWorker}
            onSubmit={handlePaymentSubmit}
            onCancel={() => setPayingWorker(null)}
            submitting={submitting}
          />
        </div>
      )}
    </div>
  );
}
