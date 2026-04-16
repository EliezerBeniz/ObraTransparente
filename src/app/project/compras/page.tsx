"use client";

import React, { useState, useEffect } from 'react';
import { ShoppingItem } from '@/lib/types';
import PageContainer from '@/components/PageContainer';
import { ShoppingBag, Calendar, ArrowRight, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function PublicShoppingPage() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/shopping-list');
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
    } catch (error) {
      console.error('Error fetching shopping items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const pendingItems = items.filter(i => i.status === 'Pendente');
  const boughtItems = items.filter(i => i.status === 'Comprado');

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header Block */}
        <div className="border-b border-ghost-border pb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <ShoppingBag size={16} />
            <span>Previsões</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-heading text-foreground tracking-tight mb-4">
            Lista de Compras
          </h1>
          <p className="text-lg text-tertiary font-body max-w-2xl leading-relaxed">
            Acompanhe a previsão de materiais e ferramentas que precisarão ser adquiridos em breve para o andamento da obra.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-12">
            {/* Pending Section */}
            <section>
              <h2 className="text-xl font-heading text-foreground mb-6 flex items-center gap-2">
                Pendente <span className="text-sm font-body px-2 py-0.5 rounded-full bg-surface-low text-tertiary">{pendingItems.length}</span>
              </h2>
              
              {pendingItems.length === 0 ? (
                <div className="text-center p-12 border border-dashed border-ghost-border rounded-architectural bg-surface-lowest">
                  <p className="text-tertiary font-body">Nenhum item pendente de compra.</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {pendingItems.map((item) => (
                    <div key={item.id} className="p-5 rounded-architectural bg-surface-lowest border border-ghost-border hover:border-primary/30 transition-all group">
                      <div className="flex justify-between items-start mb-3">
                        <div className="space-y-1">
                          <h3 className="font-heading text-foreground text-lg">{item.title}</h3>
                          {item.category && (
                            <span className="text-xs font-mono px-2 py-0.5 bg-surface-low text-tertiary rounded">
                              {item.category}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {item.description && (
                        <p className="text-sm font-body text-tertiary mb-4 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm font-body text-tertiary pt-4 border-t border-ghost-border/50">
                        {item.quantity_text && (
                          <div className="flex items-center gap-1.5 font-medium text-foreground">
                            <span>Qtd:</span> {item.quantity_text}
                          </div>
                        )}
                        {item.estimated_amount != null && (
                          <div className="flex items-center gap-1.5 font-medium text-foreground">
                            <span>Valor Est.:</span> {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.estimated_amount)}
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 ml-auto text-primary/80">
                          <Calendar size={14} />
                          <span>Previsto: {format(new Date(item.expected_date), 'dd/MM/yyyy', { locale: ptBR })}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Bought Section */}
            {boughtItems.length > 0 && (
              <section className="pt-8 border-t border-ghost-border">
                <h2 className="text-xl font-heading text-foreground mb-6 flex items-center gap-2 opacity-60">
                  Já Comprados <span className="text-sm font-body px-2 py-0.5 rounded-full bg-surface-low text-tertiary">{boughtItems.length}</span>
                </h2>
                
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {boughtItems.map((item) => (
                    <div key={item.id} className="p-4 rounded-architectural bg-surface-lowest border border-ghost-border opacity-60">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 size={16} className="text-green-500" />
                        <h3 className="font-heading text-foreground truncate">{item.title}</h3>
                      </div>
                      {item.quantity_text && (
                        <p className="text-xs font-body text-tertiary truncate">Qtd: {item.quantity_text}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
