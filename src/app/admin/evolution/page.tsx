'use client'

import React, { useState, useEffect } from 'react'
import EvolutionForm from '@/components/admin/EvolutionForm'
import EvolutionList from '@/components/admin/EvolutionList'
import { Plus, Camera, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Update {
  id: string
  date: string
  title: string
  description?: string
  image_url: string
  created_at: string
}

export default function AdminEvolutionPage() {
  const [updates, setUpdates] = useState<Update[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingUpdate, setEditingUpdate] = useState<Update | null>(null)

  useEffect(() => {
    fetchUpdates()
  }, [])

  const fetchUpdates = async () => {
    try {
      const res = await fetch('/api/evolution')
      const data = await res.json()
      setUpdates(data)
    } catch (err) {
      console.error('Error fetching updates:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este registro do diário de obra?')) return

    try {
      const res = await fetch(`/api/evolution/${id}`, { method: 'DELETE' })
      if (res.ok) fetchUpdates()
    } catch (err) {
      console.error('Error deleting update:', err)
    }
  }

  const handleEdit = (update: Update) => {
    setEditingUpdate(update)
    setShowForm(true)
  }

  const handleSuccess = () => {
    setShowForm(false)
    setEditingUpdate(null)
    fetchUpdates()
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Link href="/admin/expenses" className="text-xs font-heading font-bold text-tertiary flex items-center gap-1 hover:text-primary transition-all mb-2 uppercase tracking-widest">
            <ArrowLeft size={12} /> Painel Administrador
          </Link>
          <h1 className="text-3xl font-heading font-black text-foreground tracking-tight">Diário de Obra</h1>
          <p className="text-tertiary font-body">Gerencie fotos e atualizações visuais da evolução da construção.</p>
        </div>

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-architectural font-heading font-bold uppercase tracking-widest text-xs hover:bg-primary-dark transition-all shadow-lg active:scale-95"
          >
            Novo Registro <Plus size={18} />
          </button>
        )}
      </div>

      {showForm ? (
        <div className="max-w-3xl mx-auto">
          <EvolutionForm 
            update={editingUpdate} 
            onSuccess={handleSuccess} 
            onCancel={() => { setShowForm(false); setEditingUpdate(null); }} 
          />
        </div>
      ) : (
        <div className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
              {[1, 2, 3].map(i => (
                <div key={i} className="aspect-video bg-surface-low rounded-architectural w-full" />
              ))}
            </div>
          ) : (
            <EvolutionList 
              updates={updates} 
              onEdit={handleEdit} 
              onDelete={handleDelete} 
            />
          )}
        </div>
      )}
    </div>
  )
}
