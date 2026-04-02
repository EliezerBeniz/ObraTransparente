'use client'

import React from 'react'
import ProjectSettingsForm from '@/components/project/ProjectSettingsForm'
import { Settings, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function AdminSettingsPage() {
  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <Link href="/admin/expenses" className="text-xs font-heading font-bold text-tertiary flex items-center gap-1 hover:text-primary transition-all mb-2 uppercase tracking-widest">
            <ArrowLeft size={12} /> Painel Administrador
          </Link>
          <h1 className="text-3xl font-heading font-black text-foreground tracking-tight">Configurações do Projeto</h1>
          <p className="text-tertiary font-body">Gerencie os dados globais que definem a transparência do projeto.</p>
        </div>
      </div>

      <ProjectSettingsForm />
      
      {/* Informações de Ajuda */}
      <div className="p-6 bg-surface-low rounded-architectural border border-ghost-border space-y-4">
        <h3 className="text-sm font-heading font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
           <Settings size={16} className="text-primary" /> Como estas configurações funcionam?
        </h3>
        <ul className="space-y-3">
          <li className="flex gap-3 text-sm text-secondary font-body">
            <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-[10px] font-bold">1</span>
            <span><strong>Orçamento Total:</strong> Usado para calcular o saldo restante em tempo real no Dashboard.</span>
          </li>
          <li className="flex gap-3 text-sm text-secondary font-body">
            <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-[10px] font-bold">2</span>
            <span><strong>Percentual de Conclusão:</strong> Define a barra de progresso visual vista por todos os sócios.</span>
          </li>
          <li className="flex gap-3 text-sm text-secondary font-body">
            <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-[10px] font-bold">3</span>
            <span><strong>Status Resumido:</strong> Uma descrição curta da fase atual da obra (ex: "Acabamentos internos").</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
