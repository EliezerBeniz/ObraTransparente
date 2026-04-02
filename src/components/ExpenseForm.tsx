import React, { useState, useEffect } from 'react';
import { Save, X, UserPlus, Users, Trash2, Equal } from 'lucide-react';
import { ExpenseWithAttachments, Profile } from '@/lib/types';

interface ExpenseFormProps {
  initialData?: ExpenseWithAttachments | null;
  onSubmit: (payload: any) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
}

const categories = ["Material", "Mão de Obra", "Projetos", "Legal", "Outros"];

export function ExpenseForm({
  initialData,
  onSubmit,
  onCancel,
  submitting
}: ExpenseFormProps) {
  const [form, setForm] = useState({
    date: '',
    supplier: '',
    desc: '',
    amount: '',
    cat: 'Material',
    status: 'Pendente',
    quantity: '1',
    link: ''
  });

  const [socios, setSocios] = useState<Profile[]>([]);
  const [participants, setParticipants] = useState<{ user_id: string, amount_paid: number }[]>([]);

  useEffect(() => {
    fetch('/api/socios')
      .then(res => res.json())
      .then(data => setSocios(data))
      .catch(err => console.error('Error fetching socios:', err));
  }, []);

  useEffect(() => {
    if (initialData) {
      setForm({
        date: initialData.date,
        supplier: initialData.title,
        desc: initialData.description || '',
        amount: initialData.amount.toString(),
        cat: initialData.category,
        status: initialData.status,
        quantity: initialData.quantity?.toString() || '1',
        link: initialData.attachments?.[0]?.file_url || '',
      });

      if (initialData.expense_participants) {
        setParticipants(initialData.expense_participants.map(p => ({
          user_id: p.user_id,
          amount_paid: p.amount_paid
        })));
      }
    }
  }, [initialData]);

  const addParticipant = () => {
    if (socios.length > 0) {
      setParticipants([...participants, { user_id: socios[0].id, amount_paid: 0 }]);
    }
  };

  const removeParticipant = (index: number) => {
    setParticipants(participants.filter((_, i) => i !== index));
  };

  const updateParticipant = (index: number, field: string, value: any) => {
    const newParticipants = [...participants];
    newParticipants[index] = { ...newParticipants[index], [field]: value };
    setParticipants(newParticipants);
  };

  const splitEqually = () => {
    const total = parseFloat(form.amount) || 0;
    if (participants.length === 0 || total === 0) return;
    
    const equalShare = parseFloat((total / participants.length).toFixed(2));
    const newParticipants = participants.map((p, i) => ({
      ...p,
      amount_paid: i === participants.length - 1 
        ? parseFloat((total - (equalShare * (participants.length - 1))).toFixed(2))
        : equalShare
    }));
    setParticipants(newParticipants);
  };

  const totalPaid = participants.reduce((acc, p) => acc + (p.amount_paid || 0), 0);
  const isValid = Math.abs(totalPaid - (parseFloat(form.amount) || 0)) < 0.01 && participants.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: form.supplier,
      description: form.desc,
      amount: parseFloat(form.amount),
      date: form.date,
      category: form.cat,
      status: form.status,
      quantity: parseFloat(form.quantity) || 1,
      file_url: form.link || null,
      label: 'Comprovante',
      participants: participants.map(p => ({
        user_id: p.user_id,
        amount_paid: p.amount_paid
      }))
    };
    await onSubmit(payload);
  };

  return (
    <div className="bg-surface-lowest rounded-architectural p-8 border border-ghost-border shadow-sm animate-[fadeIn_0.2s_ease-out]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-heading text-foreground">
          {initialData ? 'Editar Despesa' : 'Nova Despesa'}
        </h3>
        <button type="button" onClick={onCancel} className="text-tertiary hover:text-foreground transition-colors">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-tertiary font-bold block">Data</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full bg-surface-low border-none rounded-architectural px-4 py-3 text-sm font-body text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-tertiary font-bold block">Fornecedor / Título</label>
            <input
              type="text"
              value={form.supplier}
              onChange={(e) => setForm({ ...form, supplier: e.target.value })}
              placeholder="Nome do fornecedor"
              className="w-full bg-surface-low border-none rounded-architectural px-4 py-3 text-sm font-body text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-tertiary/40"
              required
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-tertiary font-bold block">Descrição</label>
            <input
              type="text"
              value={form.desc}
              onChange={(e) => setForm({ ...form, desc: e.target.value })}
              placeholder="Descrição detalhada da despesa"
              className="w-full bg-surface-low border-none rounded-architectural px-4 py-3 text-sm font-body text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-tertiary/40"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-tertiary font-bold block">Qtd</label>
              <input
                type="number"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                placeholder="1"
                min="0.01"
                step="any"
                className="w-full bg-surface-low border-none rounded-architectural px-4 py-3 text-sm font-body text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-tertiary/40"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-tertiary font-bold block">Valor Total (R$)</label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="0,00"
                step="0.01"
                min="0"
                className="w-full bg-surface-low border-none rounded-architectural px-4 py-3 text-sm font-body text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-tertiary/40"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-tertiary font-bold block">Categoria</label>
            <select
              value={form.cat}
              onChange={(e) => setForm({ ...form, cat: e.target.value })}
              className="w-full bg-surface-low border-none rounded-architectural px-4 py-3 text-sm font-body text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-tertiary font-bold block">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full bg-surface-low border-none rounded-architectural px-4 py-3 text-sm font-body text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none"
            >
              <option value="Pendente">Pendente</option>
              <option value="Pago">Pago</option>
            </select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-[10px] uppercase tracking-widest text-tertiary font-bold block">
              Link do Comprovante (Google Drive)
            </label>
            <input
              type="url"
              value={form.link}
              onChange={(e) => setForm({ ...form, link: e.target.value })}
              placeholder="https://drive.google.com/..."
              className="w-full bg-surface-low border-none rounded-architectural px-4 py-3 text-sm font-body text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-tertiary/40"
            />
          </div>

          {/* Sócio Selection Logic */}
          <div className="md:col-span-2 pt-4 border-t border-ghost-border space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[10px] uppercase tracking-widest text-tertiary font-bold flex items-center gap-2">
                <Users size={14} /> Quem pagou? (Sócios)
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={splitEqually}
                  className="flex items-center gap-1 px-3 py-1.5 bg-surface-low text-tertiary hover:text-foreground rounded-architectural text-[10px] transition-all uppercase tracking-wider font-bold"
                >
                  <Equal size={12} /> Sugerir Divisão Igual
                </button>
                <button
                  type="button"
                  onClick={addParticipant}
                  disabled={socios.length === 0}
                  className="flex items-center gap-1 px-3 py-1.5 bg-secondary/10 text-secondary hover:bg-secondary hover:text-white rounded-architectural text-[10px] transition-all uppercase tracking-wider font-bold disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <UserPlus size={12} /> Adicionar Sócio
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {participants.map((p, idx) => (
                <div key={idx} className="flex flex-col md:flex-row items-center gap-3 animate-[slideIn_0.2s_ease-out]">
                  <select
                    value={p.user_id}
                    onChange={(e) => updateParticipant(idx, 'user_id', e.target.value)}
                    className="flex-grow bg-surface-low border-none rounded-architectural px-4 py-3 text-sm font-body text-foreground focus:ring-2 focus:ring-secondary/20 outline-none transition-all appearance-none"
                  >
                    {socios.map(s => (
                      <option key={s.id} value={s.id}>{s.full_name || 'Usuário sem nome'}</option>
                    ))}
                  </select>
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-grow md:w-40">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-tertiary text-xs">R$</span>
                      <input
                        type="number"
                        value={p.amount_paid}
                        onChange={(e) => updateParticipant(idx, 'amount_paid', parseFloat(e.target.value) || 0)}
                        placeholder="0,00"
                        step="0.01"
                        className="w-full bg-surface-low border-none rounded-architectural pl-10 pr-4 py-3 text-sm font-body text-foreground focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeParticipant(idx)}
                      className="p-3 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-architectural transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              
              {participants.length === 0 && (
                <div className="text-center py-6 bg-surface-low/50 rounded-architectural border border-dashed border-ghost-border">
                  <p className="text-xs text-tertiary italic">
                    {socios.length === 0 
                      ? "Nenhum sócio encontrado no sistema. Verifique os perfis cadastrados." 
                      : 'Nenhum sócio selecionado. Clique em "Adicionar Sócio".'}
                  </p>
                </div>
              )}

              <div className="flex justify-between items-center p-4 bg-surface-low/30 rounded-architectural border border-ghost-border">
                <p className="text-xs font-body text-tertiary">Total informado pelos sócios:</p>
                <div className="text-right">
                  <p className={`text-sm font-heading ${isValid ? 'text-secondary' : 'text-red-500'}`}>
                    R$ {totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  {!isValid && (
                    <p className="text-[10px] text-red-400 italic">
                      A soma deve ser R$ {(parseFloat(form.amount) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-ghost-border">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 text-sm font-body text-tertiary hover:text-foreground transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting || !isValid}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-architectural text-sm font-heading hover:bg-primary-container transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            <Save size={16} />
            {initialData ? 'Salvar Alterações' : 'Cadastrar Despesa'}
          </button>
        </div>
      </form>
    </div>
  );
}
