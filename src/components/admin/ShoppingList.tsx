import React, { useState } from 'react';
import { ShoppingItem } from '@/lib/types';
import { Plus, Search, Edit2, Trash2, Clock, CheckCircle2, XCircle, ShoppingBag, ArrowRight } from 'lucide-react';

interface ShoppingListProps {
  items: ShoppingItem[];
  onAdd: () => void;
  onEdit: (item: ShoppingItem) => void;
  onDelete: (id: string) => void;
  onTransform: (item: ShoppingItem) => void;
  loading: boolean;
}

export default function ShoppingList({ items, onAdd, onEdit, onDelete, onTransform, loading }: ShoppingListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'Todos' | 'Pendente' | 'Comprado' | 'Cancelado'>('Todos');

  if (loading) {
    return <div className="text-center py-12 text-tertiary animate-pulse font-body">Carregando lista de compras...</div>;
  }

  const filteredItems = items.filter(i => {
    const matchesSearch = i.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (i.description?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'Todos' || i.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {['Todos', 'Pendente', 'Comprado', 'Cancelado'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status as any)}
              className={`px-4 py-2 rounded-full text-xs font-heading tracking-wide transition-all ${
                filterStatus === status 
                  ? 'bg-foreground text-background shadow-md' 
                  : 'bg-surface hover:bg-surface-hover text-tertiary'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ghost-icon" size={16} />
            <input 
              type="text"
              placeholder="Buscar item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-architectural border border-ghost-border bg-surface text-sm focus:outline-none focus:border-tertiary transition-colors w-full md:w-64 font-body"
            />
          </div>
          <button 
            onClick={onAdd}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-architectural transition-colors font-heading text-sm whitespace-nowrap shadow-sm"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Nova Previsão</span>
          </button>
        </div>
      </div>

      {/* List */}
      {filteredItems.length === 0 ? (
         <div className="text-center py-16 bg-surface-lowest rounded-architectural border border-ghost-border">
          <ShoppingBag className="mx-auto text-ghost-icon mb-3" size={32} />
          <p className="text-tertiary font-body">Nenhum item encontrado.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map(item => {
            const isPending = item.status === 'Pendente';
            const isLate = isPending && new Date(item.expected_date) < new Date();

            return (
              <div key={item.id} className="bg-surface-lowest border border-ghost-border rounded-architectural p-5 flex flex-col hover:border-tertiary transition-colors group relative">
                
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  {item.status === 'Comprado' && <CheckCircle2 className="text-green-500" size={20} />}
                  {item.status === 'Cancelado' && <XCircle className="text-red-500" size={20} />}
                  {item.status === 'Pendente' && <Clock className={isLate ? "text-red-500" : "text-amber-500"} size={20} />}
                </div>

                <div className="flex-1">
                  <h3 className="font-heading text-lg text-foreground pr-8 mb-1 leading-tight">{item.title}</h3>
                  {item.category && <span className="text-[10px] font-heading uppercase tracking-wider text-tertiary bg-surface px-2 py-0.5 rounded backdrop-blur-sm">{item.category}</span>}

                  <div className="mt-4 space-y-2 text-sm font-body">
                    {item.quantity_text && (
                      <div className="flex items-start gap-2 text-secondary">
                        <span className="font-medium min-w-[70px]">Qtd:</span>
                        <span>{item.quantity_text}</span>
                      </div>
                    )}
                    {item.estimated_amount != null && (
                      <div className="flex items-start gap-2 text-secondary">
                        <span className="font-medium min-w-[70px]">Valor Est.:</span>
                        <span>
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.estimated_amount)}
                        </span>
                      </div>
                    )}
                    <div className="flex items-start gap-2 text-secondary">
                      <span className="font-medium min-w-[70px]">Para:</span>
                      <span className={isLate ? "text-red-500 font-medium" : ""}>
                        {new Date(item.expected_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                        {isLate && " (Atrasado)"}
                      </span>
                    </div>
                    {item.description && (
                      <div className="mt-3 text-tertiary text-xs border-l-2 border-ghost-border pl-2">
                        {item.description}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between pt-4 border-t border-ghost-border">
                  <div className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                     <button 
                        onClick={() => onEdit(item)}
                        className="p-1.5 text-tertiary hover:text-foreground transition-colors"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => {
                          if(window.confirm('Tem certeza que deseja excluir?')) onDelete(item.id);
                        }}
                        className="p-1.5 text-tertiary hover:text-red-500 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                  </div>
                  
                  {isPending && (
                    <button 
                      onClick={() => onTransform(item)}
                      className="flex items-center gap-1.5 text-xs font-heading uppercase tracking-wide text-primary hover:text-primary/80 transition-colors"
                    >
                      Registrar Compra <ArrowRight size={14} />
                    </button>
                  )}
                  {item.status === 'Comprado' && (
                    <span className="text-xs font-heading tracking-wide text-green-600/80">Concluído</span>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
