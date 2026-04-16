"use client";

import React, { useState, useEffect } from 'react';
import { ToolLending, Worker } from '@/lib/types';
import { Loader2 } from 'lucide-react';

interface ToolLendingFormProps {
  initialData?: ToolLending | null;
  onSubmit: (data: Partial<ToolLending>) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
}

export function ToolLendingForm({ initialData, onSubmit, onCancel, submitting }: ToolLendingFormProps) {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [formData, setFormData] = useState<Partial<ToolLending>>({
    tool_description: '',
    worker_id: '',
    borrower_name: '',
    lend_date: new Date().toISOString().split('T')[0],
    expected_return_date: '',
    actual_return_date: '',
    status: 'Pendente',
    notes: '',
    photo_links: [],
    ...initialData
  });

  const [photoInput, setPhotoInput] = useState('');

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const res = await fetch('/api/workers');
        if (res.ok) {
          const data = await res.json();
          setWorkers(data.filter((w: Worker) => w.is_active));
        }
      } catch (error) {
        console.error('Failed to fetch workers', error);
      }
    };
    fetchWorkers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddPhoto = () => {
    if (photoInput.trim()) {
      setFormData(prev => ({
        ...prev,
        photo_links: [...(prev.photo_links || []), photoInput.trim()]
      }));
      setPhotoInput('');
    }
  };

  const handleRemovePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photo_links: prev.photo_links?.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Preparar os dados (tratar campos vazios para null)
    const submitData = {
      ...formData,
      worker_id: formData.worker_id || null,
      borrower_name: formData.borrower_name || null,
      expected_return_date: formData.expected_return_date || null,
      actual_return_date: formData.actual_return_date || null,
    };
    onSubmit(submitData);
  };

  return (
    <div className="bg-surface-lowest rounded-architectural border border-ghost-border p-6 md:p-8 animate-[fadeIn_0.3s_ease-out]">
      <h3 className="text-2xl font-heading mb-6">{initialData ? 'Editar Empréstimo' : 'Novo Empréstimo de Ferramenta'}</h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-tertiary">Descrição da Ferramenta *</label>
            <input 
              type="text"
              name="tool_description"
              value={formData.tool_description || ''}
              onChange={handleChange}
              required
              placeholder="Ex: Betoneira, Enxada, Furadeira..."
              className="bg-surface-low border-none rounded-architectural p-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-tertiary">Com quem ficou? (Pedreiro Cadastrado)</label>
              <select
                name="worker_id"
                value={formData.worker_id || ''}
                onChange={handleChange}
                className="bg-surface-low border-none rounded-architectural p-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              >
                <option value="">-- Selecione ou digite manualmente --</option>
                {workers.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-tertiary">Nome Manual (Se não cadastrado)</label>
              <input 
                type="text"
                name="borrower_name"
                value={formData.borrower_name || ''}
                onChange={handleChange}
                placeholder="Ex: João (Ajudante)"
                className="bg-surface-low border-none rounded-architectural p-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-tertiary">Data Empréstimo *</label>
              <input 
                type="date"
                name="lend_date"
                value={formData.lend_date || ''}
                onChange={handleChange}
                required
                className="bg-surface-low border-none rounded-architectural p-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-tertiary">Devolução Prevista</label>
              <input 
                type="date"
                name="expected_return_date"
                value={formData.expected_return_date || ''}
                onChange={handleChange}
                className="bg-surface-low border-none rounded-architectural p-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-tertiary">Devolução Real</label>
              <input 
                type="date"
                name="actual_return_date"
                value={formData.actual_return_date || ''}
                onChange={handleChange}
                className="bg-surface-low border-none rounded-architectural p-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-tertiary">Status *</label>
              <select
                name="status"
                value={formData.status || 'Pendente'}
                onChange={handleChange}
                required
                className="bg-surface-low border-none rounded-architectural p-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              >
                <option value="Pendente">Pendente</option>
                <option value="Devolvido">Devolvido</option>
                <option value="Extraviado">Extraviado</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 border-t border-ghost-border pt-4">
            <label className="text-xs font-bold uppercase tracking-widest text-tertiary">Fotos (Links do Google Drive)</label>
            <div className="flex gap-2">
              <input 
                type="url"
                value={photoInput}
                onChange={(e) => setPhotoInput(e.target.value)}
                placeholder="https://drive.google.com/..."
                className="flex-grow bg-surface-low border-none rounded-architectural p-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              />
              <button 
                type="button" 
                onClick={handleAddPhoto}
                className="px-4 py-2 bg-primary/10 text-primary font-bold text-xs rounded-architectural uppercase hover:bg-primary/20"
              >
                Adicionar
              </button>
            </div>
            {formData.photo_links && formData.photo_links.length > 0 && (
              <ul className="mt-2 space-y-2">
                {formData.photo_links.map((link, idx) => (
                  <li key={idx} className="flex items-center justify-between bg-surface-low p-2 rounded-architectural text-xs">
                    <span className="truncate max-w-[80%]">{link}</span>
                    <button type="button" onClick={() => handleRemovePhoto(idx)} className="text-red-500 hover:text-red-700 font-bold px-2">Remover</button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-tertiary">Observações / Condição da Ferramenta</label>
            <textarea 
              name="notes"
              value={formData.notes || ''}
              onChange={handleChange}
              rows={3}
              placeholder="Estado da ferramenta ao ser entregue (ex: cabo quebrado, marca Makita)..."
              className="bg-surface-low border-none rounded-architectural p-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-ghost-border mt-8">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 rounded-architectural text-xs font-bold uppercase tracking-wider text-tertiary hover:bg-surface-low transition-all"
            disabled={submitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex items-center justify-center min-w-[120px] px-6 py-2.5 rounded-architectural text-xs font-bold uppercase tracking-wider bg-primary text-white hover:bg-primary-container transition-all"
            disabled={submitting}
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
}
