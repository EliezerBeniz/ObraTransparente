'use client';

import React from 'react';
import { ExpenseForm } from '@/components/ExpenseForm';
import { ExpenseWithAttachments } from '@/lib/types';
import { X } from 'lucide-react';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  submitting: boolean;
  initialData?: ExpenseWithAttachments | null;
  prefillData?: any;
}

export function ExpenseModal({
  isOpen,
  onClose,
  onSubmit,
  submitting,
  initialData,
  prefillData
}: ExpenseModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 animate-[fadeIn_0.2s_ease-out]"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-4xl bg-surface-lowest rounded-architectural shadow-2xl overflow-hidden animate-[slideUp_0.3s_ease-out] my-auto">
        <div className="max-h-[90vh] overflow-y-auto custom-scrollbar">
          <ExpenseForm
            initialData={initialData}
            prefillData={prefillData}
            onSubmit={onSubmit}
            onCancel={onClose}
            submitting={submitting}
          />
        </div>
      </div>
    </div>
  );
}
