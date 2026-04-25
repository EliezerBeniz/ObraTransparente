import React, { useState, useEffect } from 'react';
import { Save, X, UserPlus, Users, Trash2, Equal, Wallet, Link } from 'lucide-react';
import { ExpenseWithAttachments, Profile } from '@/lib/types';

interface ExpenseFormProps {
  initialData?: ExpenseWithAttachments | null;
  prefillData?: {
    supplier?: string;
    desc?: string;
    cat?: string;
    shopping_item_id?: string;
    amount?: string;
    date?: string;
  } | null;
  onSubmit: (payload: any) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
}

const categories = ["Material", "Mão de Obra", "Projetos", "Legal", "Outros"];

export function ExpenseForm({
  initialData,
  prefillData,
  onSubmit,
  onCancel,
  submitting
}: ExpenseFormProps) {
  const [form, setForm] = useState({
    date: '',
    supplier: '',
    desc: '',
    amount: '',
    unitPrice: '',
    cat: 'Material',
    status: 'Pendente',
    quantity: '1',
    file_url: '',
    phase_id: ''
  });

  const [phases, setPhases] = useState<{id: string, title: string}[]>([]);

  const [socios, setSocios] = useState<Profile[]>([]);
  const [participants, setParticipants] = useState<{ user_id: string; amount_paid: number; receipt_url?: string }[]>([]);
  const [paidFromFund, setPaidFromFund] = useState(false);

  useEffect(() => {
    fetch('/api/socios')
      .then(res => res.json())
      .then(data => {
        const filtered = data.filter((s: any) => {
          const role = Array.isArray(s.user_roles) ? s.user_roles[0]?.role : s.user_roles?.role;
          return role !== 'convidado';
        });
        setSocios(filtered);
      })
      .catch(err => console.error('Error fetching socios:', err));

    fetch('/api/phases')
      .then(res => res.json())
      .then(data => {
        setPhases(data);
        // Se estiver criando nova despesa (sem initialData), 
        // pré-seleciona a etapa que estiver em andamento
        if (!initialData) {
          const inProgress = data.find((p: any) => p.status === 'in_progress');
          if (inProgress) {
            setForm(prev => ({ ...prev, phase_id: inProgress.id }));
          }
        }
      })
      .catch(err => console.error('Error fetching phases:', err));
  }, []);

  useEffect(() => {
    if (initialData) {
      setForm({
        date: initialData.date,
        supplier: initialData.title,
        desc: initialData.description || '',
        amount: initialData.amount.toString(),
        unitPrice: initialData.quantity ? (initialData.amount / initialData.quantity).toFixed(2) : initialData.amount.toString(),
        cat: initialData.category,
        status: initialData.status,
        quantity: initialData.quantity?.toString() || '1',
        file_url: initialData.attachments?.[0]?.file_url || '',
        phase_id: initialData.phase_id || '',
      });

      if (initialData.expense_participants) {
        setParticipants(initialData.expense_participants.map(p => ({
          user_id: p.user_id,
          amount_paid: Number(p.amount_paid),
          receipt_url: p.receipt_url || ''
        })));
      }

      if (initialData.paid_from_fund) {
        setPaidFromFund(true);
      } else {
        setPaidFromFund(false);
      }
    } else if (prefillData) {
      setForm(prev => ({
        ...prev,
        supplier: prefillData.supplier || '',
        desc: prefillData.desc || '',
        cat: prefillData.cat || 'Material',
        amount: prefillData.amount || '',
        unitPrice: prefillData.amount || '',
        date: prefillData.date || prev.date,
      }));
    }
  }, [initialData, prefillData]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setForm(prev => {
      const q = parseFloat(val) || 0;
      const u = parseFloat(prev.unitPrice) || 0;
      return { 
        ...prev, 
        quantity: val, 
        amount: (q * u) > 0 ? (q * u).toFixed(2) : prev.amount 
      };
    });
  };

  const handleUnitPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setForm(prev => {
      const u = parseFloat(val) || 0;
      const q = parseFloat(prev.quantity) || 0;
      return { 
        ...prev, 
        unitPrice: val, 
        amount: (q * u) > 0 ? (q * u).toFixed(2) : prev.amount 
      };
    });
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setForm(prev => {
      const a = parseFloat(val) || 0;
      const q = parseFloat(prev.quantity) || 1;
      return { 
        ...prev, 
        amount: val, 
        unitPrice: q > 0 ? (a / q).toFixed(2) : prev.unitPrice 
      };
    });
  };

  const addParticipant = () => {
    if (socios.length === 0) return;
    
    // Pega o ID do último sócio na lista de participantes
    const lastUserId = participants.length > 0 ? participants[participants.length - 1].user_id : null;
    
    let nextSocio;
    if (!lastUserId) {
      nextSocio = socios[0];
    } else {
      const lastIdx = socios.findIndex(s => s.id === lastUserId);
      // Tenta pegar o próximo sócio da lista. Se for o último, repete o último.
      const nextIdx = lastIdx + 1 < socios.length ? lastIdx + 1 : lastIdx;
      nextSocio = socios[nextIdx];
    }

    setParticipants([...participants, { user_id: nextSocio.id, amount_paid: 0, receipt_url: '' }]);
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

  const isValidUrl = (url: string) => {
    return /^https?:\/\/(drive|docs)\.google\.com\//.test(url || '');
  };

  const totalPaid = participants.reduce((acc, p) => acc + (p.amount_paid || 0), 0);
  const isPaid = form.status === 'Pago';
  
  const isValid = paidFromFund
    ? (parseFloat(form.amount) > 0 && (!isPaid || isValidUrl(form.file_url)))
    : (Math.abs(totalPaid - (parseFloat(form.amount) || 0)) < 0.01 && 
       participants.length > 0 && 
       (!isPaid || participants.every(p => isValidUrl(p.receipt_url || ''))));

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
      label: 'Comprovante',
      shopping_item_id: prefillData?.shopping_item_id || null,
      paid_from_fund: paidFromFund,
      file_url: paidFromFund ? form.file_url : undefined,
      participants: paidFromFund ? [] : participants.map(p => ({
        user_id: p.user_id,
        amount_paid: p.amount_paid,
        receipt_url: p.receipt_url
      })),
      phase_id: form.phase_id || null
    };
    await onSubmit(payload);
  };

  return (
    <div className="w-full bg-surface-lowest p-0 animate-[fadeIn_0.2s_ease-out]">
      <div className="flex items-center justify-between mb-6 px-8 pt-8">
        <h3 className="text-lg font-heading text-foreground">
          {initialData ? 'Editar Despesa' : 'Nova Despesa'}
        </h3>
        <button type="button" onClick={onCancel} className="text-tertiary hover:text-foreground transition-colors">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 px-8 pb-8">
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
            <textarea
              value={form.desc}
              onChange={(e) => setForm({ ...form, desc: e.target.value })}
              placeholder="Descrição detalhada da despesa"
              className="w-full bg-surface-low border-none rounded-architectural px-4 py-3 text-sm font-body text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-tertiary/40 min-h-[100px] resize-y"
              required
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:col-span-2">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-tertiary font-bold block">Qtd</label>
              <input
                type="number"
                value={form.quantity}
                onChange={handleQuantityChange}
                placeholder="1"
                min="0.01"
                step="any"
                className="w-full bg-surface-low border-none rounded-architectural px-4 py-3 text-sm font-body text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-tertiary/40"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-tertiary font-bold block">Preço Un. (R$)</label>
              <input
                type="number"
                value={form.unitPrice}
                onChange={handleUnitPriceChange}
                placeholder="0,00"
                step="0.01"
                min="0"
                className="w-full bg-surface-low border-none rounded-architectural px-4 py-3 text-sm font-body text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-tertiary/40"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-tertiary font-bold block">Valor Total (R$)</label>
              <input
                type="number"
                value={form.amount}
                onChange={handleAmountChange}
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

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-tertiary font-bold block">Etapa da Obra</label>
            <select
              value={form.phase_id}
              onChange={(e) => setForm({ ...form, phase_id: e.target.value })}
              className="w-full bg-surface-low border-none rounded-architectural px-4 py-3 text-sm font-body text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none"
            >
              <option value="">Nenhuma Etapa Vinculada</option>
              {phases.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>



          {/* Payment Method Toggle */}
          <div className="md:col-span-2 pt-4 border-t border-ghost-border space-y-4">
            {/* Fund toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  const newState = !paidFromFund;
                  setPaidFromFund(newState);
                  // Auto-add first socio if switching to participants and list is empty
                  if (!newState && participants.length === 0 && socios.length > 0) {
                    setParticipants([{ user_id: socios[0].id, amount_paid: 0, receipt_url: '' }]);
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-architectural text-sm font-heading transition-all border ${
                  paidFromFund
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-surface-low text-tertiary border-ghost-border hover:text-foreground'
                }`}
              >
                <Wallet size={14} />
                Pago pelo Caixa da Obra
              </button>
              {paidFromFund ? (
                <p className="text-xs text-tertiary font-body">
                  Esta despesa será debitada do fundo de adiantamentos.
                </p>
              ) : (
                <p className="text-xs text-tertiary font-body">
                  Selecione os sócios que realizaram o pagamento.
                </p>
              )}
            </div>

            {paidFromFund && (
              <div className="w-full mt-2 animate-[slideIn_0.2s_ease-out]">
                <label className="text-[10px] uppercase tracking-widest text-tertiary font-bold block mb-2">
                  Comprovante (Link Drive) {isPaid && <span className="text-red-400 opacity-70">(Obrigatório)</span>}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-tertiary"><Link size={14} /></span>
                  <input
                    type="url"
                    value={form.file_url}
                    onChange={(e) => setForm({ ...form, file_url: e.target.value })}
                    placeholder="https://drive.google.com/..."
                    className="w-full bg-surface-low border border-ghost-border rounded-architectural pl-10 pr-4 py-3 text-sm font-body text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-tertiary/40"
                    required={isPaid}
                  />
                </div>
              </div>
            )}

            {!paidFromFund && (
            <div className="space-y-4">
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
                  <div key={idx} className="flex flex-col gap-3 p-4 bg-surface-low/30 rounded-architectural border border-ghost-border animate-[slideIn_0.2s_ease-out]">
                    <div className="flex items-center gap-3 w-full">
                      <select
                        value={p.user_id}
                        onChange={(e) => updateParticipant(idx, 'user_id', e.target.value)}
                        className="flex-grow bg-surface-low border-none rounded-architectural px-4 py-3 text-sm font-body text-foreground focus:ring-2 focus:ring-secondary/20 outline-none transition-all appearance-none w-full md:w-auto"
                      >
                        {socios.map(s => (
                          <option key={s.id} value={s.id}>{s.full_name || 'Usuário sem nome'}</option>
                        ))}
                      </select>
                      
                      <div className="relative w-full md:w-32">
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

                    <div className="w-full relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-tertiary"><Link size={14} /></span>
                      <input
                        type="url"
                        value={p.receipt_url || ''}
                        onChange={(e) => updateParticipant(idx, 'receipt_url', e.target.value)}
                        placeholder={isPaid ? "Link do comprovante (Obrigatório)" : "Link do comprovante (Opcional p/ Pendente)"}
                        className="w-full bg-surface-lowest border border-ghost-border rounded-architectural pl-10 pr-4 py-2.5 text-sm font-body text-foreground focus:ring-2 focus:ring-secondary/20 outline-none transition-all placeholder:text-tertiary/40"
                        required={isPaid}
                      />
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
                  <div className="space-y-1">
                    <p className="text-xs font-body text-tertiary">Total informado pelos sócios:</p>
                    {Math.abs(totalPaid - (parseFloat(form.amount) || 0)) > 0.01 && (
                      <p className={`text-[10px] font-bold uppercase tracking-wider ${totalPaid < (parseFloat(form.amount) || 0) ? 'text-amber-500' : 'text-red-500'}`}>
                        {totalPaid < (parseFloat(form.amount) || 0) 
                          ? `Faltam: R$ ${(parseFloat(form.amount) - totalPaid).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                          : `Excedente: R$ ${(totalPaid - parseFloat(form.amount)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                        }
                      </p>
                    )}
                  </div>
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
            )}
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
