'use client'

import React from 'react'
import { Edit2, Trash2, Calendar, ListOrdered, CheckCircle2, Clock, PlayCircle } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Phase {
  id: string
  title: string
  description?: string
  phase_date: string
  status: 'completed' | 'in_progress' | 'planned'
  order_index: number
}

interface PhaseListProps {
  phases: Phase[]
  onEdit: (phase: Phase) => void
  onDelete: (id: string) => void
}

export default function PhaseList({ phases, onEdit, onDelete }: PhaseListProps) {
  const sortedPhases = [...phases].sort((a, b) => (a.order_index || 0) - (b.order_index || 0))

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 size={14} className="text-primary" />
      case 'in_progress': return <PlayCircle size={14} className="text-secondary animate-pulse" />
      default: return <Clock size={14} className="text-tertiary" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluído'
      case 'in_progress': return 'Em Andamento'
      default: return 'Planejado'
    }
  }

  return (
    <div className="bg-white border border-ghost-border rounded-architectural overflow-hidden shadow-soft">
      <table className="w-full text-left font-body">
        <thead className="bg-surface-low/50 border-b border-ghost-border">
          <tr>
            <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-heading text-tertiary font-bold">Ordem</th>
            <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-heading text-tertiary font-bold">Título / Etapa</th>
            <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-heading text-tertiary font-bold">Data</th>
            <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-heading text-tertiary font-bold">Status</th>
            <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-heading text-tertiary font-bold text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ghost-border">
          {sortedPhases.map((phase) => (
            <tr key={phase.id} className="hover:bg-surface-low/30 transition-colors group">
              <td className="px-6 py-4">
                <div className="flex items-center gap-2 text-tertiary text-xs font-bold">
                  <ListOrdered size={14} className="opacity-40" />
                  {phase.order_index}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="space-y-0.5">
                  <div className="text-sm font-heading font-bold text-foreground group-hover:text-primary transition-colors">
                    {phase.title}
                  </div>
                  {phase.description && (
                    <div className="text-[10px] text-tertiary line-clamp-1 max-w-xs">{phase.description}</div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2 text-tertiary text-xs">
                  <Calendar size={14} className="opacity-40" />
                  {format(new Date(phase.phase_date), "dd/MM/yyyy", { locale: ptBR })}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-heading font-bold uppercase tracking-tighter ${
                  phase.status === 'completed' ? 'bg-primary/10 text-primary' : 
                  phase.status === 'in_progress' ? 'bg-secondary/10 text-secondary' : 
                  'bg-surface-low text-tertiary'
                }`}>
                  {getStatusIcon(phase.status)}
                  {getStatusLabel(phase.status)}
                </div>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onEdit(phase)}
                    className="p-2 text-tertiary hover:text-primary hover:bg-primary/5 rounded-architectural transition-all"
                    title="Editar"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(phase.id)}
                    className="p-2 text-tertiary hover:text-red-600 hover:bg-red-50 rounded-architectural transition-all"
                    title="Excluir"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {phases.length === 0 && (
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center text-tertiary italic text-sm">
                Nenhuma etapa cadastrada no cronograma.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
