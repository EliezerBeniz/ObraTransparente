'use client'

import React, { useState, useEffect } from 'react'
import { Save, X, Calendar, Type, AlignLeft, ListOrdered, Activity } from 'lucide-react'

interface Phase {
  id?: string
  title: string
  description?: string
  phase_date: string
  status: 'completed' | 'in_progress' | 'planned'
  order_index: number
  budget_estimate?: number
}

interface PhaseFormProps {
  phase?: Phase | null
  suggestedOrder?: number
  onSuccess: () => void
  onCancel: () => void
}

export default function PhaseForm({ phase, suggestedOrder, onSuccess, onCancel }: PhaseFormProps) {
  const [formData, setFormData] = useState<Phase>({
    title: '',
    description: '',
    phase_date: new Date().toISOString().split('T')[0],
    status: 'planned',
    order_index: 0,
    budget_estimate: 0
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (phase) {
      setFormData({
        ...phase,
        description: phase.description || '',
      })
    } else if (suggestedOrder !== undefined) {
      setFormData(prev => ({
        ...prev,
        order_index: suggestedOrder
      }))
    }
  }, [phase, suggestedOrder])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const url = phase?.id ? `/api/phases/${phase.id}` : '/api/phases'
      const method = phase?.id ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erro ao salvar fase')
      }

      onSuccess()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-ghost-border rounded-architectural p-6 shadow-soft space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-heading font-bold text-foreground">
          {phase ? 'Editar Etapa' : 'Nova Etapa no Cronograma'}
        </h3>
        <button type="button" onClick={onCancel} className="text-tertiary hover:text-foreground transition-colors">
          <X size={20} />
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-architectural font-body">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest font-heading text-tertiary font-bold flex items-center gap-2">
            <Type size={12} /> Título da Etapa
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full h-10 px-3 rounded-architectural border border-ghost-border focus:border-primary outline-none transition-all font-body text-sm"
            placeholder="Ex: Fundação e Baldrame"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest font-heading text-tertiary font-bold flex items-center gap-2">
            <Calendar size={12} /> Data Prevista/Realizada
          </label>
          <input
            type="date"
            value={formData.phase_date}
            onChange={(e) => setFormData({ ...formData, phase_date: e.target.value })}
            className="w-full h-10 px-3 rounded-architectural border border-ghost-border focus:border-primary outline-none transition-all font-body text-sm"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest font-heading text-tertiary font-bold flex items-center gap-2">
            <Activity size={12} /> Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            className="w-full h-10 px-3 rounded-architectural border border-ghost-border focus:border-primary outline-none transition-all font-body text-sm bg-white"
          >
            <option value="planned">Planejado</option>
            <option value="in_progress">Em Andamento</option>
            <option value="completed">Concluído</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest font-heading text-tertiary font-bold flex items-center gap-2">
            <ListOrdered size={12} /> Ordem Exibição
          </label>
          <input
            type="number"
            value={formData.order_index}
            onChange={(e) => setFormData({ ...formData, order_index: Number(e.target.value) })}
            className="w-full h-10 px-3 rounded-architectural border border-ghost-border focus:border-primary outline-none transition-all font-body text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest font-heading text-tertiary font-bold flex items-center gap-2">
            <span className="text-secondary">$</span> Orçamento Estimado (R$)
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.budget_estimate}
            onChange={(e) => setFormData({ ...formData, budget_estimate: Number(e.target.value) })}
            className="w-full h-10 px-3 rounded-architectural border border-ghost-border focus:border-primary outline-none transition-all font-body text-sm"
            placeholder="0.00"
          />
        </div>

        <div className="col-span-full space-y-2">
          <label className="text-[10px] uppercase tracking-widest font-heading text-tertiary font-bold flex items-center gap-2">
            <AlignLeft size={12} /> Detalhes (Opcional)
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full h-24 p-3 rounded-architectural border border-ghost-border focus:border-primary outline-none transition-all font-body text-sm resize-none"
            placeholder="Descreva o que será feito nesta etapa..."
          />
        </div>
      </div>

      <div className="pt-4 border-t border-ghost-border flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 rounded-architectural border border-ghost-border text-tertiary font-heading text-xs uppercase tracking-widest hover:bg-surface-low transition-all"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-primary text-white px-8 py-2 rounded-architectural font-heading font-bold uppercase tracking-widest text-xs hover:bg-primary-dark transition-all disabled:opacity-50"
        >
          {loading ? 'Salvando...' : 'Salvar Etapa'}
          <Save size={14} />
        </button>
      </div>
    </form>
  )
}
