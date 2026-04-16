"use client";

import React, { useState } from 'react';
import { Worker } from '@/lib/types';
import { 
  Plus, 
  Search, 
  Phone, 
  Wrench, 
  DollarSign, 
  Edit3, 
  Trash2, 
  UserX, 
  UserCheck,
  MoreHorizontal
} from 'lucide-react';

interface WorkerListProps {
  workers: Worker[];
  onAdd: () => void;
  onEdit: (worker: Worker) => void;
  onPay: (worker: Worker) => void;
  onToggleStatus: (worker: Worker) => Promise<void>;
  loading: boolean;
}

export function WorkerList({ 
  workers, 
  onAdd, 
  onEdit, 
  onPay, 
  onToggleStatus, 
  loading 
}: WorkerListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'ativos' | 'inativos'>('ativos');

  const filteredWorkers = workers.filter(w => {
    const matchesSearch = w.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          w.specialty?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = activeTab === 'ativos' ? w.is_active : !w.is_active;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-lowest/50 backdrop-blur-md p-4 rounded-architectural border border-ghost-border">
        <div className="relative flex-grow max-w-md">
          <input
            type="text"
            placeholder="Buscar por nome ou especialidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface-low rounded-architectural text-sm font-body border border-transparent focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all outline-none"
          />
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary/50" />
        </div>

        <div className="flex gap-2 p-1 bg-surface-low rounded-architectural w-fit">
          <button
            onClick={() => setActiveTab('ativos')}
            className={`px-4 py-1.5 rounded-architectural text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab === 'ativos' ? 'bg-white text-primary shadow-sm' : 'text-tertiary hover:text-foreground'}`}
          >
            Ativos
          </button>
          <button
            onClick={() => setActiveTab('inativos')}
            className={`px-4 py-1.5 rounded-architectural text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab === 'inativos' ? 'bg-white text-red-500 shadow-sm' : 'text-tertiary hover:text-foreground'}`}
          >
            Inativos
          </button>
        </div>

        <button
          onClick={onAdd}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white text-xs font-bold uppercase tracking-widest rounded-architectural hover:bg-primary-container transition-all shadow-lg shadow-primary/20 active:scale-95 whitespace-nowrap"
        >
          <Plus size={16} /> Novo Profissional
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="h-48 bg-surface-low rounded-architectural animate-pulse border border-ghost-border"></div>
          ))}
        </div>
      ) : filteredWorkers.length === 0 ? (
        <div className="text-center py-20 bg-surface-low/30 rounded-architectural border border-dashed border-ghost-border">
          <div className="inline-flex p-4 bg-surface-low rounded-full mb-4 text-tertiary/20">
            <Wrench size={48} />
          </div>
          <h3 className="text-lg font-heading text-tertiary">Nenhum profissional encontrado</h3>
          <p className="text-sm text-tertiary/60 font-body mt-2">Tente ajustar sua busca ou cadastrar um novo profissional.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-[fadeIn_0.5s_ease-out]">
          {filteredWorkers.map((worker) => (
            <div 
              key={worker.id}
              className="group bg-surface-lowest hover:bg-white rounded-architectural border border-ghost-border p-6 transition-all hover:shadow-xl hover:shadow-primary/5 relative overflow-hidden"
            >
              {/* Top Accent Line */}
              <div className={`absolute top-0 left-0 w-full h-1 ${worker.is_active ? 'bg-primary/40' : 'bg-red-400/40'}`}></div>

              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-heading text-lg text-foreground group-hover:text-primary transition-colors leading-tight">
                    {worker.name}
                  </h4>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mt-2 bg-surface-low text-tertiary text-[10px] font-bold uppercase tracking-widest rounded-full group-hover:bg-primary/5 group-hover:text-primary transition-all">
                    <Wrench size={10} /> {worker.specialty}
                  </span>
                </div>
                
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => onEdit(worker)}
                    className="p-2 text-tertiary hover:text-primary hover:bg-primary/5 transition-all rounded-architectural"
                    title="Editar"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button 
                    onClick={() => onToggleStatus(worker)}
                    className={`p-2 transition-all rounded-architectural ${worker.is_active ? 'text-red-400 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}`}
                    title={worker.is_active ? "Inativar" : "Reativar"}
                  >
                    {worker.is_active ? <UserX size={16} /> : <UserCheck size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-3 mt-4">
                <div className="flex items-center gap-2.5 text-tertiary">
                  <div className="p-2 bg-surface-low rounded-architectural">
                    <Phone size={14} />
                  </div>
                  <p className="text-sm font-body">{worker.phone || '(Não informado)'}</p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-ghost-border flex items-center justify-between">
                <div className="flex -space-x-2">
                  {/* Future: Last payment date or summary could go here */}
                  <span className="text-[10px] text-tertiary uppercase tracking-widest font-bold">Histórico limpo</span>
                </div>

                {worker.is_active && (
                  <button
                    onClick={() => onPay(worker)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider rounded-architectural hover:bg-primary hover:text-white transition-all"
                  >
                    <DollarSign size={14} /> Pagar
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
