import React from 'react';
import { ExpenseWithAttachments } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { AttachmentLinks } from './AttachmentLinks';
import { ExpenseCard } from './ExpenseCard';
import { Calendar, Users, Link as LinkIcon } from 'lucide-react';

interface ExpenseListProps {
  expenses: ExpenseWithAttachments[];
  variant?: 'table' | 'cards' | 'admin-cards';
  onEdit?: (expense: ExpenseWithAttachments) => void;
  onDelete?: (id: string) => void;
  limit?: number;
}

export function ExpenseList({
  expenses,
  variant = 'table',
  onEdit,
  onDelete,
  limit
}: ExpenseListProps) {
  const displayExpenses = limit ? expenses.slice(0, limit) : expenses;

  if (displayExpenses.length === 0) {
    return (
      <div className="px-6 py-8 text-center text-tertiary font-body text-sm bg-surface-lowest rounded-architectural border border-ghost-border">
        Nenhuma despesa encontrada.
      </div>
    );
  }

  // Admin Cards Variant
  if (variant === 'admin-cards') {
    return (
      <div className="divide-y divide-ghost-border/10">
        {displayExpenses.map((expense) => (
          <ExpenseCard 
            key={expense.id} 
            expense={expense} 
            variant="admin" 
            onEdit={onEdit} 
            onDelete={onDelete} 
          />
        ))}
      </div>
    );
  }

  // Simple Stacked (compact) Cards Variant
  if (variant === 'cards') {
    return (
      <div className="space-y-3 no-border-gap">
        {displayExpenses.map((expense) => (
          <ExpenseCard key={expense.id} expense={expense} variant="compact" />
        ))}
      </div>
    );
  }

  // Table Variant (for Public Ledger) + Mobile Card Fallback
  return (
    <div className="space-y-4">
      {/* Mobile Card View (Hidden on Tablet/Desktop) */}
      <div className="md:hidden space-y-3">
        {displayExpenses.map((expense) => (
          <ExpenseCard key={expense.id} expense={expense} variant="compact" />
        ))}
      </div>

      {/* Desktop Table View (Hidden on Mobile) */}
      <div className="hidden md:block bg-surface-lowest rounded-architectural border border-ghost-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-low/50 border-b border-ghost-border">
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-tertiary font-bold">Data</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-tertiary font-bold">Categoria</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-tertiary font-bold">Fornecedor / Descrição</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-tertiary font-bold">Status</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-tertiary font-bold text-right">Valor Total</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-tertiary font-bold text-center">Anexo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ghost-border/10">
              {displayExpenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-surface-low/30 transition-colors group">
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-foreground font-body">
                      <Calendar size={14} className="text-tertiary opacity-40" />
                      {formatDate(expense.date)}
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] px-2 py-1 bg-surface-low text-tertiary rounded uppercase font-bold tracking-tighter w-fit">
                        {expense.category}
                      </span>
                      {expense.project_phases?.title && (
                        <span className="text-[9px] px-2 py-0.5 bg-primary/5 text-primary border border-primary/10 rounded uppercase font-medium tracking-tight w-fit">
                          {expense.project_phases.title}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-heading text-foreground group-hover:text-primary transition-colors">
                        {expense.title}
                        {expense.quantity && expense.quantity > 1 && (
                          <span className="ml-2 text-[10px] text-tertiary">({expense.quantity} un)</span>
                        )}
                      </span>
                      <div className="flex flex-col gap-1 mt-1">
                        {expense.description && (
                          <p className="text-[11px] text-tertiary font-body leading-relaxed max-w-md">
                            {expense.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-1.5 mt-0.5">
                          {expense.expense_participants && expense.expense_participants.length > 0 ? (
                            expense.expense_participants.map((p, pIdx) => (
                              <div key={p.id || pIdx} className="flex items-center gap-1 bg-surface-low border border-ghost-border px-1.5 py-0.5 rounded">
                                <Users size={10} className="text-tertiary opacity-40 shrink-0" />
                                <span className="text-[9px] font-bold text-tertiary uppercase tracking-tight" title={formatCurrency(p.amount_paid)}>
                                  {p.profiles?.full_name?.split(' ')[0] || 'Sócio'} ({formatCurrency(p.amount_paid)})
                                </span>
                                {(p as any).receipt_url && (
                                  <a 
                                    href={(p as any).receipt_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-primary hover:text-primary-container transition-colors ml-0.5"
                                    title="Ver Comprovante"
                                  >
                                    <LinkIcon size={10} />
                                  </a>
                                )}
                              </div>
                            ))
                          ) : !expense.description && (
                            <span className="text-[10px] text-tertiary font-body italic opacity-40">Lançamento anterior</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                       <div className={`w-1.5 h-1.5 rounded-full ${expense.status === 'Pago' ? 'bg-secondary' : 'bg-primary animate-pulse'}`} />
                       <span className={`text-[11px] font-body ${expense.status === 'Pago' ? 'text-secondary' : 'text-primary font-bold'}`}>
                        {expense.status}
                       </span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right whitespace-nowrap">
                    <span className="text-sm font-heading text-foreground tabular-nums">
                      {formatCurrency(expense.amount)}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <AttachmentLinks attachments={expense.attachments} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-4 bg-surface-low/30 border-t border-ghost-border flex items-center justify-between">
          <p className="text-xs text-tertiary font-body">Mostrando {displayExpenses.length} lançamentos encontrados.</p>
        </div>
      </div>
    </div>
  );
}
