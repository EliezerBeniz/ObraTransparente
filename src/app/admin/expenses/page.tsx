"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Plus, CheckCircle2, Search, Filter, FileText, Download, ChevronDown } from 'lucide-react';
import { ExpenseWithAttachments, Profile } from '@/lib/types';
import { useSearchParams, useRouter } from 'next/navigation';
import { ExpenseList } from '@/components/ExpenseList';
import { ExpenseForm } from '@/components/ExpenseForm';
import { ReportPrintView } from '@/components/ReportPrintView';
import { exportToCSV } from '@/lib/utils';

export default function AdminExpensesPage() {
  const [expenses, setExpenses] = useState<ExpenseWithAttachments[]>([]);
  const [socios, setSocios] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [datePreset, setDatePreset] = useState('30'); // '', '30', '60', '90', 'custom'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showReport, setShowReport] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showForm, setShowForm] = useState(searchParams.get('new') === 'true');
  const [editingExpense, setEditingExpense] = useState<ExpenseWithAttachments | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

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

  // Sync sidebar navigation / query params with local state
  useEffect(() => {
    if (searchParams.get('new') === 'true' || searchParams.has('shoppingItemId')) {
      setShowForm(true);
      setEditingExpense(null);
    }
  }, [searchParams]);

  const prefillData = searchParams.has('shoppingItemId') ? {
    supplier: searchParams.get('description') || '',
    desc: 'Registrado via Lista de Compras',
    cat: searchParams.get('category') || 'Material',
    shopping_item_id: searchParams.get('shoppingItemId') || undefined,
    amount: searchParams.get('amount') || undefined,
    date: searchParams.get('date') || undefined
  } : null;

  const handleSubmit = async (payload: any) => {
    setSubmitting(true);
    
    try {
      let res;
      if (editingExpense) {
        res = await fetch(`/api/expenses/${editingExpense.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/expenses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao salvar despesa');
      }

      // Mark shopping item as 'Comprado' if linked
      if (payload.shopping_item_id) {
        await fetch(`/api/shopping-list/${payload.shopping_item_id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Comprado' })
        }).catch(err => console.error('Failed to update shopping item status', err));
      }

      showToast(editingExpense ? 'Despesa atualizada com sucesso!' : 'Nova despesa cadastrada!');
      setShowForm(false);
      setEditingExpense(null);
      
      // Clean up the URL if we were on ?new=true
      if (searchParams.get('new') || searchParams.has('shoppingItemId')) {
        router.push('/admin/expenses');
      }
      
      await fetchExpenses();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (expense: ExpenseWithAttachments) => {
    setEditingExpense(expense);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta despesa?')) return;
    
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao excluir');
      }
      showToast('Despesa removida.');
      setExpenses(expenses.filter(e => e.id !== id));
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingExpense(null);
    if (searchParams.get('new') || searchParams.has('shoppingItemId')) {
      router.push('/admin/expenses');
    }
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter ? expense.status === statusFilter : true;
    const matchesCategory = categoryFilter ? expense.category === categoryFilter : true;
    
    let matchesDate = true;
    if (datePreset && datePreset !== 'custom') {
      const days = parseInt(datePreset, 10);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      const expenseDate = new Date(expense.date);
      matchesDate = expenseDate >= cutoff;
    } else if (datePreset === 'custom') {
      const expenseDate = new Date(expense.date);
      if (startDate) {
        matchesDate = matchesDate && expenseDate >= new Date(startDate);
      }
      if (endDate) {
        matchesDate = matchesDate && expenseDate <= new Date(endDate);
      }
    }

    return matchesSearch && matchesStatus && matchesCategory && matchesDate;
  });

  const uniqueCategories = Array.from(new Set(expenses.map(e => e.category))).filter(Boolean).sort();
  const uniqueStatuses = Array.from(new Set(expenses.map(e => e.status))).filter(Boolean).sort();

  if (loading) {
    return <div className="animate-pulse flex space-x-4">Carregando dados...</div>;
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-secondary text-white px-5 py-3 rounded-architectural shadow-lg flex items-center gap-2 text-sm font-body animate-[slideIn_0.3s_ease-out]">
          <CheckCircle2 size={18} />
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-heading text-foreground">
            {showForm 
              ? (editingExpense ? 'Editar Registro' : 'Nova Inclusão') 
              : 'Gerenciar Despesas'}
          </h2>
          <p className="text-sm text-tertiary font-body mt-1">
            {showForm 
              ? 'Preencha os dados abaixo com atenção.' 
              : 'Cadastre, edite ou remova lançamentos financeiros da obra.'}
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-architectural text-sm font-heading hover:bg-primary-container transition-all shadow-sm active:scale-95"
          >
            <Plus size={16} /> Nova Despesa
          </button>
        )}
      </div>

      {showForm && (
        <ExpenseForm
          initialData={editingExpense}
          prefillData={prefillData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitting={submitting}
        />
      )}

      {/* Expenses List Component extracted - Only show when NOT in form mode */}
      {!showForm && (
        <div className="bg-surface-lowest rounded-architectural border border-ghost-border shadow-sm">
          <div className="px-6 py-4 bg-surface-low/30 border-b border-ghost-border flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="flex items-center gap-4 w-full md:w-auto pb-1 md:pb-0">
               <p className="text-xs text-tertiary font-body whitespace-nowrap">{filteredExpenses.length} despesas</p>
               
               <div className="relative">
                 <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-primary text-white rounded-architectural text-[11px] font-heading hover:bg-primary-container transition-all shadow-sm shrink-0"
                 >
                    <Download size={14} /> Exportar <ChevronDown size={12} className={`transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
                 </button>

                 {showExportMenu && (
                   <>
                     <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)} />
                     <div className="absolute top-full right-0 mt-2 w-48 bg-surface-lowest border border-ghost-border rounded-architectural shadow-xl z-20 py-1.5 animate-[fadeIn_0.2s_ease-out]">
                       <button
                         onClick={() => { setShowReport(true); setShowExportMenu(false); }}
                         className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-body text-foreground hover:bg-surface-low transition-colors text-left"
                       >
                         <FileText size={14} className="text-tertiary" /> Exportar PDF (Relatório)
                       </button>
                       <button
                         onClick={() => { exportToCSV(filteredExpenses, 'gastos-obra-admin'); setShowExportMenu(false); }}
                         className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-body text-foreground hover:bg-surface-low transition-colors text-left border-t border-ghost-border/50"
                       >
                         <Download size={14} className="text-tertiary" /> Exportar CSV (Excel)
                       </button>
                     </div>
                   </>
                 )}
               </div>
            </div>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full md:w-auto md:justify-end">
              <button
                onClick={() => setCategoryFilter(categoryFilter === 'Mão de Obra' ? '' : 'Mão de Obra')}
                className={`px-3 py-2 rounded-architectural text-[10px] font-bold uppercase tracking-wider transition-all border ${
                  categoryFilter === 'Mão de Obra'
                    ? 'bg-primary/10 border-primary/20 text-primary'
                    : 'bg-surface-low border-ghost-border text-tertiary hover:border-tertiary/30'
                }`}
              >
                Filtrar Pedreiros
              </button>
              <div className="relative flex-grow sm:flex-grow-0 sm:min-w-[200px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary opacity-50" />
                <input
                  type="text"
                  placeholder="Buscar por título..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-ghost-border rounded-architectural text-xs font-body text-foreground focus:ring-1 focus:ring-primary/20 outline-none transition-all placeholder:text-tertiary/40"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="py-2 pl-3 pr-8 bg-white border border-ghost-border rounded-architectural text-xs font-body text-foreground focus:ring-1 focus:ring-primary/20 outline-none appearance-none"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%23a1a1aa\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")', backgroundPosition: 'right .5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
              >
                <option value="">Todas as categorias</option>
                {uniqueCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="py-2 pl-3 pr-8 bg-white border border-ghost-border rounded-architectural text-xs font-body text-foreground focus:ring-1 focus:ring-primary/20 outline-none appearance-none"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%23a1a1aa\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")', backgroundPosition: 'right .5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
              >
                <option value="">Todos os status</option>
                {uniqueStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <select
                value={datePreset}
                onChange={(e) => setDatePreset(e.target.value)}
                className="py-2 pl-3 pr-8 bg-white border border-ghost-border rounded-architectural text-xs font-body text-foreground focus:ring-1 focus:ring-primary/20 outline-none appearance-none"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%23a1a1aa\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")', backgroundPosition: 'right .5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
              >
                <option value="30">Últimos 30 dias</option>
                <option value="60">Últimos 60 dias</option>
                <option value="90">Últimos 90 dias</option>
                <option value="">Todo o período</option>
                <option value="custom">Personalizado...</option>
              </select>
              {datePreset === 'custom' && (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="py-2 px-3 bg-white border border-ghost-border rounded-architectural text-xs font-body text-foreground focus:ring-1 focus:ring-primary/20 outline-none"
                  />
                  <span className="text-tertiary text-xs">até</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="py-2 px-3 bg-white border border-ghost-border rounded-architectural text-xs font-body text-foreground focus:ring-1 focus:ring-primary/20 outline-none"
                  />
                </div>
              )}
            </div>
          </div>
          <ExpenseList 
            expenses={filteredExpenses} 
            variant="admin-cards" 
            onEdit={handleEdit} 
            onDelete={handleDelete} 
          />
        </div>
      )}

      {showReport && (
        <ReportPrintView 
          expenses={filteredExpenses} 
          socios={socios} 
          onClose={() => setShowReport(false)} 
          filtersInfo={{ category: categoryFilter, status: statusFilter, datePreset, startDate, endDate }}
        />
      )}
    </div>
  );
}
