"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Search, Download, ExternalLink, Calendar } from 'lucide-react';
import { ExpenseWithAttachments } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ExpenseList } from '@/components/ExpenseList';

export default function ExpensesPage() {
  const categories = ["Todos", "Material", "Mão de Obra", "Projetos", "Legal", "Outros"];
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [expenses, setExpenses] = useState<ExpenseWithAttachments[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExpenses = useCallback(async () => {
    try {
      const res = await fetch('/api/expenses');
      if (res.ok) {
        const data = await res.json();
        setExpenses(data);
      }
    } catch (error) {
      console.error('Failed to fetch expenses', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const filteredExpenses = expenses.filter(exp => 
    activeCategory === "Todos" ? true : exp.category === activeCategory
  );

  if (loading) {
    return <div className="animate-pulse flex items-center justify-center min-h-[50vh] text-tertiary">Carregando extrato de obra...</div>;
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-heading text-foreground">Extrato de Obra</h2>
          <p className="text-sm text-tertiary font-body">Listagem detalhada de todos os aportes e despesas do projeto.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-surface-lowest border border-ghost-border rounded-architectural text-sm font-body text-tertiary hover:bg-surface-low transition-colors">
            <Download size={16} /> Exportar
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-surface-lowest p-2 rounded-architectural border border-ghost-border flex flex-col md:flex-row items-center gap-2">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-tertiary opacity-40" size={18} />
          <input 
            type="text" 
            placeholder="Filtrar por descrição ou fornecedor..." 
            className="w-full bg-transparent border-none pl-12 pr-4 py-3 text-sm focus:ring-0 outline-none font-body"
          />
        </div>
        <div className="h-8 w-[1px] bg-ghost-border hidden md:block" />
        <div className="flex items-center gap-1 p-1 overflow-x-auto w-full md:w-auto no-scrollbar">
          {categories.map((cat) => (
            <button 
              key={cat} 
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 text-xs font-body rounded-architectural whitespace-nowrap transition-all ${
                cat === activeCategory 
                ? "bg-primary text-white shadow-sm" 
                : "text-tertiary hover:bg-surface-low"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger */}
      <ExpenseList expenses={filteredExpenses} variant="table" />
    </div>
  );
}
