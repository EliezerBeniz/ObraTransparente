"use client";

import React, { useState } from 'react';
import { ToolLending } from '@/lib/types';
import { 
  Plus, 
  Search, 
  Wrench, 
  Edit3, 
  Trash2,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Camera
} from 'lucide-react';

interface ToolLendingListProps {
  lendings: ToolLending[];
  onAdd: () => void;
  onEdit: (lending: ToolLending) => void;
  onDelete: (id: string) => Promise<void>;
  loading: boolean;
}

export function ToolLendingList({ 
  lendings, 
  onAdd, 
  onEdit, 
  onDelete, 
  loading 
}: ToolLendingListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeStatus, setActiveStatus] = useState<string>('todos');

  const filteredLendings = lendings.filter(l => {
    const term = searchTerm.toLowerCase();
    const borrower = l.worker?.name || l.borrower_name || '';
    const matchesSearch = l.tool_description.toLowerCase().includes(term) || 
                          borrower.toLowerCase().includes(term);
    const matchesStatus = activeStatus === 'todos' || l.status.toLowerCase() === activeStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Devolvido': return 'bg-green-100 text-green-700';
      case 'Extraviado': return 'bg-red-100 text-red-700';
      default: return 'bg-orange-100 text-orange-700'; // Pendente
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Devolvido': return <CheckCircle2 size={12} />;
      case 'Extraviado': return <AlertCircle size={12} />;
      default: return <Wrench size={12} />;
    }
  };

  const isOverdue = (lending: ToolLending) => {
    if (lending.status !== 'Pendente' || !lending.expected_return_date) return false;
    const today = new Date();
    today.setHours(0,0,0,0);
    const expected = new Date(lending.expected_return_date);
    // Add 1 day to expected to match localized date comparisons usually
    expected.setDate(expected.getDate() + 1);
    return expected < today;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-lowest/50 backdrop-blur-md p-4 rounded-architectural border border-ghost-border">
        <div className="relative flex-grow max-w-md">
          <input
            type="text"
            placeholder="Buscar ferramenta ou responsável..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface-low rounded-architectural text-sm font-body border border-transparent focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all outline-none"
          />
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary/50" />
        </div>

        <div className="flex gap-2 p-1 bg-surface-low rounded-architectural w-fit overflow-x-auto">
          {['todos', 'pendente', 'devolvido', 'extraviado'].map(status => (
            <button
              key={status}
              onClick={() => setActiveStatus(status)}
              className={`px-4 py-1.5 rounded-architectural text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${activeStatus === status ? 'bg-white text-primary shadow-sm' : 'text-tertiary hover:text-foreground'}`}
            >
              {status}
            </button>
          ))}
        </div>

        <button
          onClick={onAdd}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white text-xs font-bold uppercase tracking-widest rounded-architectural hover:bg-primary-container transition-all shadow-lg shadow-primary/20 active:scale-95 whitespace-nowrap"
        >
          <Plus size={16} /> Novo Empréstimo
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="h-48 bg-surface-low rounded-architectural animate-pulse border border-ghost-border"></div>
          ))}
        </div>
      ) : filteredLendings.length === 0 ? (
        <div className="text-center py-20 bg-surface-low/30 rounded-architectural border border-dashed border-ghost-border">
          <div className="inline-flex p-4 bg-surface-low rounded-full mb-4 text-tertiary/20">
            <Wrench size={48} />
          </div>
          <h3 className="text-lg font-heading text-tertiary">Nenhum empréstimo encontrado</h3>
          <p className="text-sm text-tertiary/60 font-body mt-2">Dê o primeiro passo e cadastre o controle das suas ferramentas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-[fadeIn_0.5s_ease-out]">
          {filteredLendings.map((lending) => (
            <div 
              key={lending.id}
              className={`group bg-surface-lowest hover:bg-white rounded-architectural border ${isOverdue(lending) ? 'border-red-200' : 'border-ghost-border'} p-6 transition-all hover:shadow-xl hover:shadow-primary/5 relative overflow-hidden`}
            >
              {/* Top Accent Line */}
              <div className={`absolute top-0 left-0 w-full h-1 ${isOverdue(lending) ? 'bg-red-400/40' : lending.status === 'Devolvido' ? 'bg-green-400/40' : 'bg-primary/40'}`}></div>

              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-heading text-lg text-foreground group-hover:text-primary transition-colors leading-tight">
                    {lending.tool_description}
                  </h4>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded-full ${getStatusColor(lending.status)}`}>
                      {getStatusIcon(lending.status)} {lending.status}
                    </span>
                    {isOverdue(lending) && (
                      <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider flex items-center gap-1">
                        <AlertCircle size={10} /> Atrasado
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => onEdit(lending)}
                    className="p-2 text-tertiary hover:text-primary hover:bg-primary/5 transition-all rounded-architectural"
                    title="Editar"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button 
                    onClick={() => {
                        if (confirm(`Excluir o registro da ferramenta ${lending.tool_description}?`)) {
                            onDelete(lending.id);
                        }
                    }}
                    className="p-2 text-tertiary hover:text-red-500 hover:bg-red-50 transition-all rounded-architectural"
                    title="Excluir"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-3 mt-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-tertiary text-xs uppercase tracking-widest font-bold">Responsável</span>
                  <span className="font-medium text-foreground">
                    {lending.worker?.name || lending.borrower_name || 'Não informado'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-tertiary text-xs uppercase tracking-widest font-bold">Empréstimo</span>
                  <span className="text-foreground">
                    {new Date(lending.lend_date + 'T12:00:00').toLocaleDateString('pt-BR')}
                  </span>
                </div>
                {(lending.expected_return_date || lending.actual_return_date) && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-tertiary text-xs uppercase tracking-widest font-bold">
                      {lending.actual_return_date ? 'Retorno (Real)' : 'Retorno (Previsto)'}
                    </span>
                    <span className={`${isOverdue(lending) && !lending.actual_return_date ? 'text-red-500 font-medium' : 'text-foreground'}`}>
                      {lending.actual_return_date 
                        ? new Date(lending.actual_return_date + 'T12:00:00').toLocaleDateString('pt-BR')
                        : new Date(lending.expected_return_date! + 'T12:00:00').toLocaleDateString('pt-BR')
                      }
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-ghost-border flex items-center justify-between">
                <div className="flex -space-x-2">
                   {lending.photo_links && lending.photo_links.length > 0 ? (
                      <div className="flex items-center gap-1.5 text-[10px] text-tertiary font-bold uppercase tracking-widest">
                        <Camera size={14} /> {lending.photo_links.length} {lending.photo_links.length === 1 ? 'Foto' : 'Fotos'}
                      </div>
                   ) : (
                      <span className="text-[10px] text-tertiary uppercase tracking-widest font-bold">Sem fotos</span>
                   )}
                </div>

                {lending.status === 'Pendente' && (
                  <button
                    onClick={() => onEdit({...lending, status: 'Devolvido', actual_return_date: new Date().toISOString().split('T')[0]})}
                    className="flex items-center gap-1.5 px-4 py-2 bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-wider rounded-architectural hover:bg-green-100 transition-all border border-green-200"
                  >
                    <CheckCircle2 size={14} /> Devolver
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
