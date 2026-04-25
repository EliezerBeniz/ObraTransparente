import React from 'react';
import { ExpenseWithAttachments } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { AttachmentLinks } from './AttachmentLinks';
import { Edit3, Trash2, Users, ExternalLink } from 'lucide-react';

interface ExpenseCardProps {
  expense: ExpenseWithAttachments;
  variant?: 'compact' | 'admin';
  onEdit?: (expense: ExpenseWithAttachments) => void;
  onDelete?: (id: string) => void;
}

export function ExpenseCard({
  expense,
  variant = 'compact',
  onEdit,
  onDelete
}: ExpenseCardProps) {
  return (
    <div className="bg-surface-lowest p-5 rounded-architectural border border-ghost-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:bg-surface-low transition-colors">
      <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
        <div className={`w-2 h-2 rounded-full mt-1.5 sm:mt-0 flex-shrink-0 ${expense.status === 'Pago' ? 'bg-secondary' : 'bg-primary animate-pulse'}`} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
             <p className="text-sm font-heading text-foreground truncate">
               {expense.title}
               {expense.quantity && expense.quantity > 1 && (
                 <span className="ml-2 text-[10px] text-tertiary">({expense.quantity} un)</span>
               )}
             </p>
             {variant === 'admin' && (
               <span className="text-[9px] px-2 py-0.5 bg-surface-low text-tertiary rounded uppercase font-bold tracking-tighter flex-shrink-0">
                 {expense.category}
               </span>
             )}
          </div>
          
          <div className="flex flex-wrap items-center gap-2 mt-1">
            {variant === 'compact' && (
               <span className="text-[10px] text-tertiary bg-surface-low px-2 py-0.5 rounded uppercase tracking-tighter">
                 {expense.category}
               </span>
            )}
            <span className="text-[10px] text-tertiary font-body">
              {formatDate(expense.date)}
            </span>
          </div>
          {variant === 'admin' && (
             <p className="text-xs text-tertiary font-body truncate mt-0.5">{expense.description}</p>
          )}

          {/* New: Display Participants */}
          {expense.expense_participants && expense.expense_participants.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <Users size={12} className="text-tertiary opacity-40 shrink-0" />
              <div className="flex flex-wrap gap-1">
                {expense.expense_participants.map((p, idx) => (
                  <div 
                    key={p.id || idx} 
                    className="flex items-center gap-1.5 text-[9px] px-1.5 py-0.5 bg-secondary/10 text-secondary border border-secondary/20 rounded font-bold uppercase tracking-tight flex-shrink-0"
                    title={`Pago: ${formatCurrency(p.amount_paid)}`}
                  >
                    {p.profiles?.full_name?.split(' ')[0] || 'Sócio'} ({formatCurrency(p.amount_paid)})
                    {(p as any).receipt_url && (
                      <a 
                        href={(p as any).receipt_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-secondary/60 hover:text-secondary transition-colors"
                      >
                        <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center justify-between sm:justify-end gap-6 flex-shrink-0 border-t sm:border-t-0 border-ghost-border/30 pt-3 sm:pt-0">
        <div className="text-left sm:text-right">
          <p className="text-base sm:text-sm font-heading text-foreground tabular-nums">{formatCurrency(expense.amount)}</p>
          {variant === 'admin' && (
             <p className={`text-[10px] mt-0.5 ${expense.status === 'Pago' ? 'text-secondary' : 'text-primary font-bold'}`}>
               {expense.status}
             </p>
          )}
        </div>
        
        {variant === 'compact' && (
           <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-2">
             <AttachmentLinks attachments={expense.attachments} />
           </div>
        )}
        
        {variant === 'admin' && (
           <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {expense.attachments && expense.attachments.length > 0 && (
                <AttachmentLinks attachments={expense.attachments} />
              )}
              {onEdit && (
                <button
                  onClick={() => onEdit(expense)}
                  className="p-2 text-tertiary hover:text-primary hover:bg-primary/5 rounded-architectural transition-all"
                  title="Editar"
                >
                  <Edit3 size={16} />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(expense.id)}
                  className="p-2 text-tertiary hover:text-red-500 hover:bg-red-50 rounded-architectural transition-all"
                  title="Excluir"
                >
                  <Trash2 size={16} />
                </button>
              )}
           </div>
        )}
      </div>
    </div>
  );
}
