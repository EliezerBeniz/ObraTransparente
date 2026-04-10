"use client";

import React, { useEffect, useState } from 'react';
import { Users, Edit2, Shield, ShieldAlert, CheckCircle2, X, PlusCircle, Trash2 } from 'lucide-react';
import { Profile } from '@/lib/types';

interface SocioWithRole extends Omit<Profile, 'user_roles'> {
  user_roles: { role: string };
}

export default function SociosPage() {
  const [socios, setSocios] = useState<SocioWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ full_name: '', role: '' });
  const [toast, setToast] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // New member state
  const [isAdding, setIsAdding] = useState(false);
  const [newMember, setNewMember] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'viewer'
  });

  const fetchSocios = async () => {
    try {
      const res = await fetch('/api/socios');
      if (res.ok) {
        const data = await res.json();
        const processed = data.map((s: any) => ({
          ...s,
          user_roles: Array.isArray(s.user_roles) ? s.user_roles[0] : s.user_roles
        }));
        setSocios(processed);
      }
    } catch (error) {
      console.error('Failed to fetch socios', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSocios();
  }, []);

  const handleEdit = (socio: SocioWithRole) => {
    setEditingId(socio.id);
    setEditForm({
      full_name: socio.full_name || '',
      role: socio.user_roles?.role || 'viewer'
    });
  };

  const handleSave = async (id: string) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/socios/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      
      if (res.ok) {
        setToast('Alterações salvas com sucesso!');
        setEditingId(null);
        await fetchSocios();
        setTimeout(() => setToast(null), 3000);
      } else {
        const data = await res.json();
        alert(data.error || 'Erro ao salvar');
      }
    } catch (error) {
      alert('Erro de conexão ao salvar');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/socios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMember)
      });
      
      if (res.ok) {
        setToast('Novo membro cadastrado com sucesso!');
        setIsAdding(false);
        setNewMember({ email: '', password: '', full_name: '', role: 'viewer' });
        await fetchSocios();
        setTimeout(() => setToast(null), 3000);
      } else {
        const data = await res.json();
        alert(data.error || 'Erro ao cadastrar membro');
      }
    } catch (error) {
      alert('Erro de conexão');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o sócio "${name}"? Esta ação é permanente e removerá o acesso ao sistema.`)) {
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/socios', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      if (res.ok) {
        setToast('Sócio excluído com sucesso.');
        await fetchSocios();
        setTimeout(() => setToast(null), 3000);
      } else {
        const data = await res.json();
        alert(data.error || 'Erro ao excluir');
      }
    } catch (error) {
      alert('Erro de conexão ao excluir');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-sm text-tertiary font-body">Carregando membros da equipe...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-secondary text-white px-5 py-3 rounded-architectural shadow-lg flex items-center gap-2 text-sm font-body animate-[slideIn_0.3s_ease-out]">
          <CheckCircle2 size={18} />
          {toast}
        </div>
      )}

      {/* Modal Adicionar Novo Membro */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-surface-lowest rounded-architectural border border-ghost-border shadow-2xl w-full max-w-md animate-[fadeIn_0.2s_ease-out]">
            <div className="p-6 border-b border-ghost-border flex items-center justify-between">
              <h3 className="text-lg font-heading text-foreground">Cadastrar Novo Membro</h3>
              <button onClick={() => setIsAdding(false)} className="text-tertiary hover:text-foreground">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateMember} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-tertiary uppercase tracking-wider">Nome Completo</label>
                <input
                  required
                  type="text"
                  value={newMember.full_name}
                  onChange={(e) => setNewMember({ ...newMember, full_name: e.target.value })}
                  className="w-full bg-surface-low border border-ghost-border rounded px-3 py-2 text-sm font-body outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Ex: João da Silva"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-tertiary uppercase tracking-wider">E-mail</label>
                <input
                  required
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  className="w-full bg-surface-low border border-ghost-border rounded px-3 py-2 text-sm font-body outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="exemplo@email.com"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-tertiary uppercase tracking-wider">Senha Inicial</label>
                <input
                  required
                  type="password"
                  value={newMember.password}
                  onChange={(e) => setNewMember({ ...newMember, password: e.target.value })}
                  className="w-full bg-surface-low border border-ghost-border rounded px-3 py-2 text-sm font-body outline-none focus:ring-2 focus:ring-primary/20"
                  minLength={6}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-tertiary uppercase tracking-wider">Nível de Acesso</label>
                <select
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                  className="w-full bg-surface-low border border-ghost-border rounded px-3 py-2 text-sm font-body outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="viewer">Observador (Viewer)</option>
                  <option value="admin">Administrador (Admin)</option>
                  <option value="convidado">Convidado (Sem divisão de custos)</option>
                </select>
              </div>
              
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 px-4 py-2 text-sm font-heading text-tertiary border border-ghost-border rounded hover:bg-surface-low transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 text-sm font-heading text-white bg-primary rounded hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Cadastrando...' : 'Cadastrar Membro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-heading text-foreground">Gerenciar Sócios e Permissões</h2>
          <p className="text-sm text-tertiary font-body mt-1">
            Controle quem pode administrar as despesas da obra e quem tem apenas acesso de visualização.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-architectural shadow-sm shadow-primary/20 hover:bg-primary/90 transition-all text-sm font-heading"
        >
          <PlusCircle size={18} />
          Novo Membro
        </button>
      </div>

      <div className="bg-surface-lowest rounded-architectural border border-ghost-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-low/50 border-b border-ghost-border">
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-tertiary font-bold">Identificação</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-tertiary font-bold text-center">Nível de Acesso</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-tertiary font-bold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ghost-border/10">
              {socios.map((socio) => (
                <tr key={socio.id} className="hover:bg-surface-low/30 transition-colors group">
                  <td className="px-6 py-5">
                    {editingId === socio.id ? (
                      <input
                        type="text"
                        value={editForm.full_name}
                        onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                        className="bg-surface-low border border-secondary/20 rounded px-3 py-1.5 text-sm font-body focus:ring-2 focus:ring-secondary/20 outline-none w-full max-w-xs"
                        placeholder="Nome Completo"
                      />
                    ) : (
                      <div className="flex flex-col">
                        <span className="text-sm font-heading text-foreground">{socio.full_name || 'Sócio sem nome'}</span>
                        <span className="text-[10px] text-tertiary font-mono opacity-60 uppercase">{socio.id.substring(0, 8)}...</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-5 text-center">
                    {editingId === socio.id ? (
                      <select
                        value={editForm.role}
                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                        className="bg-surface-low border border-secondary/20 rounded px-3 py-1.5 text-sm font-body focus:ring-2 focus:ring-secondary/20 outline-none"
                      >
                        <option value="admin">Administrador (Admin)</option>
                        <option value="viewer">Observador (Viewer)</option>
                        <option value="convidado">Convidado</option>
                      </select>
                    ) : (
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-low rounded-full">
                        {socio.user_roles?.role === 'admin' ? (
                          <>
                            <ShieldAlert size={12} className="text-primary" />
                            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Admin</span>
                          </>
                        ) : socio.user_roles?.role === 'convidado' ? (
                          <>
                            <Users size={12} className="text-secondary" />
                            <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">Convidado</span>
                          </>
                        ) : (
                          <>
                            <Shield size={12} className="text-tertiary" />
                            <span className="text-[10px] font-bold text-tertiary uppercase tracking-wider">Viewer</span>
                          </>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-5 text-right">
                    {editingId === socio.id ? (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-2 text-tertiary hover:text-foreground transition-all"
                          title="Cancelar"
                        >
                          <X size={18} />
                        </button>
                        <button
                          onClick={() => handleSave(socio.id)}
                          disabled={submitting}
                          className="flex items-center gap-2 px-4 py-1.5 bg-secondary text-white rounded text-xs font-heading hover:bg-secondary-container transition-all"
                        >
                          Salvar
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => handleEdit(socio)}
                          className="p-2 text-tertiary hover:text-primary transition-all opacity-0 group-hover:opacity-100"
                          title="Editar Membro"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(socio.id, socio.full_name || 'Sócio')}
                          className="p-2 text-tertiary hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                          title="Excluir Membro"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-primary/5 p-6 rounded-architectural border border-primary/20">
        <div className="flex gap-4">
          <Users className="text-primary shrink-0" size={24} />
          <div>
            <h4 className="text-sm font-heading text-primary">Sobre Permissões</h4>
            <p className="text-xs text-secondary/80 font-body mt-1 leading-relaxed">
              <strong>Administradores</strong> têm poder total para cadastrar, editar e excluir despesas, além de gerenciar a linha do tempo e outros membros.
              <br />
              <strong>Observadores</strong> (Viewer) podem apenas visualizar o dashboard administrativo e ler os dados.
              <br />
              <strong>Convidados</strong> podem visualizar os dados mas não entram na divisão de custos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
