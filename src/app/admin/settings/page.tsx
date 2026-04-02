"use client";

import React, { useEffect, useState } from 'react';
import { Save, CheckCircle2, Building, DollarSign, Percent, History, Plus, Trash2, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [phases, setPhases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addingPhase, setAddingPhase] = useState(false);
  const [newPhase, setNewPhase] = useState({ title: '', description: '', phase_date: new Date().toISOString().split('T')[0] });
  const [toast, setToast] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [settingsRes, phasesRes] = await Promise.all([
        fetch('/api/settings'),
        fetch('/api/phases')
      ]);

      if (settingsRes.ok) {
        setSettings(await settingsRes.json());
      }
      if (phasesRes.ok) {
        setPhases(await phasesRes.json());
      }
    } catch (error) {
      console.error('Failed to fetch settings/phases', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (!res.ok) throw new Error('Falha ao salvar configurações');

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setToast('Configurações globais atualizadas!');
      setTimeout(() => setToast(null), 3000);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddPhase = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingPhase(true);
    try {
      const res = await fetch('/api/phases', {
        method: 'POST',
        body: JSON.stringify(newPhase),
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error('Falha ao adicionar etapa');
      
      setToast('Etapa adicionada ao histórico!');
      setNewPhase({ title: '', description: '', phase_date: new Date().toISOString().split('T')[0] });
      await fetchData();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setAddingPhase(false);
    }
  };

  const handleDeletePhase = async (id: string) => {
    if (!confirm('Excluir esta etapa do histórico?')) return;
    try {
      const res = await fetch(`/api/phases/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Falha ao excluir etapa');
      setToast('Etapa removida.');
      await fetchData();
    } catch (error: any) {
      alert(error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!settings) {
    return <div className="p-8 text-red-500">Erro ao carregar configurações.</div>;
  }

  return (
    <div className="max-w-2xl space-y-8 animate-[fadeIn_0.4s_ease-out]">
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-secondary text-white px-5 py-3 rounded-architectural shadow-lg flex items-center gap-2 text-sm font-body animate-[slideIn_0.3s_ease-out]">
          <CheckCircle2 size={18} />
          {toast}
        </div>
      )}

      <div>
        <h2 className="text-2xl font-heading text-foreground">Configurações do Projeto</h2>
        <p className="text-sm text-tertiary font-body mt-1">Gerencie as informações globais que aparecem no dashboard público.</p>
      </div>

      <form onSubmit={handleSave} className="bg-surface-lowest p-8 rounded-architectural border border-ghost-border space-y-8 shadow-sm">
        <div className="space-y-3">
          <label className="text-xs font-heading text-tertiary uppercase tracking-wider flex items-center gap-2">
            <Building size={14} className="text-primary" /> Nome do Projeto
          </label>
          <input
            type="text"
            className="w-full bg-surface-low border border-ghost-border rounded-architectural p-3 text-sm font-body focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-tertiary/40"
            value={settings.project_name}
            onChange={(e) => setSettings({ ...settings, project_name: e.target.value })}
            placeholder="Ex: Edifício Horizonte"
            required
          />
          <p className="text-[10px] text-tertiary italic">Este nome aparecerá no cabeçalho do dashboard público.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
          <div className="space-y-3">
            <label className="text-xs font-heading text-tertiary uppercase tracking-wider flex items-center gap-2">
              <DollarSign size={14} className="text-secondary" /> Orçamento Total (R$)
            </label>
            <input
              type="number"
              className="w-full bg-surface-low border border-ghost-border rounded-architectural p-3 text-sm font-body focus:ring-1 focus:ring-secondary outline-none transition-all"
              value={settings.total_budget}
              onChange={(e) => setSettings({ ...settings, total_budget: Number(e.target.value) })}
              required
            />
            <p className="text-[10px] text-tertiary leading-relaxed italic">
              Este valor é o aporte total planejado. O <strong>Saldo em Conta</strong> será calculado como: (Orçamento - Despesas Pagas).
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-heading text-tertiary uppercase tracking-wider flex items-center gap-2">
              <Percent size={14} className="text-primary" /> Progresso da Obra
            </label>
            <input
              type="number"
              min="0"
              max="100"
              className="w-full bg-surface-low border border-ghost-border rounded-architectural p-3 text-sm font-body focus:ring-1 focus:ring-primary outline-none transition-all"
              value={settings.completion_percentage}
              onChange={(e) => setSettings({ ...settings, completion_percentage: Number(e.target.value) })}
              required
            />
            <p className="text-[10px] text-tertiary italic">Valor numérico de 0 a 100 para a barra de progresso.</p>
          </div>
        </div>

        <div className="pt-6 border-t border-ghost-border flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-architectural text-sm font-heading hover:bg-primary-container disabled:opacity-50 transition-all shadow-sm active:scale-95"
          >
            {saving ? 'Processando...' : <><Save size={18} /> Aplicar Configurações Globais</>}
          </button>
        </div>
      </form>

      {/* Timeline Section */}
      <div className="space-y-6 pt-10 border-t border-ghost-border">
        <div>
          <h3 className="text-xl font-heading text-foreground flex items-center gap-3">
            <History className="text-primary" size={24} /> 
            Linha do Tempo de Etapas
          </h3>
          <p className="text-sm text-tertiary font-body mt-1">Registre a evolução da obra. O registro mais recente será a "Etapa Atual".</p>
        </div>

        {/* Add New Phase Form */}
        <form onSubmit={handleAddPhase} className="bg-surface-lowest p-6 rounded-architectural border border-ghost-border grid grid-cols-1 md:grid-cols-2 gap-4 shadow-sm">
          <div className="space-y-2">
            <label className="text-[10px] font-heading text-tertiary uppercase">Título da Etapa</label>
            <input
              type="text"
              placeholder="Ex: Alvenaria do 3º Piso"
              className="w-full bg-surface-low border border-ghost-border rounded-architectural p-2.5 text-xs font-body outline-none focus:ring-1 focus:ring-primary"
              value={newPhase.title}
              onChange={e => setNewPhase({...newPhase, title: e.target.value})}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-heading text-tertiary uppercase">Data do Marco</label>
            <input
              type="date"
              className="w-full bg-surface-low border border-ghost-border rounded-architectural p-2.5 text-xs font-body outline-none focus:ring-1 focus:ring-primary"
              value={newPhase.phase_date}
              onChange={e => setNewPhase({...newPhase, phase_date: e.target.value})}
              required
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-[10px] font-heading text-tertiary uppercase">Descrição Detalhada</label>
            <textarea
              placeholder="Descreva o que foi concluído..."
              className="w-full bg-surface-low border border-ghost-border rounded-architectural p-2.5 text-xs font-body outline-none focus:ring-1 focus:ring-primary min-h-[80px]"
              value={newPhase.description}
              onChange={e => setNewPhase({...newPhase, description: e.target.value})}
            />
          </div>
          <div className="flex items-end md:col-span-2">
            <button
              type="submit"
              disabled={addingPhase}
              className="w-full flex items-center justify-center gap-2 bg-secondary text-white py-3 rounded-architectural text-xs font-heading hover:bg-secondary/90 transition-all active:scale-95"
            >
              <Plus size={16} /> {addingPhase ? 'Adicionando...' : 'Adicionar ao Histórico do Projeto'}
            </button>
          </div>
        </form>

        {/* Phase List */}
        <div className="bg-surface-lowest rounded-architectural border border-ghost-border overflow-hidden">
          <div className="divide-y divide-ghost-border">
            {phases.map((phase) => (
              <div key={phase.id} className="p-6 hover:bg-surface-low/30 transition-colors flex justify-between items-start gap-4">
                <div className="flex gap-4">
                  <div className="bg-primary/10 p-2 rounded-full h-fit mt-1">
                    <Calendar size={14} className="text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-body text-tertiary">{formatDate(phase.phase_date)}</span>
                      <h4 className="text-sm font-heading text-foreground">{phase.title}</h4>
                    </div>
                    {phase.description && (
                      <p className="text-xs font-body text-tertiary mt-1 leading-relaxed">{phase.description}</p>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => handleDeletePhase(phase.id)}
                  className="text-red-500 hover:text-red-600 p-1 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {phases.length === 0 && (
              <div className="p-10 text-center text-sm text-tertiary font-body italic">
                Nenhuma etapa registrada ainda.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
