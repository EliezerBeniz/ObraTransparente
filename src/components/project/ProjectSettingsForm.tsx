'use client'

import React, { useState, useEffect } from 'react'
import { Save, AlertCircle, CheckCircle2 } from 'lucide-react'

interface Settings {
  id: string
  project_name: string
  total_budget: number
  completion_percentage: number
  current_stage?: string
}

export default function ProjectSettingsForm() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings')
      const data = await res.json()
      if (data.id) setSettings(data)
    } catch (err) {
      console.error('Error fetching settings:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!settings) return

    setSaving(true)
    setMessage(null)

    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      if (!res.ok) throw new Error('Falha ao salvar configurações')
      
      setMessage({ type: 'success', text: 'Configurações atualizadas com sucesso!' })
      setTimeout(() => setMessage(null), 5000)
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8 animate-pulse bg-surface-low rounded-architectural h-64" />

  return (
    <div className="bg-white border border-ghost-border rounded-architectural shadow-soft overflow-hidden">
      <div className="p-6 border-b border-ghost-border bg-surface-low/30">
        <h2 className="text-xl font-heading font-bold text-foreground">Configurações Globais do Projeto</h2>
        <p className="text-sm text-tertiary font-body">Estes dados impactam o que os sócios visualizam no Dashboard principal.</p>
      </div>

      <form onSubmit={handleSave} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-heading text-tertiary font-bold">
              Nome do Projeto
            </label>
            <input
              type="text"
              value={settings?.project_name || ''}
              onChange={(e) => setSettings(s => s ? {...s, project_name: e.target.value} : null)}
              className="w-full h-12 px-4 rounded-architectural border border-ghost-border focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all font-body"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-heading text-tertiary font-bold">
              Orçamento Total Previsto (R$)
            </label>
            <input
              type="number"
              value={settings?.total_budget || 0}
              onChange={(e) => setSettings(s => s ? {...s, total_budget: Number(e.target.value)} : null)}
              className="w-full h-12 px-4 rounded-architectural border border-ghost-border focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all font-body font-bold text-primary"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-heading text-tertiary font-bold">
              Percentual de Conclusão (%)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="100"
                value={settings?.completion_percentage || 0}
                onChange={(e) => setSettings(s => s ? {...s, completion_percentage: Number(e.target.value)} : null)}
                className="flex-grow h-2 bg-ghost-border rounded-full appearance-none cursor-pointer accent-primary"
              />
              <span className="w-12 text-right font-heading font-bold text-foreground">
                {settings?.completion_percentage || 0}%
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-heading text-tertiary font-bold">
              Status Resumido
            </label>
            <input
              type="text"
              value={settings?.current_stage || ''}
              placeholder="Ex: Lançamento de fundações..."
              onChange={(e) => setSettings(s => s ? {...s, current_stage: e.target.value} : null)}
              className="w-full h-12 px-4 rounded-architectural border border-ghost-border focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all font-body text-sm"
            />
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-architectural flex items-center gap-3 ${
            message.type === 'success' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-red-50 text-red-600 border border-red-100'
          }`}>
            {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <p className="text-sm font-heading font-medium">{message.text}</p>
          </div>
        )}

        <div className="pt-4 border-t border-ghost-border flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-architectural font-heading font-bold uppercase tracking-widest text-xs hover:bg-primary-dark transition-all disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Salvar Alterações'}
            {!saving && <Save size={16} />}
          </button>
        </div>
      </form>
    </div>
  )
}
