"use client";

import React, { useState, useEffect } from 'react';
import { Worker } from '@/lib/types';
import { X, Save, RotateCcw, Loader2, User, Phone, Wrench } from 'lucide-react';

interface WorkerFormProps {
  initialData?: Worker | null;
  onSubmit: (data: Partial<Worker>) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
}

const specialties = [
  "Pedreiro",
  "Ajudante",
  "Mestre de Obras",
  "Pintor",
  "Eletricista",
  "Encanador",
  "Gesseiro",
  "Carpinteiro",
  "Outro"
];

export function WorkerForm({ initialData, onSubmit, onCancel, submitting }: WorkerFormProps) {
  const [formData, setFormData] = useState<Partial<Worker>>({
    name: '',
    phone: '',
    specialty: 'Pedreiro',
    is_active: true,
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
          <h3 className="text-lg font-heading text-foreground flex items-center gap-2">
            <User size={20} className="text-primary" />
            {initialData ? 'Editar Profissional' : 'Cadastrar Novo Profissional'}
          </h3>
          <p className="text-xs text-tertiary font-body mt-1">Dados básicos para identificação e contato.</p>
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
          {/* Nome */}
          <div className="space-y-2 col-span-1 md:col-span-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-tertiary flex items-center gap-1.5 ml-1">
              Nome Completo <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: José dos Santos"
                className="w-full pl-11 pr-4 py-3 bg-surface-low rounded-architectural font-body text-sm text-foreground focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none border border-transparent"
              />
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-tertiary/50" />
            </div>
          </div>

          {/* Especialidade */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-tertiary flex items-center gap-1.5 ml-1">
              Especialidade <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <select
                required
                value={formData.specialty || 'Pedreiro'}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                className="w-full pl-11 pr-4 py-3 bg-surface-low rounded-architectural font-body text-sm text-foreground focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none border border-transparent appearance-none cursor-pointer"
              >
                {specialties.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <Wrench size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-tertiary/50" />
            </div>
          </div>

          {/* Telefone */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-tertiary flex items-center gap-1.5 ml-1">
              Telefone / WhatsApp
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(11) 99999-9999"
                className="w-full pl-11 pr-4 py-3 bg-surface-low rounded-architectural font-body text-sm text-foreground focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none border border-transparent"
              />
              <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-tertiary/50" />
            </div>
          </div>

          {/* Status (Only on Edit) */}
          {initialData && (
            <div className="space-y-2 col-span-1 md:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded border-ghost-border text-primary focus:ring-primary/20"
                />
                <span className="text-sm font-body text-foreground group-hover:text-primary transition-colors">Profissional Ativo</span>
              </label>
            </div>
          )}
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
