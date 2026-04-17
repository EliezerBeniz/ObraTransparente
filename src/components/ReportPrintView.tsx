import React, { useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ExpenseWithAttachments, Profile } from '@/lib/types';
import { calculateProjectBalance, Advance } from '@/lib/finance';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ArrowRightLeft, Printer, X } from 'lucide-react';

interface ReportPrintViewProps {
  expenses: ExpenseWithAttachments[];
  socios: Profile[];
  advances: Advance[];
  onClose: () => void;
  filtersInfo: {
    category: string;
    status: string;
    datePreset: string;
    startDate: string;
    endDate: string;
  };
}

export function ReportPrintView({ expenses, socios, advances, onClose, filtersInfo }: ReportPrintViewProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const balance = useMemo(() => calculateProjectBalance(expenses, socios, advances), [expenses, socios, advances]);

  const totalPaid = useMemo(() => 
    expenses.filter(e => e.status === 'Pago').reduce((sum, e) => sum + Number(e.amount), 0),
    [expenses]
  );

  const totalPending = useMemo(() => 
    expenses.filter(e => e.status === 'Pendente').reduce((sum, e) => sum + Number(e.amount), 0),
    [expenses]
  );

  const totalGeral = totalPaid + totalPending;

  const filteredAdvances = useMemo(() => {
    return advances.filter(adv => {
      if (!filtersInfo.startDate && !filtersInfo.endDate) return true;
      const advDate = new Date(adv.date);
      if (filtersInfo.startDate && advDate < new Date(filtersInfo.startDate)) return false;
      if (filtersInfo.endDate && advDate > new Date(filtersInfo.endDate)) return false;
      return true;
    });
  }, [advances, filtersInfo.startDate, filtersInfo.endDate]);

  const handlePrint = () => {
    window.print();
  };

  const formattedPreset = () => {
    const shortDate = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
    if (filtersInfo.datePreset === 'custom') {
      return `${shortDate(filtersInfo.startDate)} a ${shortDate(filtersInfo.endDate)}`;
    }
    const presets: Record<string, string> = {
      '30': 'Últimos 30 dias',
      '60': 'Últimos 60 dias',
      '90': 'Últimos 90 dias'
    };
    return presets[filtersInfo.datePreset] || 'Todo o período';
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-surface-lowest/80 backdrop-blur-sm print:bg-white print:overflow-visible print:absolute report-print-wrapper">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
          
          /* Hide EVERYTHING under body first */
          body > * {
            display: none !important;
          }
          
          /* Show ONLY our portal container */
          body > .report-print-wrapper {
            display: block !important;
            position: relative !important;
            width: 100% !important;
            height: auto !important;
            min-height: auto !important;
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
          }

          .print-container {
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            height: auto !important;
            min-height: auto !important;
            position: relative !important;
          }
        }
      `}} />
      
      {/* Container aligned mostly like a paper page */}
      <div className="min-h-screen bg-white text-black md:max-w-4xl mx-auto md:my-8 shadow-2xl print:shadow-none print:max-w-full print:m-0 print:p-0 print-container">
        
        {/* ACTION BAR - HIDDEN ON PRINT */}
        <div className="sticky top-0 bg-surface-low border-b border-ghost-border p-4 flex justify-between items-center print:hidden rounded-t-lg">
          <h2 className="font-heading text-lg text-foreground">Visualização de Relatório</h2>
          <div className="flex gap-2">
             <button onClick={handlePrint} className="flex gap-2 items-center px-4 py-2 bg-primary text-white rounded-architectural text-sm font-heading hover:bg-primary/90">
               <Printer size={16} /> Imprimir / Salvar PDF
             </button>
             <button onClick={onClose} className="p-2 border border-ghost-border rounded-architectural hover:bg-surface-lowest text-foreground">
               <X size={16} />
             </button>
          </div>
        </div>

        {/* PRINT CONTENT START */}
        <div className="p-8 md:p-12 print:p-4 bg-white">
           <div className="mb-8 border-b-2 border-black pb-4 flex flex-col md:flex-row justify-between md:items-end gap-4">
             <div>
               <h1 className="text-3xl font-heading font-bold uppercase mb-2">Relatório de Despesas</h1>
               <p className="text-sm">Emitido em: {new Date().toLocaleDateString('pt-BR')} {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
             </div>
             <div className="text-left md:text-right text-sm">
               <p><strong>Status:</strong> {filtersInfo.status || 'Todos'}</p>
               <p><strong>Categoria:</strong> {filtersInfo.category || 'Todas'}</p>
               <p><strong>Período:</strong> {formattedPreset()}</p>
             </div>
           </div>

           <section className="mb-10">
             <h2 className="text-lg font-bold uppercase border-b border-gray-300 pb-2 mb-4">Resumo Financeiro do Período</h2>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 border border-gray-400 rounded">
                  <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Total Pago (Realizado)</p>
                  <p className="text-xl font-bold text-green-700">{formatCurrency(totalPaid)}</p>
                </div>
                <div className="p-4 border border-gray-400 rounded">
                  <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Total Pendente (Projetado)</p>
                  <p className="text-xl font-bold text-amber-700">{formatCurrency(totalPending)}</p>
                </div>
                <div className="p-4 border border-gray-400 rounded bg-gray-50">
                  <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Total Geral (Filtrado)</p>
                  <p className="text-xl font-bold">{formatCurrency(totalGeral)}</p>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="p-4 border border-black rounded bg-gray-50">
                  <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Base para Acerto de Contas</p>
                  <p className="text-2xl font-bold">{formatCurrency(balance.totalProject)}</p>
                  <p className="text-[10px] text-gray-500 mt-1 italic">* Inclui despesas pendentes neste relatório.</p>
                </div>
                <div className="p-4 border border-gray-400 rounded">
                  <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Cota Ideal por Sócio</p>
                  <p className="text-2xl font-bold">{formatCurrency(balance.avgPerSocio)}</p>
                </div>
             </div>

             {/* Participants Balance for period */}
             <div className="space-y-4">
                <h3 className="font-bold text-sm uppercase">Participação no Custo Total (Incluso Pendentes)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {balance.socioBalances.map(socio => (
                    <div key={socio.id} className="p-3 border border-gray-300 rounded text-sm flex flex-col justify-between">
                       <div className="flex justify-between items-center mb-2 font-bold">
                         <span>{socio.name}</span>
                         <span className={socio.net >= 0 ? "text-green-700" : "text-red-700"}>
                           {socio.net >= 0 ? '+' : ''}{formatCurrency(socio.net)}
                         </span>
                       </div>
                       <div className="flex justify-between text-xs text-gray-600 mb-1">
                         <span>Já Pago: {formatCurrency(socio.paid)}</span>
                         <span>Meta Total: {formatCurrency(socio.expected)}</span>
                       </div>
                    </div>
                  ))}
                </div>
             </div>

            {/* Settlements for period */}
            {balance.instructions.length > 0 && (
             <div className="mt-6 p-4 bg-gray-100 rounded border border-gray-300">
                <h3 className="font-bold text-sm uppercase mb-3 flex gap-2 items-center"><ArrowRightLeft size={16} /> Estimativa de Acerto de Contas</h3>
                <div className="space-y-2">
                  {balance.instructions.map((ins, i) => (
                    <div key={i} className="flex justify-between items-center text-sm py-1 border-b border-gray-200 last:border-0 pl-1">
                      <span><strong>{ins.fromName}</strong> deve pagar</span>
                      <span className="font-bold">{formatCurrency(ins.amount)}</span>
                      <span>para <strong>{ins.toName}</strong></span>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-gray-500 mt-4 italic">
                  Nota: Este acerto considera que todos os valores pendentes listados serão pagos conforme o valor informado.
                </p>
             </div>
            )}
           </section>

           <section>
             <h2 className="text-lg font-bold uppercase border-b border-gray-300 pb-2 mb-4">Detalhamento das Despesas ({expenses.length})</h2>
             <table className="w-full text-left text-sm border-collapse">
               <thead>
                 <tr className="border-b-2 border-gray-400">
                   <th className="py-2">Data</th>
                   <th className="py-2">Cat.</th>
                   <th className="py-2">Descrição</th>
                   <th className="py-2">Status</th>
                   <th className="py-2 text-right">Valor Total</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-300">
                 {expenses.map(expense => (
                   <tr key={expense.id}>
                     <td className="py-2 pr-2 whitespace-nowrap text-xs">
                       {new Date(expense.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                     </td>
                     <td className="py-2 pr-2 text-xs">{expense.category}</td>
                     <td className="py-2 pr-2">
                        {expense.title}
                        {expense.quantity && expense.quantity > 1 && ` (${expense.quantity} un)`}
                     </td>
                     <td className="py-2 pr-2 text-xs">{expense.status}</td>
                     <td className="py-2 text-right font-medium">{formatCurrency(expense.amount)}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </section>

           <section className="mt-12">
             <h2 className="text-lg font-bold uppercase border-b border-gray-300 pb-2 mb-4">Detalhamento dos Aportes ({filteredAdvances.length})</h2>
             {filteredAdvances.length > 0 ? (
               <table className="w-full text-left text-sm border-collapse">
                 <thead>
                   <tr className="border-b-2 border-gray-400">
                     <th className="py-2">Data</th>
                     <th className="py-2">Sócio</th>
                     <th className="py-2">Descrição</th>
                     <th className="py-2 text-right">Valor</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-300">
                   {filteredAdvances.map(advance => (
                     <tr key={advance.id}>
                       <td className="py-2 pr-2 whitespace-nowrap text-xs">
                         {new Date(advance.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                       </td>
                       <td className="py-2 pr-2 text-[12px]">{socios.find(s => s.id === advance.user_id)?.full_name || 'Sócio'}</td>
                       <td className="py-2 pr-2 text-[12px]">{advance.description || 'Aporte para o caixa'}</td>
                       <td className="py-2 text-right font-medium">{formatCurrency(advance.amount)}</td>
                     </tr>
                   ))}
                   <tr className="border-t-2 border-black font-bold">
                     <td colSpan={3} className="py-2 text-right uppercase text-xs">Total de Aportes no Período:</td>
                     <td className="py-2 text-right">{formatCurrency(filteredAdvances.reduce((sum, a) => sum + Number(a.amount), 0))}</td>
                   </tr>
                 </tbody>
               </table>
             ) : (
               <p className="text-sm text-gray-500 italic">Nenhum aporte registrado para este período.</p>
             )}
           </section>

           <div className="text-xs text-center text-gray-500 mt-12 pt-4 border-t border-gray-300 print:block">
             Gerado através do Sistema de Transparência
           </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
