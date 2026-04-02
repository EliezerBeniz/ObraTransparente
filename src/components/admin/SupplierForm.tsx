"use client";

import React, { useState, useEffect } from 'react';
import { Supplier } from '@/lib/types';
import { X, Save, RotateCcw, Loader2 } from 'lucide-react';

interface SupplierFormProps {
  initialData?: Supplier | null;
  onSubmit: (data: Partial<Supplier>) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
}

export function SupplierForm({ initialData, onSubmit, onCancel, submitting }: SupplierFormProps) {
  const [formData, setFormData] = useState<Partial<Supplier>>({
    name: '',
    category: '',
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    description: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <div className="bg-surface-lowest rounded-architectural border border-ghost-border p-8 shadow-md shadow-primary/5 animate-[fadeIn_0.4s_ease-out]">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-ghost-border">
        <div>
          <h3 className="text-lg font-heading text-foreground">
            {initialData ? 'Editar Fornecedor' : 'Cadastrar Novo Parceiro'}
          </h3>
          <p className="text-xs text-tertiary font-body mt-1">Preencha os campos abaixo com os dados cadastrais.</p>
        </div>
        <button 
          onClick={onCancel}
          className="p-2 text-tertiary hover:text-foreground transition-colors hover:bg-surface-low rounded-full"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nome da Empresa */}
          <div className="space-y-2 col-span-1 md:col-span-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-tertiary flex items-center gap-1.5 ml-1">
              Nome da Empresa <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Cimento Nacional S.A."
              className="w-full px-4 py-3 bg-surface-low rounded-architectural font-body text-sm text-foreground focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none border border-transparent"
            />
          </div>

          {/* Categoria */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-tertiary flex items-center gap-1.5 ml-1">
              Categoria / Especialidade
            </label>
            <input
              type="text"
              value={formData.category || ''}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="Ex: ESTRUTURAL, ELÉTRICA"
              className="w-full px-4 py-3 bg-surface-low rounded-architectural font-body text-sm text-foreground focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none border border-transparent"
            />
          </div>

          {/* Contato Principal */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-tertiary flex items-center gap-1.5 ml-1">
              Nome do Contato
            </label>
            <input
              type="text"
              value={formData.contact_name || ''}
              onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
              placeholder="Ex: João Silva"
              className="w-full px-4 py-3 bg-surface-low rounded-architectural font-body text-sm text-foreground focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none border border-transparent"
            />
          </div>

          {/* Telefone */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-tertiary flex items-center gap-1.5 ml-1">
              Telefone / WhatsApp
            </label>
            <input
              type="text"
              value={formData.contact_phone || ''}
              onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
              placeholder="(11) 99999-9999"
              className="w-full px-4 py-3 bg-surface-low rounded-architectural font-body text-sm text-foreground focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none border border-transparent"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-tertiary flex items-center gap-1.5 ml-1">
              Email Corporativo
            </label>
            <input
              type="email"
              value={formData.contact_email || ''}
              onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
              placeholder="contato@empresa.com"
              className="w-full px-4 py-3 bg-surface-low rounded-architectural font-body text-sm text-foreground focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none border border-transparent"
            />
          </div>

          {/* Notas Técnicas / Descrição */}
          <div className="space-y-2 col-span-1 md:col-span-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-tertiary flex items-center gap-1.5 ml-1">
              Notas Técnicas / Descrição
            </label>
            <textarea
              rows={4}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detalhes sobre a capacidade de entrega, certificações ou histórico."
              className="w-full px-4 py-3 bg-surface-low rounded-architectural font-body text-sm text-foreground focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none border border-transparent resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-6 border-t border-ghost-border mt-8">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="flex items-center gap-2 px-5 py-2.5 text-tertiary hover:text-foreground text-xs font-bold uppercase tracking-widest rounded-architectural hover:bg-surface-low transition-all disabled:opacity-50"
          >
            <RotateCcw size={16} /> Cancelar
          </button>
          
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-8 py-3 bg-primary text-white text-xs font-bold uppercase tracking-widest rounded-architectural hover:bg-primary-container transition-all shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-75"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Salvando...
              </>
            ) : (
              <>
                <Save size={16} /> Finalizar Cadastro
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
