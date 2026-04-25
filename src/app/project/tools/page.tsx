"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ToolLending } from '@/lib/types';
import { isLendingDelayed } from '@/lib/utils';
import { Wrench, Search, Clock, CheckCircle2, User as UserIcon, Calendar, Camera } from 'lucide-react';

export default function ProjectToolsPage() {
  const [lendings, setLendings] = useState<ToolLending[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [supabase] = useState(() => createClient());

  useEffect(() => {
    const fetchTools = async () => {
      try {
        const { data, error } = await supabase
          .from('tool_lendings')
          .select(`
            *,
            worker:workers(id, name, specialty)
          `)
          .order('status', { ascending: false }) // Pendente first usually depending on alphabetical, but let's sort in JS for better control if needed, or by date
          .order('lend_date', { ascending: false });

        if (error) throw error;
        setLendings(data || []);
      } catch (error) {
        console.error('Error fetching tools:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTools();
  }, []);

  const pendingLendings = lendings.filter(l => l.status !== 'Devolvido');
  const filteredTools = pendingLendings.filter(l => {
    const term = searchTerm.toLowerCase();
    const borrower = l.worker?.name || l.borrower_name || '';
    return l.tool_description.toLowerCase().includes(term) || borrower.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-12">
        {/* Header Block (Architectural Ledger Style) */}
        <div className="border-b border-ghost-border pb-10">
          <h1 className="text-4xl font-heading text-foreground">Ferramentas da Obra</h1>
          <p className="text-tertiary font-body mt-2 max-w-2xl">
            Controle de equipamentos emprestados para a equipe do canteiro de obras.
            Apenas ferramentas pendentes ou extraviadas são exibidas aqui.
          </p>

          <div className="mt-8 flex flex-col md:flex-row gap-6 md:items-center justify-between">
             <div className="flex gap-8">
               <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-tertiary">Total Em Uso</p>
                  <p className="text-3xl font-heading mt-1">{pendingLendings.filter(l => l.status === 'Pendente').length}</p>
               </div>
               {pendingLendings.filter(l => l.status === 'Extraviado').length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-red-500">Extraviados</p>
                  <p className="text-3xl font-heading mt-1 text-red-600">{pendingLendings.filter(l => l.status === 'Extraviado').length}</p>
               </div>
               )}
             </div>

             <div className="relative w-full md:w-64">
                <input
                  type="text"
                  placeholder="Pesquisar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-surface-low rounded-architectural text-sm font-body border-none focus:ring-2 focus:ring-primary/10 transition-all outline-none"
                />
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary/50" />
             </div>
          </div>
        </div>

        {/* Content list */}
        {loading ? (
          <div className="space-y-4">
             {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-surface-low rounded-architectural animate-pulse" />
             ))}
          </div>
        ) : filteredTools.length === 0 ? (
          <div className="text-center py-20">
             <Wrench className="mx-auto text-tertiary/20 mb-4" size={48} />
             <h3 className="text-xl font-heading text-tertiary">Nenhuma ferramenta em uso</h3>
             <p className="text-sm font-body text-tertiary mt-2">Todas as ferramentas estão no quartinho.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {filteredTools.map(tool => (
               <div key={tool.id} className="group bg-surface-lowest rounded-architectural border border-ghost-border p-6 hover:shadow-xl hover:shadow-primary/5 transition-all">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-lg font-heading text-foreground group-hover:text-primary transition-colors">{tool.tool_description}</h3>
                    <div className="flex gap-2">
                      {isLendingDelayed(tool.expected_return_date, tool.status) && (
                        <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full bg-red-600 text-white animate-pulse">
                          Atrasado
                        </span>
                      )}
                      <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full ${tool.status === 'Pendente' ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'}`}>
                        {tool.status}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface-low flex items-center justify-center text-tertiary">
                        <UserIcon size={14} />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-tertiary">Com quem</p>
                        <p className="text-sm font-medium">{tool.worker?.name || tool.borrower_name || 'Desconhecido'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface-low flex items-center justify-center text-tertiary">
                        <Calendar size={14} />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-tertiary">Data Empréstimo</p>
                        <p className="text-sm">{new Date(tool.lend_date + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>

                    {tool.expected_return_date && (
                       <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface-low flex items-center justify-center text-tertiary">
                          <Clock size={14} />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold tracking-widest text-tertiary">Devol. Prevista</p>
                          <p className="text-sm">{new Date(tool.expected_return_date + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {tool.photo_links && tool.photo_links.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-ghost-border">
                       <a href={tool.photo_links[0]} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-primary font-bold uppercase tracking-widest hover:underline">
                         <Camera size={14} />
                         Ver Foto ({tool.photo_links.length})
                       </a>
                    </div>
                  )}

                  {tool.notes && (
                    <div className="mt-4 p-3 bg-surface-low rounded-architectural">
                      <p className="text-[10px] uppercase font-bold tracking-widest text-tertiary mb-1">Observações</p>
                      <p className="text-xs text-tertiary italic">{tool.notes}</p>
                    </div>
                  )}
               </div>
             ))}
          </div>
        )}
    </div>
  );
}
