'use client'

import React from 'react'
import { CheckCircle2, Clock, PlayCircle } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Phase {
  id: string
  title: string
  description?: string
  phase_date: string
  status: 'completed' | 'in_progress' | 'planned'
  order_index: number
  budget_estimate?: number
  total_spent?: number
}

interface TimelineProps {
  phases: Phase[]
}

export default function Timeline({ phases }: TimelineProps) {
  const sortedPhases = [...phases].sort((a, b) => (a.order_index || 0) - (b.order_index || 0))

  return (
    <div className="relative py-8">
      {/* Vertical Line */}
      <div className="absolute left-[13px] md:left-1/2 top-0 bottom-0 w-[2px] bg-ghost-border -translate-x-1/2" />
      
      <div className="space-y-12">
        {sortedPhases.map((phase, index) => {
          const isCompleted = phase.status === 'completed'
          const isInProgress = phase.status === 'in_progress'
          const isEven = index % 2 === 0

          return (
            <div key={phase.id} className={`relative flex items-center ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
              {/* Desktop Center Icon */}
              <div className="absolute left-3.5 md:left-1/2 -translate-x-1/2 z-10 flex items-center justify-center">
                <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full border-4 border-background flex items-center justify-center ${
                  isCompleted ? 'bg-secondary text-white' : 
                  isInProgress ? 'bg-primary text-white animate-pulse shadow-lg shadow-primary/20' : 
                  'bg-surface-low text-tertiary'
                }`}>
                  {isCompleted ? <CheckCircle2 size={14} /> : 
                   isInProgress ? <PlayCircle size={14} /> : 
                   <Clock size={14} />}
                </div>
              </div>

              {/* Content Card */}
              <div className={`w-full md:w-[45%] pl-10 md:pl-0 ${isEven ? 'md:pr-12' : 'md:pl-12'}`}>
                <div className="p-3 md:p-4 rounded-architectural border border-ghost-border bg-white shadow-soft transition-all hover:border-primary/30 group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-heading uppercase tracking-widest text-tertiary">
                      {format(new Date(phase.phase_date.includes('T') ? phase.phase_date : phase.phase_date + 'T12:00:00'), "MMMM yyyy", { locale: ptBR })}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-heading uppercase tracking-tighter ${
                      isCompleted ? 'bg-primary/10 text-primary' : 
                      isInProgress ? 'bg-secondary/10 text-secondary' : 
                      'bg-surface-low text-tertiary'
                    }`}>
                      {isCompleted ? 'Concluído' : isInProgress ? 'Em Andamento' : 'Planejado'}
                    </span>
                  </div>
                  
                  <h3 className="text-base md:text-lg font-heading font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {phase.title}
                  </h3>
                  
                  {phase.description && (
                    <p className="text-sm text-secondary leading-relaxed font-body">
                      {phase.description}
                    </p>
                  )}

                  {/* Financial Info */}
                  <div className="mt-4 pt-4 border-t border-ghost-border/30 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-widest text-tertiary font-bold">Orçamento Estimado</span>
                      <span className="text-xs font-heading font-bold text-foreground">
                        R$ {(phase.budget_estimate || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-widest text-tertiary font-bold">Total Gasto Real</span>
                      <span className={`text-xs font-heading font-bold ${
                        (phase.total_spent || 0) > (phase.budget_estimate || 0) && (phase.budget_estimate || 0) > 0
                          ? 'text-red-500' 
                          : 'text-secondary'
                      }`}>
                        R$ {(phase.total_spent || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    {phase.budget_estimate ? (
                      <div className="w-full bg-surface-low h-1.5 rounded-full overflow-hidden mt-1">
                        <div 
                          className={`h-full transition-all duration-1000 ${
                            (phase.total_spent || 0) > (phase.budget_estimate || 0) ? 'bg-red-500' : 'bg-primary'
                          }`}
                          style={{ width: `${Math.min(((phase.total_spent || 0) / phase.budget_estimate) * 100, 100)}%` }}
                        />
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
