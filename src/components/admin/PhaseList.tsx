'use client'

import React from 'react'
import { Edit2, Trash2, Calendar, CheckCircle2, Clock, PlayCircle, GripVertical } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface Phase {
  id: string
  title: string
  description?: string
  phase_date: string
  status: 'completed' | 'in_progress' | 'planned'
  order_index: number
  budget_estimate?: number
  total_spent?: number
  expense_count?: number
}

interface PhaseListProps {
  phases: Phase[]
  onEdit: (phase: Phase) => void
  onDelete: (id: string) => void
  onReorder?: (newPhases: Phase[]) => void
}

function SortableRow({ phase, onEdit, onDelete }: { phase: Phase; onEdit: (p: Phase) => void; onDelete: (id: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: phase.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  }

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
    <div 
      ref={setNodeRef} 
      style={style}
      className={`grid grid-cols-[40px_60px_1fr_120px_140px_180px_100px] items-center border-b border-ghost-border hover:bg-surface-low/30 transition-colors group bg-white ${isDragging ? 'shadow-xl rounded-architectural ring-2 ring-primary/20 relative z-20' : ''}`}
    >
      <div className="px-4 py-4 cursor-grab active:cursor-grabbing text-tertiary/40 hover:text-primary transition-colors" {...attributes} {...listeners}>
        <GripVertical size={16} />
      </div>
      <div className="px-2 py-4">
        <div className="flex items-center gap-2 text-tertiary text-[10px] font-bold">
          <span className="opacity-40">#</span>{phase.order_index}
        </div>
      </div>
      <div className="px-4 py-4 min-w-0">
        <div className="space-y-0.5">
          <div className="text-sm font-heading font-bold text-foreground group-hover:text-primary transition-colors truncate">
            {phase.title}
          </div>
          {phase.description && (
            <div className="text-[10px] text-tertiary line-clamp-1">{phase.description}</div>
          )}
        </div>
      </div>
      <div className="px-4 py-4 text-center">
        <div className="flex items-center justify-center gap-2 text-tertiary text-xs">
          <Calendar size={14} className="opacity-40" />
          <span className="whitespace-nowrap">
            {format(new Date(phase.phase_date), "dd/MM/yy", { locale: ptBR })}
          </span>
        </div>
      </div>
      <div className="px-4 py-4 text-center">
        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-heading font-bold uppercase tracking-tighter ${
          phase.status === 'completed' ? 'bg-primary/10 text-primary' : 
          phase.status === 'in_progress' ? 'bg-secondary/10 text-secondary' : 
          'bg-surface-low text-tertiary'
        }`}>
          {getStatusIcon(phase.status)}
          <span className="hidden sm:inline">{getStatusLabel(phase.status)}</span>
        </div>
      </div>
      <div className="px-4 py-4">
        <div className="space-y-1.5">
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-bold text-tertiary uppercase tracking-tighter leading-none mb-0.5">
              Est: R$ {(phase.budget_estimate || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <span className={`text-xs font-heading font-black ${(phase.total_spent || 0) > (phase.budget_estimate || 0) && (phase.budget_estimate || 0) > 0 ? 'text-red-500' : 'text-secondary'} leading-none`}>
              R$ {(phase.total_spent || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          {phase.budget_estimate ? (
            <div className="w-full bg-surface-low h-1 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${
                  (phase.total_spent || 0) > (phase.budget_estimate || 0) ? 'bg-red-500' : 'bg-primary'
                }`}
                style={{ width: `${Math.min(((phase.total_spent || 0) / phase.budget_estimate) * 100, 100)}%` }}
              />
            </div>
          ) : null}
        </div>
      </div>
      <div className="px-4 py-4 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onEdit(phase)}
            className="p-1.5 text-tertiary hover:text-primary hover:bg-primary/5 rounded-architectural transition-all"
            title="Editar"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => onDelete(phase.id)}
            className="p-1.5 text-tertiary hover:text-red-600 hover:bg-red-50 rounded-architectural transition-all"
            title="Excluir"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PhaseList({ phases, onEdit, onDelete, onReorder }: PhaseListProps) {
  const sortedPhases = [...phases].sort((a, b) => (a.order_index || 0) - (b.order_index || 0))

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = sortedPhases.findIndex((p) => p.id === active.id)
      const newIndex = sortedPhases.findIndex((p) => p.id === over.id)

      const reordered = arrayMove(sortedPhases, oldIndex, newIndex)
      
      // Update order_index for all items to match their new positions
      const updatedPhases = reordered.map((phase, index) => ({
        ...phase,
        order_index: index + 1
      }))

      if (onReorder) {
        onReorder(updatedPhases)
      }
    }
  }

  return (
    <div className="bg-white border border-ghost-border rounded-architectural overflow-hidden shadow-soft">
      {/* Fake Table Header */}
      <div className="grid grid-cols-[40px_60px_1fr_120px_140px_180px_100px] bg-surface-low/50 border-b border-ghost-border items-center">
        <div className="px-4 py-3 text-[10px] uppercase tracking-widest font-heading text-tertiary font-bold text-center"></div>
        <div className="px-2 py-3 text-[10px] uppercase tracking-widest font-heading text-tertiary font-bold">#</div>
        <div className="px-4 py-3 text-[10px] uppercase tracking-widest font-heading text-tertiary font-bold">Etapa</div>
        <div className="px-4 py-3 text-[10px] uppercase tracking-widest font-heading text-tertiary font-bold text-center">Data</div>
        <div className="px-4 py-3 text-[10px] uppercase tracking-widest font-heading text-tertiary font-bold text-center">Status</div>
        <div className="px-4 py-3 text-[10px] uppercase tracking-widest font-heading text-tertiary font-bold text-right">Orçamento</div>
        <div className="px-4 py-3 text-[10px] uppercase tracking-widest font-heading text-tertiary font-bold text-right">Ações</div>
      </div>

      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={sortedPhases.map(p => p.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="divide-y divide-ghost-border">
            {sortedPhases.map((phase) => (
              <SortableRow 
                key={phase.id} 
                phase={phase} 
                onEdit={onEdit} 
                onDelete={onDelete} 
              />
            ))}
            {phases.length === 0 && (
              <div className="px-6 py-12 text-center text-tertiary italic text-sm">
                Nenhuma etapa cadastrada no cronograma.
              </div>
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
