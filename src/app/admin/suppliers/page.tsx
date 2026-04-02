"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Plus, CheckCircle2, Store, Search } from 'lucide-react';
import { Supplier } from '@/lib/types';
import { useSearchParams, useRouter } from 'next/navigation';
import { SupplierList } from '@/components/admin/SupplierList';
import { SupplierForm } from '@/components/admin/SupplierForm';

export default function AdminSuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showForm, setShowForm] = useState(searchParams.get('new') === 'true');
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchSuppliers = useCallback(async () => {
    try {
      const res = await fetch('/api/suppliers');
      if (res.ok) {
        const data = await res.json();
        setSuppliers(data);
      }
    } catch (error) {
      console.error('Failed to fetch suppliers', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setShowForm(true);
      setEditingSupplier(null);
    }
  }, [searchParams]);

  const handleSubmit = async (payload: Partial<Supplier>) => {
    setSubmitting(true);
    
    try {
      let res;
      if (editingSupplier) {
        res = await fetch(`/api/suppliers/${editingSupplier.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/suppliers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao salvar fornecedor');
      }

      showToast(editingSupplier ? 'Dados atualizados com sucesso!' : 'Novo fornecedor cadastrado!');
      setShowForm(false);
      setEditingSupplier(null);
      
      if (searchParams.get('new')) {
        router.push('/admin/suppliers');
      }
      
      await fetchSuppliers();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este fornecedor? Todos os dados históricos serão mantidos no banco mas ele não aparecerá mais na lista ativa.')) return;
    
    try {
      const res = await fetch(`/api/suppliers/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao excluir');
      }
      showToast('Fornecedor removido.');
      setSuppliers(suppliers.filter(s => s.id !== id));
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingSupplier(null);
    if (searchParams.get('new')) {
      router.push('/admin/suppliers');
    }
  };

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col gap-4 animate-pulse">
        <div className="h-8 w-48 bg-surface-low rounded-architectural"></div>
        <div className="h-4 w-64 bg-surface-low rounded-architectural mb-8"></div>
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-surface-low rounded-architectural"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-secondary text-white px-5 py-3 rounded-architectural shadow-lg flex items-center gap-2 text-sm font-body animate-[slideIn_0.3s_ease-out]">
          <CheckCircle2 size={18} />
          {toast}
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-heading text-foreground">
            {showForm 
              ? (editingSupplier ? 'Editar Cadastro' : 'Novo Fornecedor') 
              : 'Gestão de Fornecedores'}
          </h2>
          <p className="text-sm text-tertiary font-body mt-1">
            {showForm 
              ? 'Mantenha os dados de contato e notas técnicas atualizados.' 
              : `${suppliers.length} parceiros ativos cadastrados no sistema.`}
          </p>
        </div>
        
        {!showForm && (
          <div className="flex items-center gap-3">
             <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary transition-colors group-focus-within:text-primary" size={16} />
              <input 
                type="text" 
                placeholder="Buscar parceiro..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-surface-low/50 hover:bg-surface-low focus:bg-white rounded-architectural text-sm font-body text-foreground transition-all outline-none border border-transparent focus:ring-2 focus:ring-primary/10 w-64"
              />
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white text-xs font-bold uppercase tracking-widest rounded-architectural hover:bg-primary-container transition-all shadow-lg shadow-primary/20 active:scale-95"
            >
              <Plus size={16} /> Novo Fornecedor
            </button>
          </div>
        )}
      </div>

      {showForm ? (
        <SupplierForm
          initialData={editingSupplier}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitting={submitting}
        />
      ) : (
        <div className="bg-surface-lowest rounded-architectural border border-ghost-border overflow-hidden shadow-sm">
          <div className="px-6 py-4 bg-surface-low/30 border-b border-ghost-border flex justify-between items-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-tertiary">Diretório de Parceiros</p>
            {searchTerm && (
              <p className="text-[10px] text-primary font-bold">{filteredSuppliers.length} resultados encontrados</p>
            )}
          </div>
          <SupplierList 
            suppliers={filteredSuppliers} 
            onEdit={handleEdit} 
            onDelete={handleDelete} 
          />
        </div>
      )}
    </div>
  );
}
