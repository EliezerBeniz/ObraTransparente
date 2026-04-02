"use client";

import React, { useEffect, useState } from 'react';
import { ProjectDocument } from '@/lib/types';
import { DocumentList } from '@/components/admin/DocumentList';
import { Search, FolderOpen, AlertCircle, Info } from 'lucide-react';

export default function PublicDocumentsPage() {
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  useEffect(() => {
    async function fetchDocs() {
      try {
        const res = await fetch('/api/documents');
        if (res.ok) {
          const data = await res.json();
          setDocuments(data);
        }
      } catch (error) {
        console.error('Failed to fetch documents', error);
      } finally {
        setLoading(false);
      }
    }
    fetchDocs();
  }, []);

  const filteredDocuments = documents.filter(d => {
    const matchesSearch = d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        d.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || d.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(documents.map(d => d.category).filter(Boolean)));

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="animate-pulse space-y-8">
          <div className="h-10 w-64 bg-surface-low rounded-architectural"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-64 bg-surface-low rounded-architectural"></div>)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 min-h-[80vh]">
      {/* Hero / Header */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-primary/10 rounded-architectural flex items-center justify-center text-primary">
            <FolderOpen size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-heading text-foreground">Repositório do Projeto</h1>
            <p className="text-sm font-body text-tertiary mt-1">Acesso transparente às plantas, contratos e documentos oficiais da obra.</p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-primary/5 border border-primary/10 rounded-architectural p-4 flex gap-3 items-start mb-10">
          <Info size={18} className="text-primary shrink-0 mt-0.5" />
          <p className="text-xs font-body text-primary/80 leading-relaxed">
            Este repositório é público e visa garantir a transparência total do projeto civil. 
            Todos os arquivos são links externos oficiais. Em caso de dúvidas sobre as revisões, entre em contato com a engenharia.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3 overflow-x-auto pb-2 custom-scrollbar">
            <button 
              onClick={() => setSelectedCategory('ALL')}
              className={`px-4 py-2 rounded-architectural text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                selectedCategory === 'ALL' 
                ? 'bg-primary text-white shadow-md shadow-primary/10' 
                : 'bg-surface-low text-tertiary hover:bg-white border border-ghost-border/30'
              }`}
            >
              Todos os Arquivos
            </button>
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat!)}
                className={`px-4 py-2 rounded-architectural text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all ${
                  selectedCategory === cat 
                  ? 'bg-primary text-white shadow-md shadow-primary/10' 
                  : 'bg-surface-low text-tertiary hover:bg-white border border-ghost-border/30'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative group min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary opacity-40 group-focus-within:text-primary transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nome ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-surface-low/50 hover:bg-surface-low focus:bg-white rounded-architectural text-sm font-body text-foreground transition-all outline-none border border-transparent focus:ring-2 focus:ring-primary/10"
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredDocuments.length > 0 ? (
          <DocumentList documents={filteredDocuments} isAdmin={false} />
        ) : (
          <div className="col-span-full py-20 bg-surface-low/30 rounded-architectural border-2 border-dashed border-ghost-border/50 flex flex-col items-center justify-center text-center">
             <AlertCircle size={40} className="text-tertiary mb-4 opacity-40" />
             <h4 className="text-lg font-heading text-foreground mb-1">Nenhum arquivo encontrado</h4>
             <p className="text-sm font-body text-tertiary">Tente ajustar sua busca ou filtro de categoria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
