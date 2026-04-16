import React, { useState } from 'react';
import { ShoppingItem } from '@/lib/types';
import { Save, X } from 'lucide-react';

interface ShoppingFormProps {
  initialData?: ShoppingItem | null;
  onSubmit: (data: Partial<ShoppingItem>) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
}

export function ShoppingForm({ initialData, onSubmit, onCancel, submitting }: ShoppingFormProps) {
  const [formData, setFormData] = useState<Omit<Partial<ShoppingItem>, 'estimated_amount'> & { estimated_amount?: string | number | null }>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    quantity_text: initialData?.quantity_text || '',
    estimated_amount: initialData?.estimated_amount ? initialData.estimated_amount.toString() : '',
    expected_date: initialData?.expected_date || new Date().toISOString().split('T')[0],
    category: initialData?.category || '',
    status: initialData?.status || 'Pendente',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      estimated_amount: formData.estimated_amount ? parseFloat(formData.estimated_amount as any) : null,
    };
    await onSubmit(payload);
  };

  return (
    <div className="bg-surface-lowest border border-ghost-border rounded-architectural p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-heading text-foreground">
          {initialData ? 'Editar Previsão de Compra' : 'Nova Previsão de Compra'}
        </h3>
        <button onClick={onCancel} className="text-tertiary hover:text-foreground transition-colors">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-heading tracking-wide text-secondary">Título/Material *</label>
            <input 
              type="text" 
              required
              className="w-full px-4 py-2 bg-surface border border-ghost-border rounded-architectural font-body text-sm focus:outline-none focus:border-tertiary transition-colors"
              placeholder="Ex: 50 Sacos de Cimento CP-II"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-heading tracking-wide text-secondary">Quantidade (Opcional)</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 bg-surface border border-ghost-border rounded-architectural font-body text-sm focus:outline-none focus:border-tertiary transition-colors"
              placeholder="Ex: 50 Sacos, 2 Caminhões..."
              value={formData.quantity_text || ''}
              onChange={(e) => setFormData({...formData, quantity_text: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-heading tracking-wide text-secondary">Valor Estimado (R$)</label>
            <input 
              type="number" 
              step="0.01"
              min="0"
              className="w-full px-4 py-2 bg-surface border border-ghost-border rounded-architectural font-body text-sm focus:outline-none focus:border-tertiary transition-colors"
              placeholder="0,00"
              value={formData.estimated_amount || ''}
              onChange={(e) => setFormData({...formData, estimated_amount: e.target.value as any})}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-heading tracking-wide text-secondary">Data Prevista *</label>
            <input 
              type="date" 
              required
              className="w-full px-4 py-2 bg-surface border border-ghost-border rounded-architectural font-body text-sm focus:outline-none focus:border-tertiary transition-colors"
              value={formData.expected_date}
              onChange={(e) => setFormData({...formData, expected_date: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-heading tracking-wide text-secondary">Categoria (Opcional)</label>
             <select 
                className="w-full px-4 py-2 bg-surface border border-ghost-border rounded-architectural font-body text-sm focus:outline-none focus:border-tertiary transition-colors"
                value={formData.category || ''}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option value="">Selecione uma categoria...</option>
                <option value="Materiais">Materiais</option>
                <option value="Equipamentos">Equipamentos</option>
                <option value="Serviços">Serviços</option>
                <option value="Administrativo">Administrativo</option>
                <option value="Outros">Outros</option>
              </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-heading tracking-wide text-secondary">Status</label>
             <select 
                className="w-full px-4 py-2 bg-surface border border-ghost-border rounded-architectural font-body text-sm focus:outline-none focus:border-tertiary transition-colors"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value as any})}
              >
                <option value="Pendente">Pendente</option>
                <option value="Comprado">Comprado</option>
                <option value="Cancelado">Cancelado</option>
              </select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-heading tracking-wide text-secondary">Observações (Opcional)</label>
            <textarea 
              rows={3}
              className="w-full px-4 py-2 bg-surface border border-ghost-border rounded-architectural font-body text-sm focus:outline-none focus:border-tertiary transition-colors resize-none"
              placeholder="Detalhes adicionais, marca de preferência..."
              value={formData.description || ''}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-ghost-border mt-8">
          <button 
            type="button" 
            onClick={onCancel}
            disabled={submitting}
            className="px-4 py-2 text-sm font-heading tracking-wide text-tertiary hover:text-foreground transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2 bg-foreground text-background rounded-architectural text-sm font-heading tracking-wide hover:bg-foreground/90 transition-colors disabled:opacity-50"
          >
            {submitting ? 'Salvando...' : (
              <>
                <Save size={16} />
                {initialData ? 'Atualizar' : 'Salvar Previsão'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
