'use client';

import React from 'react';
import { AdvanceForm } from './AdvanceForm';
import { Profile } from '@/lib/types';
import { X } from 'lucide-react';

interface AdvanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  socios: Profile[];
  onSubmit: (data: any) => Promise<void>;
  submitting: boolean;
  initialData?: any;
}

export function AdvanceModal({
  isOpen,
  onClose,
  socios,
  onSubmit,
  submitting,
  initialData
}: AdvanceModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 animate-[fadeIn_0.2s_ease-out]"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-surface-lowest rounded-architectural shadow-2xl overflow-hidden animate-[slideUp_0.3s_ease-out]">
        <AdvanceForm
          socios={socios}
          onSubmit={onSubmit}
          onCancel={onClose}
          submitting={submitting}
          initialData={initialData}
        />
      </div>
    </div>
  );
}
