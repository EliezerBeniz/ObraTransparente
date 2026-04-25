"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Search, Download, ExternalLink, Calendar, ChevronDown, FileText } from 'lucide-react';
import { ExpenseWithAttachments, Profile } from '@/lib/types';
import { formatCurrency, formatDate, exportToCSV } from '@/lib/utils';
import { ExpenseList } from '@/components/ExpenseList';
import { ReportPrintView } from '@/components/ReportPrintView';
import { InvestmentChart } from '@/components/InvestmentChart';
import { Advance } from '@/lib/finance';

export default function ExpensesPage() {
  const categories = ["Todos", "Material", "Equipamento", "Mão de Obra", "Projetos", "Legal", "Outros"];
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [expenses, setExpenses] = useState<ExpenseWithAttachments[]>([]);
  const [socios, setSocios] = useState<Profile[]>([]);
  const [advances, setAdvances] = useState<Advance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [datePreset, setDatePreset] = useState(""); // '', '30', '60', '90', 'custom'
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const fetchExpenses = useCallback(async () => {
    try {
      const [res, sociosRes, advancesRes] = await Promise.all([
        fetch('/api/expenses'),
        fetch('/api/socios'),
        fetch('/api/advances')
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
      if (advancesRes.ok) {
        setAdvances(await advancesRes.json());
      }
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const filteredExpenses = expenses.filter(exp => {
    const matchesCategory = activeCategory === "Todos" ? true : exp.category === activeCategory;
    const matchesSearch = exp.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (exp.supplier && exp.supplier.name && exp.supplier.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    let matchesDate = true;
    if (datePreset && datePreset !== 'custom') {
      const days = parseInt(datePreset, 10);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      const expenseDate = new Date(exp.date);
      matchesDate = expenseDate >= cutoff;
    } else if (datePreset === 'custom') {
      const expenseDate = new Date(exp.date);
      if (startDate) {
        matchesDate = matchesDate && expenseDate >= new Date(startDate);
      }
      if (endDate) {
        matchesDate = matchesDate && expenseDate <= new Date(endDate);
      }
    }

    return matchesCategory && matchesSearch && matchesDate;
  });

  const filteredAdvances = advances.filter(adv => {
    let matchesDate = true;
    if (datePreset && datePreset !== 'custom') {
      const days = parseInt(datePreset, 10);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      const advDate = new Date(adv.date);
      matchesDate = advDate >= cutoff;
    } else if (datePreset === 'custom') {
      const advDate = new Date(adv.date);
      if (startDate) {
        matchesDate = matchesDate && advDate >= new Date(startDate);
      }
      if (endDate) {
        matchesDate = matchesDate && advDate <= new Date(endDate);
      }
    }
    return matchesDate;
  });

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
      <div className="bg-surface-lowest p-6 rounded-architectural border border-ghost-border shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-tertiary opacity-40" size={18} />
            <input 
              type="text" 
              placeholder="Filtrar por descrição ou fornecedor..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-low border-none pl-12 pr-4 py-3 text-sm rounded-architectural focus:ring-2 focus:ring-primary/10 outline-none font-body text-foreground"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <select
              value={datePreset}
              onChange={(e) => setDatePreset(e.target.value)}
              className="bg-surface-low border-none py-3 pl-4 pr-10 text-xs font-body text-foreground rounded-architectural focus:ring-2 focus:ring-primary/10 outline-none appearance-none"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%23a1a1aa\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")', backgroundPosition: 'right .75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
            >
              <option value="">Todo o período</option>
              <option value="30">Últimos 30 dias</option>
              <option value="60">Últimos 60 dias</option>
              <option value="90">Últimos 90 dias</option>
              <option value="custom">Período personalizado...</option>
            </select>
          </div>
        </div>

        {datePreset === 'custom' && (
          <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-ghost-border animate-[fadeIn_0.2s_ease-out]">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-tertiary">De</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-surface-low border-none px-3 py-2 text-xs font-body text-foreground rounded-architectural focus:ring-2 focus:ring-primary/10 outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-tertiary">Até</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-surface-low border-none px-3 py-2 text-xs font-body text-foreground rounded-architectural focus:ring-2 focus:ring-primary/10 outline-none"
              />
            </div>
          </div>
        )}

        <div className="h-[1px] w-full bg-ghost-border" />
        
        <div className="flex items-center gap-1 overflow-x-auto w-full no-scrollbar pb-1">
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

      {/* Investment Chart */}
      <InvestmentChart 
        expenses={filteredExpenses} 
        socios={socios} 
        advances={filteredAdvances} 
        title="Evolução do Investimento por Sócio"
      />

      {/* Ledger */}
      <div className="bg-surface-lowest rounded-architectural border border-ghost-border shadow-sm overflow-hidden">
        <ExpenseList expenses={filteredExpenses} variant="table" />
      </div>

      {showReport && (
        <ReportPrintView 
          expenses={filteredExpenses} 
          socios={socios} 
          advances={advances}
          onClose={() => setShowReport(false)} 
          filtersInfo={{ 
            category: activeCategory === "Todos" ? "" : activeCategory, 
            status: "", 
            datePreset, 
            startDate, 
            endDate 
          }}
        />
      )}
    </div>
  );
}
