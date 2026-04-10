"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Search, Download, ExternalLink, Calendar, ChevronDown, FileText } from 'lucide-react';
import { ExpenseWithAttachments, Profile } from '@/lib/types';
import { formatCurrency, formatDate, exportToCSV } from '@/lib/utils';
import { ExpenseList } from '@/components/ExpenseList';
import { ReportPrintView } from '@/components/ReportPrintView';

export default function ExpensesPage() {
  const categories = ["Todos", "Material", "Mão de Obra", "Projetos", "Legal", "Outros"];
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [expenses, setExpenses] = useState<ExpenseWithAttachments[]>([]);
  const [socios, setSocios] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const fetchExpenses = useCallback(async () => {
    try {
      const [res, sociosRes] = await Promise.all([
        fetch('/api/expenses'),
        fetch('/api/socios')
      ]);
      if (res.ok) {
        const data = await res.json();
        setExpenses(data);
      }
      if (sociosRes.ok) {
        const rawSocios = await sociosRes.json();
        const sociosData = rawSocios.filter((s: any) => {
          const role = Array.isArray(s.user_roles) ? s.user_roles[0]?.role : s.user_roles?.role;
          return role !== 'convidado';
        });
        setSocios(sociosData);
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
          <div className="relative flex-1 md:flex-none">
            <button 
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white border border-transparent rounded-architectural text-sm font-heading hover:bg-primary-container transition-all shadow-sm"
            >
              <Download size={16} /> Exportar <ChevronDown size={14} className={`transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
            </button>

            {showExportMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)} />
                <div className="absolute top-full right-0 mt-2 w-56 bg-surface-lowest border border-ghost-border rounded-architectural shadow-xl z-20 py-1.5 animate-[fadeIn_0.2s_ease-out]">
                  <button
                    onClick={() => { setShowReport(true); setShowExportMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-body text-foreground hover:bg-surface-low transition-colors text-left"
                  >
                    <FileText size={16} className="text-tertiary" /> Gerar PDF (Relatório)
                  </button>
                  <button
                    onClick={() => { exportToCSV(filteredExpenses, 'extrato-obra'); setShowExportMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-body text-foreground hover:bg-surface-low transition-colors text-left border-t border-ghost-border/50"
                  >
                    <Download size={16} className="text-tertiary" /> Exportar CSV (Excel)
                  </button>
                </div>
              </>
            )}
          </div>
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

      {showReport && (
        <ReportPrintView 
          expenses={filteredExpenses} 
          socios={socios} 
          onClose={() => setShowReport(false)} 
          filtersInfo={{ 
            category: activeCategory === "Todos" ? "" : activeCategory, 
            status: "", 
            datePreset: "", 
            startDate: "", 
            endDate: "" 
          }}
        />
      )}
    </div>
  );
}
