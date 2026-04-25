'use client'

import React from 'react'
import { Edit2, Trash2, Calendar, Image as ImageIcon, ExternalLink, Activity } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { getDirectDriveImageUrl } from '@/lib/utils'

interface Update {
  id: string
  date: string
  title: string
  description?: string
  image_url: string
  created_at: string
  project_phases?: { title: string }
  project_update_media?: { id: string }[]
}

interface EvolutionListProps {
  updates: Update[]
  onEdit: (update: Update) => void
  onDelete: (id: string) => void
}

export default function EvolutionList({ updates, onEdit, onDelete }: EvolutionListProps) {
  if (updates.length === 0) {
    return (
      <div className="text-center py-20 bg-surface-low/30 rounded-architectural border border-dashed border-ghost-border">
        <div className="inline-flex p-4 bg-surface-low rounded-full mb-4 text-tertiary/20">
          <ImageIcon size={48} />
        </div>
        <h3 className="text-lg font-heading text-tertiary">Nenhum registro encontrado</h3>
        <p className="text-sm text-tertiary/60 font-body mt-2">Nenhuma atualização registrada no diário de obra.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-[fadeIn_0.5s_ease-out]">
      {updates.map((update) => (
        <div 
          key={update.id}
          className="group bg-surface-lowest hover:bg-white rounded-architectural border border-ghost-border transition-all hover:shadow-xl hover:shadow-primary/5 relative overflow-hidden flex flex-col"
        >
          {/* Image Header */}
          <div className="aspect-video bg-surface-low relative overflow-hidden">
            <img 
              src={getDirectDriveImageUrl(update.image_url)} 
              alt={update.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1541888946425-d81bb19480c5?auto=format&fit=crop&q=80&w=800'
              }}
            />
            
            {/* Phase Badge */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {update.project_phases?.title ? (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-widest border border-white/10">
                  <Activity size={10} />
                  {update.project_phases.title}
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-widest border border-white/10">
                  Geral
                </div>
              )}

              {update.project_update_media && update.project_update_media.length > 1 && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/80 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-widest border border-white/10 w-fit">
                  <ImageIcon size={10} />
                  +{update.project_update_media.length - 1} fotos
                </div>
              )}
            </div>

            {/* Quick Actions Overlay */}
            <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity translate-y-[-10px] group-hover:translate-y-0 transition-transform duration-300">
              <a
                href={update.image_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/90 hover:bg-white text-tertiary hover:text-primary rounded-architectural shadow-sm transition-all"
                title="Ver Fonte"
              >
                <ExternalLink size={14} />
              </a>
              <button
                onClick={() => onEdit(update)}
                className="p-2 bg-white/90 hover:bg-white text-tertiary hover:text-primary rounded-architectural shadow-sm transition-all"
                title="Editar"
              >
                <Edit2 size={14} />
              </button>
              <button
                onClick={() => onDelete(update.id)}
                className="p-2 bg-white/90 hover:bg-white text-tertiary hover:text-red-600 rounded-architectural shadow-sm transition-all"
                title="Excluir"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-5 flex-grow flex flex-col">
            <div className="flex items-center gap-2 mb-2 text-tertiary">
              <Calendar size={12} className="opacity-60" />
              <span className="text-[10px] font-bold uppercase tracking-widest">
                {format(new Date(update.date.includes('T') ? update.date : update.date + 'T12:00:00'), "dd/MM/yyyy", { locale: ptBR })}
              </span>
            </div>
            
            <h4 className="font-heading text-lg text-foreground group-hover:text-primary transition-colors leading-tight mb-2 line-clamp-1">
              {update.title}
            </h4>
            
            {update.description && (
              <p className="text-sm text-tertiary font-body line-clamp-2 mt-auto">
                {update.description}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
