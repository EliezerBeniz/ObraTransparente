"use client";

import React from 'react';
import { ProjectDocument } from '@/lib/types';
import { FileText, Download, Trash2, Edit2, ExternalLink, Calendar, Tag, BookOpen, ImageIcon } from 'lucide-react';
import { getDirectDriveImageUrl } from '@/lib/utils';

interface DocumentListProps {
  documents: ProjectDocument[];
  onEdit?: (doc: ProjectDocument) => void;
  onDelete?: (id: string) => void;
  isAdmin?: boolean;
}

export function DocumentList({ documents, onEdit, onDelete, isAdmin }: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center bg-surface-low/30 rounded-architectural border-2 border-dashed border-ghost-border/50">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-tertiary mb-4 shadow-sm">
          <BookOpen size={32} strokeWidth={1.5} />
        </div>
        <h4 className="text-base font-heading text-foreground mb-1">Nenhum documento disponível</h4>
        <p className="text-xs font-body text-tertiary max-w-[280px]">As plantas e arquivos do projeto aparecerão aqui após a importação.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-1">
      {documents.map((doc) => (
        <div 
          key={doc.id}
          className="group flex flex-col bg-surface-lowest hover:bg-white transition-all rounded-architectural overflow-hidden border border-transparent hover:border-ghost-border hover:shadow-xl hover:shadow-primary/5 active:scale-[0.98]"
        >
          {/* Document Preview Area (Placeholder/Symbolic) */}
          <div className="h-32 bg-surface-low/80 flex items-center justify-center relative overflow-hidden group-hover:bg-primary/5 transition-colors">
            {/* Background Icon Opacity */}
            <div className="absolute inset-0 flex items-center justify-center opacity-5 group-hover:scale-110 transition-transform duration-700">
               <FileText size={100} />
            </div>

            {/* Image Preview or Icon */}
            {doc.file_url && (doc.file_url.match(/\.(jpeg|jpg|gif|png|webp)$/i) || doc.file_url.includes('drive.google.com')) ? (
              <div className="absolute inset-0 w-full h-full">
                <img 
                  src={getDirectDriveImageUrl(doc.file_url)} 
                  alt={doc.title}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  onError={(e) => {
                    // Fallback se a imagem falhar
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            ) : (
              <div className="w-12 h-12 bg-white rounded-architectural flex items-center justify-center text-primary shadow-sm z-10">
                <FileText size={24} />
              </div>
            )}
            
            {/* Version Badge */}
            {doc.version && (
              <span className="absolute top-3 right-3 px-2 py-0.5 bg-secondary/90 text-white text-[9px] font-bold uppercase tracking-widest rounded-md shadow-sm z-10">
                REV: {doc.version}
              </span>
            )}
            
            {/* Category Badge */}
            {doc.category && (
              <span className="absolute bottom-3 left-3 px-2 py-0.5 bg-white/90 backdrop-blur-sm text-tertiary text-[9px] font-bold uppercase tracking-widest rounded-md border border-ghost-border shadow-sm z-10">
                {doc.category}
              </span>
            )}
          </div>

          {/* Info Area */}
          <div className="p-3 md:p-4 flex-1 flex flex-col">
            <div className="flex justify-between gap-3 mb-2">
              <h3 className="text-sm md:text-base font-heading text-foreground line-clamp-2 leading-relaxed min-h-[2.5rem] md:min-h-0">{doc.title}</h3>
            </div>
            
            {doc.description && (
              <p className="text-[11px] md:text-xs font-body text-tertiary line-clamp-2 mb-4 h-8 leading-relaxed">
                {doc.description}
              </p>
            )}

            <div className="mt-auto flex items-center justify-between border-t border-ghost-border/50 pt-4">
              <div className="flex items-center gap-1.5 text-[10px] text-tertiary font-body">
                <Calendar size={12} className="opacity-60" />
                {new Date(doc.created_at).toLocaleDateString('pt-BR')}
              </div>

              <div className="flex items-center gap-2">
                <a 
                  href={doc.file_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-1.5 text-primary hover:bg-primary/10 rounded-architectural transition-all"
                  title="Visualizar Documento"
                >
                  <ExternalLink size={16} />
                </a>
                {isAdmin && (
                  <>
                    <button 
                      onClick={() => onEdit?.(doc)}
                      className="p-1.5 text-tertiary hover:text-foreground hover:bg-surface-low rounded-architectural transition-all"
                      title="Editar"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => onDelete?.(doc.id)}
                      className="p-1.5 text-tertiary hover:text-red-500 hover:bg-red-50 rounded-architectural transition-all"
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
