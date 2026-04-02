"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Plus, CheckCircle2, FolderOpen, Search, Filter } from 'lucide-react';
import { ProjectDocument } from '@/lib/types';
import { useSearchParams, useRouter } from 'next/navigation';
import { DocumentList } from '@/components/admin/DocumentList';
import { DocumentForm } from '@/components/admin/DocumentForm';

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showForm, setShowForm] = useState(searchParams.get('new') === 'true');
  const [editingDocument, setEditingDocument] = useState<ProjectDocument | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchDocuments = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setShowForm(true);
      setEditingDocument(null);
    }
  }, [searchParams]);

  const handleSubmit = async (payload: Partial<ProjectDocument>) => {
    setSubmitting(true);
    
    try {
      let res;
      if (editingDocument) {
        res = await fetch(`/api/documents/${editingDocument.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao salvar documento');
      }

      showToast(editingDocument ? 'Arquivo atualizado!' : 'Novo documento importado com sucesso!');
      setShowForm(false);
      setEditingDocument(null);
      
      if (searchParams.get('new')) {
        router.push('/admin/documents');
      }
      
      await fetchDocuments();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (doc: ProjectDocument) => {
    setEditingDocument(doc);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este documento?')) return;
    
    try {
      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao excluir');
      }
      showToast('Documento removido.');
      setDocuments(documents.filter(d => d.id !== id));
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingDocument(null);
    if (searchParams.get('new')) {
      router.push('/admin/documents');
    }
  };

  const filteredDocuments = documents.filter(d => {
    const matchesSearch = d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        d.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || d.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(documents.map(d => d.category).filter(Boolean)));

  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 w-48 bg-surface-low rounded-architectural"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-48 bg-surface-low rounded-architectural"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
       {toast && (
        <div className="fixed top-6 right-6 z-50 bg-secondary text-white px-5 py-3 rounded-architectural shadow-lg flex items-center gap-2 text-sm font-body animate-[slideIn_0.3s_ease-out]">
          <CheckCircle2 size={18} />
          {toast}
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-heading text-foreground">
            {showForm 
              ? (editingDocument ? 'Editar Documento' : 'Importação Técnica') 
              : 'Documentos do Projeto'}
          </h2>
          <p className="text-sm text-tertiary font-body mt-1">
            {showForm 
              ? 'Vincule as últimas revisões de plantas e contratos.' 
              : `${documents.length} arquivos disponíveis no repositório digital.`}
          </p>
        </div>
        
        {!showForm && (
          <div className="flex items-center gap-3">
             <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary transition-colors group-focus-within:text-primary" size={16} />
              <input 
                type="text" 
                placeholder="Buscar planta, contrato..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-surface-low/50 hover:bg-surface-low focus:bg-white rounded-architectural text-sm font-body text-foreground transition-all outline-none border border-transparent focus:ring-2 focus:ring-primary/10 w-60"
              />
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white text-xs font-bold uppercase tracking-widest rounded-architectural hover:bg-primary-container transition-all shadow-lg shadow-primary/20 active:scale-95"
            >
              <Plus size={16} /> Importar Arquivo
            </button>
          </div>
        )}
      </div>

      {showForm ? (
        <DocumentForm
          initialData={editingDocument}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitting={submitting}
        />
      ) : (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 custom-scrollbar">
            <button 
              onClick={() => setSelectedCategory('ALL')}
              className={`px-4 py-2 rounded-architectural text-[10px] font-bold uppercase tracking-widest transition-all ${
                selectedCategory === 'ALL' 
                ? 'bg-primary text-white shadow-md shadow-primary/10' 
                : 'bg-surface-low text-tertiary hover:bg-surface-lowest border border-ghost-border/30'
              }`}
            >
              Todos
            </button>
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat!)}
                className={`px-4 py-2 rounded-architectural text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all ${
                  selectedCategory === cat 
                  ? 'bg-primary text-white shadow-md shadow-primary/10' 
                  : 'bg-surface-low text-tertiary hover:bg-surface-lowest border border-ghost-border/30'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <DocumentList 
            documents={filteredDocuments} 
            isAdmin={true}
            onEdit={handleEdit} 
            onDelete={handleDelete} 
          />
        </div>
      )}
    </div>
  );
}
