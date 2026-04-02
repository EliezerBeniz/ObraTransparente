"use client";

import React, { useState, useEffect } from 'react';
import { ProjectDocument } from '@/lib/types';
import { X, Save, RotateCcw, Loader2, Link as LinkIcon, FileText } from 'lucide-react';

interface DocumentFormProps {
  initialData?: ProjectDocument | null;
  onSubmit: (data: Partial<ProjectDocument>) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
}

export function DocumentForm({ initialData, onSubmit, onCancel, submitting }: DocumentFormProps) {
  const [formData, setFormData] = useState<Partial<ProjectDocument>>({
    title: '',
    category: '',
    file_url: '',
    version: '',
    description: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <div className="bg-surface-lowest rounded-architectural border border-ghost-border p-8 shadow-md shadow-primary/5 animate-[fadeIn_0.4s_ease-out]">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-ghost-border">
        <div>
          <h3 className="text-lg font-heading text-foreground">
            {initialData ? 'Editar Documento' : 'Importar Novo Documento (Link)'}
          </h3>
          <p className="text-xs text-tertiary font-body mt-1">
            Conecte arquivos externos ao projeto. O arquivo deve estar hospedado no Google Drive ou similar.
          </p>
        </div>
        <button 
          onClick={onCancel}
          className="p-2 text-tertiary hover:text-foreground transition-colors hover:bg-surface-low rounded-full"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Título do Documento */}
          <div className="space-y-2 col-span-1 md:col-span-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-tertiary flex items-center gap-1.5 ml-1">
              Título do Documento <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Planta de Baixa - Pavimento Térreo"
              className="w-full px-4 py-3 bg-surface-low rounded-architectural font-body text-sm text-foreground focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none border border-transparent"
            />
          </div>

          {/* Link Externo */}
          <div className="space-y-2 col-span-1 md:col-span-2">
             <label className="text-[10px] font-bold uppercase tracking-wider text-tertiary flex items-center gap-1.5 ml-1">
              URL do Arquivo (Google Drive / Docs) <span className="text-red-400">*</span>
            </label>
            <div className="relative group">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary" size={16} />
              <input
                type="url"
                required
                value={formData.file_url || ''}
                onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                placeholder="https://drive.google.com/file/d/..."
                className="w-full pl-10 pr-4 py-3 bg-surface-low rounded-architectural font-body text-sm text-foreground focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none border border-transparent"
              />
            </div>
            <p className="text-[9px] text-tertiary font-body italic ml-1">Certifique-se de que o link tenha permissão de visualização.</p>
          </div>

          {/* Categoria */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-tertiary flex items-center gap-1.5 ml-1">
              Categoria do Documento
            </label>
            <select
              value={formData.category || ''}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 bg-surface-low rounded-architectural font-body text-sm text-foreground focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none border border-transparent"
            >
              <option value="">Selecione uma categoria</option>
              <option value="ESTRUTURAL">Projeto Estrutural</option>
              <option value="ELÉTRICA">Projeto Elétrico</option>
              <option value="HIDRÁULICA">Projeto Hidráulico</option>
              <option value="ARQUITETÔNICO">Projeto Arquitetônico</option>
              <option value="CONTRATO">Contratos</option>
              <option value="LAUDO">Laudos Técnicos</option>
              <option value="OUTROS">Outros</option>
            </select>
          </div>

          {/* Versão / Revisão */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-tertiary flex items-center gap-1.5 ml-1">
              Versão / Revisão
            </label>
            <input
              type="text"
              value={formData.version || ''}
              onChange={(e) => setFormData({ ...formData, version: e.target.value })}
              placeholder="Ex: 01, Final, Em Análise"
              className="w-full px-4 py-3 bg-surface-low rounded-architectural font-body text-sm text-foreground focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none border border-transparent"
            />
          </div>

          {/* Notas Técnicas / Descrição */}
          <div className="space-y-2 col-span-1 md:col-span-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-tertiary flex items-center gap-1.5 ml-1">
              Contexto / Observações
            </label>
            <textarea
              rows={3}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Breve comentário sobre o que contém este arquivo."
              className="w-full px-4 py-3 bg-surface-low rounded-architectural font-body text-sm text-foreground focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none border border-transparent resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-6 border-t border-ghost-border mt-8">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="flex items-center gap-2 px-5 py-2.5 text-tertiary hover:text-foreground text-xs font-bold uppercase tracking-widest rounded-architectural hover:bg-surface-low transition-all disabled:opacity-50"
          >
            <RotateCcw size={16} /> Cancelar
          </button>
          
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-8 py-3 bg-primary text-white text-xs font-bold uppercase tracking-widest rounded-architectural hover:bg-primary-container transition-all shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-75"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Salvando...
              </>
            ) : (
              <>
                <FileText size={16} /> Importar Arquivo
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
