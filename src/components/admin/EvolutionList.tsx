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
}

interface EvolutionListProps {
  updates: Update[]
  onEdit: (update: Update) => void
  onDelete: (id: string) => void
}

export default function EvolutionList({ updates, onEdit, onDelete }: EvolutionListProps) {
  return (
    <div className="bg-white border border-ghost-border rounded-architectural overflow-hidden shadow-soft">
      <table className="w-full text-left font-body">
        <thead className="bg-surface-low/50 border-b border-ghost-border">
          <tr>
            <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-heading text-tertiary font-bold">Imagem</th>
            <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-heading text-tertiary font-bold">Título / Registro</th>
            <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-heading text-tertiary font-bold">Data</th>
            <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-heading text-tertiary font-bold text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ghost-border">
          {updates.map((update) => (
            <tr key={update.id} className="hover:bg-surface-low/30 transition-colors group">
              <td className="px-6 py-4">
                <div className="w-16 h-12 rounded-architectural overflow-hidden border border-ghost-border bg-surface-low">
                   <img 
                    src={getDirectDriveImageUrl(update.image_url)} 
                    alt={update.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1541888946425-d81bb19480c5?auto=format&fit=crop&q=80&w=200'
                    }}
                  />
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="space-y-0.5">
                  <div className="text-sm font-heading font-bold text-foreground group-hover:text-primary transition-colors">
                    {update.title}
                  </div>
                  {update.description && (
                    <div className="text-[10px] text-tertiary line-clamp-1 max-w-xs">{update.description}</div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2 text-tertiary text-xs">
                  <Calendar size={14} className="opacity-40" />
                  {format(new Date(update.date), "dd/MM/yyyy", { locale: ptBR })}
                </div>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <a
                    href={update.image_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-tertiary hover:text-primary hover:bg-primary/5 rounded-architectural transition-all"
                    title="Ver Fonte"
                  >
                    <ExternalLink size={16} />
                  </a>
                  <button
                    onClick={() => onEdit(update)}
                    className="p-2 text-tertiary hover:text-primary hover:bg-primary/5 rounded-architectural transition-all"
                    title="Editar"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(update.id)}
                    className="p-2 text-tertiary hover:text-red-600 hover:bg-red-50 rounded-architectural transition-all"
                    title="Excluir"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {updates.length === 0 && (
            <tr>
              <td colSpan={4} className="px-6 py-12 text-center text-tertiary italic text-sm">
                Nenhuma atualização registrada no diário de obra.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
