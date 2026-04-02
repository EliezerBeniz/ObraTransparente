'use client'

import React, { useState, useEffect } from 'react'
import { Save, X, Calendar, Type, AlignLeft, Image as ImageIcon, ExternalLink } from 'lucide-react'

interface Update {
  id?: string
  date: string
  title: string
  description?: string
  image_url: string
}

interface EvolutionFormProps {
  update?: Update | null
  onSuccess: () => void
  onCancel: () => void
}

export default function EvolutionForm({ update, onSuccess, onCancel }: EvolutionFormProps) {
  const [formData, setFormData] = useState<Update>({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    image_url: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (update) {
      setFormData({
        ...update,
        description: update.description || '',
      })
    }
  }, [update])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const url = update?.id ? `/api/evolution/${update.id}` : '/api/evolution'
      const method = update?.id ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erro ao salvar atualização')
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
          {update ? 'Editar Registro' : 'Novo Registro no Diário de Obra'}
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
            <Type size={12} /> Título do Registro
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full h-10 px-3 rounded-architectural border border-ghost-border focus:border-primary outline-none transition-all font-body text-sm"
            placeholder="Ex: Conclusão da Laje do 1º Pavimento"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest font-heading text-tertiary font-bold flex items-center gap-2">
            <Calendar size={12} /> Data do Registro
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full h-10 px-3 rounded-architectural border border-ghost-border focus:border-primary outline-none transition-all font-body text-sm"
            required
          />
        </div>

        <div className="col-span-full space-y-2">
          <label className="text-[10px] uppercase tracking-widest font-heading text-tertiary font-bold flex items-center gap-2">
            <ImageIcon size={12} /> URL da Imagem (Google Drive / Fotos)
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className="flex-grow h-10 px-3 rounded-architectural border border-ghost-border focus:border-primary outline-none transition-all font-body text-sm"
              placeholder="https://..."
              required
            />
            {formData.image_url && (
              <a href={formData.image_url} target="_blank" rel="noopener noreferrer" className="p-2 text-primary hover:bg-primary/5 rounded-architectural transition-all">
                <ExternalLink size={20} />
              </a>
            )}
          </div>
          <p className="text-[10px] text-tertiary italic">Certifique-se de que o link é público ou compartilhado com os sócios.</p>
        </div>

        <div className="col-span-full space-y-2">
          <label className="text-[10px] uppercase tracking-widest font-heading text-tertiary font-bold flex items-center gap-2">
            <AlignLeft size={12} /> Descrição / Detalhes
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full h-24 p-3 rounded-architectural border border-ghost-border focus:border-primary outline-none transition-all font-body text-sm resize-none"
            placeholder="Comentários sobre o progresso observado..."
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
          {loading ? 'Salvando...' : 'Salvar Registro'}
          <Save size={14} />
        </button>
      </div>
    </form>
  )
}
