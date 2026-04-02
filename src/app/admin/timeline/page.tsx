'use client'

import React, { useState, useEffect } from 'react'
import PhaseForm from '@/components/admin/PhaseForm'
import PhaseList from '@/components/admin/PhaseList'
import { Plus, Calendar, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Phase {
  id: string
  title: string
  description?: string
  phase_date: string
  status: 'completed' | 'in_progress' | 'planned'
  order_index: number
}

export default function AdminTimelinePage() {
  const [phases, setPhases] = useState<Phase[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingPhase, setEditingPhase] = useState<Phase | null>(null)

  useEffect(() => {
    fetchPhases()
  }, [])

  const fetchPhases = async () => {
    try {
      const res = await fetch('/api/phases')
      const data = await res.json()
      setPhases(data)
    } catch (err) {
      console.error('Error fetching phases:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta etapa do cronograma?')) return

    try {
      const res = await fetch(`/api/phases/${id}`, { method: 'DELETE' })
      if (res.ok) fetchPhases()
    } catch (err) {
      console.error('Error deleting phase:', err)
    }
  }

  const handleEdit = (phase: Phase) => {
    setEditingPhase(phase)
    setShowForm(true)
  }

  const handleSuccess = () => {
    setShowForm(false)
    setEditingPhase(null)
    fetchPhases()
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Link href="/admin/expenses" className="text-xs font-heading font-bold text-tertiary flex items-center gap-1 hover:text-primary transition-all mb-2 uppercase tracking-widest">
            <ArrowLeft size={12} /> Painel Administrador
          </Link>
          <h1 className="text-3xl font-heading font-black text-foreground tracking-tight">Cronograma de Obra</h1>
          <p className="text-tertiary font-body">Gerencie as etapas e o progresso da construção.</p>
        </div>

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-architectural font-heading font-bold uppercase tracking-widest text-xs hover:bg-primary-dark transition-all shadow-lg active:scale-95"
          >
            Nova Etapa <Plus size={18} />
          </button>
        )}
      </div>

      {showForm ? (
        <div className="max-w-3xl mx-auto">
          <PhaseForm 
            phase={editingPhase} 
            onSuccess={handleSuccess} 
            onCancel={() => { setShowForm(false); setEditingPhase(null); }} 
          />
        </div>
      ) : (
        <div className="space-y-6">
          {loading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-surface-low rounded-architectural w-full" />
              ))}
            </div>
          ) : (
            <PhaseList 
              phases={phases} 
              onEdit={handleEdit} 
              onDelete={handleDelete} 
            />
          )}
        </div>
      )}
    </div>
  )
}
