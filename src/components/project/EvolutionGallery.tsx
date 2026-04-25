'use client'

import React from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Maximize2, ExternalLink } from 'lucide-react'
import { getDirectDriveImageUrl } from '@/lib/utils'

interface UpdateMedia {
  id: string
  media_url: string
  media_type: 'image' | 'video'
  is_cover: boolean
}

interface Update {
  id: string
  date: string
  title: string
  description?: string
  image_url: string
  created_at: string
  project_update_media?: UpdateMedia[]
}

interface EvolutionGalleryProps {
  updates: Update[]
}

export default function EvolutionGallery({ updates }: EvolutionGalleryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {updates.map((update) => (
        <div key={update.id} className="group relative bg-white border border-ghost-border rounded-architectural overflow-hidden shadow-soft-hover transition-all hover:-translate-y-1 flex flex-col">
          {/* Image Container */}
          <div className="aspect-[4/3] bg-surface-low relative overflow-hidden">
            <img 
              src={getDirectDriveImageUrl(update.image_url)} 
              alt={update.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1541888946425-d81bb19480c5?auto=format&fit=crop&q=80&w=800'
              }}
            />
            
            {/* Multi-media Badge */}
            {update.project_update_media && update.project_update_media.length > 1 && (
              <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-widest rounded-full border border-white/10 flex items-center gap-1.5 z-10">
                <Maximize2 size={10} />
                +{update.project_update_media.length - 1} mídias
              </div>
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <a 
                href={update.image_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-12 h-12 bg-white text-primary rounded-full flex items-center justify-center shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform"
                title="Ver imagem completa"
              >
                <Maximize2 size={24} />
              </a>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 flex-grow flex flex-col">
            <div className="flex items-center justify-between mb-2">
               <span className="text-[10px] font-heading uppercase tracking-widest text-tertiary">
                {format(new Date(update.date.includes('T') ? update.date : update.date + 'T12:00:00'), "dd 'de' MMMM yyyy", { locale: ptBR })}
              </span>
            </div>
            
            <h3 className="text-lg font-heading font-bold text-foreground mb-2 leading-tight">
              {update.title}
            </h3>
            
            {update.description && (
              <p className="text-sm text-secondary font-body line-clamp-3 mb-4">
                {update.description}
              </p>
            )}

            {/* Additional Media Links if any */}
            {update.project_update_media && update.project_update_media.length > 1 && (
              <div className="mt-auto pt-4 border-t border-ghost-border/50">
                <p className="text-[10px] font-bold uppercase tracking-widest text-tertiary mb-2">Outras mídias deste dia:</p>
                <div className="flex flex-wrap gap-2">
                  {update.project_update_media
                    .filter(m => !m.is_cover && m.media_url !== update.image_url)
                    .map((m, idx) => (
                    <a 
                      key={m.id || idx}
                      href={m.media_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-lg border border-ghost-border overflow-hidden hover:border-primary transition-all shadow-sm"
                    >
                      <img 
                        src={getDirectDriveImageUrl(m.media_url, 200)} 
                        alt="Miniatura" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1541888946425-d81bb19480c5?auto=format&fit=crop&q=80&w=200'
                        }}
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}
            
            {!update.project_update_media?.length && (
              <div className="mt-auto pt-4 border-t border-ghost-border/50 flex items-center justify-end">
                 <a 
                  href={update.image_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[10px] font-heading uppercase text-tertiary hover:text-primary flex items-center gap-1 transition-colors"
                  title="Acessar Fonte"
                >
                  Link Externo <ExternalLink size={12} />
                </a>
              </div>
            )}
          </div>
        </div>
      ))}
      
      {updates.length === 0 && (
        <div className="col-span-full py-20 text-center border-2 border-dashed border-ghost-border rounded-architectural">
          <p className="text-tertiary font-body">Nenhuma atualização registrada ainda.</p>
        </div>
      )}
    </div>
  )
}
