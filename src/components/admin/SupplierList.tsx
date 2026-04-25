"use client";

import React from 'react';
import { Supplier } from '@/lib/types';
import { Edit2, Trash2, Phone, Mail, User, Info } from 'lucide-react';

interface SupplierListProps {
  suppliers: Supplier[];
  onEdit: (supplier: Supplier) => void;
  onDelete: (id: string) => void;
}

export function SupplierList({ suppliers, onEdit, onDelete }: SupplierListProps) {
  if (suppliers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-12 h-12 bg-surface-low rounded-architectural flex items-center justify-center text-tertiary mb-3">
          <Store size={24} />
        </div>
        <p className="text-sm font-body text-tertiary">Nenhum fornecedor cadastrado ainda.</p>
      </div>
    );
  }

  return (
    <div className="divide-y-0 space-y-4 p-6">
      {suppliers.map((supplier) => (
        <div 
          key={supplier.id}
          className="group relative bg-surface-lowest hover:bg-surface-low/50 transition-all rounded-architectural p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          {/* Company Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-heading text-foreground truncate">{supplier.name}</h3>
              {supplier.category && (
                <span className="px-2 py-0.5 bg-secondary/10 text-secondary text-[10px] font-bold uppercase tracking-wider rounded-full">
                  {supplier.category}
                </span>
              )}
            </div>
            
            <div className="flex flex-wrap gap-4 mt-2">
              {supplier.contact_name && (
                <div className="flex items-center gap-1.5 text-xs text-tertiary font-body">
                  <User size={12} className="text-primary/60" />
                  {supplier.contact_name}
                </div>
              )}
              {supplier.contact_phone && (
                <div className="flex items-center gap-1.5 text-xs text-tertiary font-body">
                  <Phone size={12} className="text-primary/60" />
                  {supplier.contact_phone}
                </div>
              )}
              {supplier.contact_email && (
                <div className="flex items-center gap-1.5 text-xs text-tertiary font-body">
                  <Mail size={12} className="text-primary/60" />
                  {supplier.contact_email}
                </div>
              )}
            </div>

            {supplier.description && (
              <p className="mt-3 text-xs text-tertiary font-body leading-relaxed line-clamp-2 max-w-2xl">
                {supplier.description}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(supplier)}
              className="p-2 text-tertiary hover:text-primary hover:bg-white rounded-architectural transition-all shadow-sm border border-transparent hover:border-ghost-border"
              title="Editar"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => onDelete(supplier.id)}
              className="p-2 text-tertiary hover:text-red-500 hover:bg-red-50 rounded-architectural transition-all shadow-sm border border-transparent hover:border-red-100"
              title="Excluir"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

import { Store } from 'lucide-react';
