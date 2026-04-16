"use client";

import React, { useState, useEffect } from 'react';
import { ShoppingItem } from '@/lib/types';
import ShoppingList from '@/components/admin/ShoppingList';
import { ShoppingForm } from '@/components/admin/ShoppingForm';
import PageContainer from '@/components/PageContainer';
import { ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminShoppingPage() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/shopping-list');
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
    } catch (error) {
      console.error('Error fetching shopping items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleAdd = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: ShoppingItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/shopping-list/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) fetchItems();
    } catch (err) {
      console.error('Error deleting item', err);
    }
  };

  const handleSubmit = async (data: Partial<ShoppingItem>) => {
    setSubmitting(true);
    try {
      const method = editingItem ? 'PATCH' : 'POST';
      const url = editingItem ? `/api/shopping-list/${editingItem.id}` : '/api/shopping-list';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setIsFormOpen(false);
        fetchItems();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const router = useRouter();

  const handleTransform = (item: ShoppingItem) => {
    // Navigate to expenses pre-filled with this item's info
    const params = new URLSearchParams();
    params.set('shoppingItemId', item.id);
    params.set('description', item.title);
    if(item.category) params.set('category', item.category);
    if(item.estimated_amount) params.set('amount', item.estimated_amount.toString());
    if(item.expected_date) params.set('date', item.expected_date);
    // Include the parameter that opens the form
    params.set('new', 'true');
    router.push(`/admin/expenses?${params.toString()}`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div className="border-b border-ghost-border pb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-primary/10 text-primary flex items-center justify-center rounded-architectural">
            <ShoppingBag size={20} />
          </div>
          <h1 className="text-2xl font-heading text-foreground tracking-tight">Lista de Compras</h1>
        </div>
        <p className="text-tertiary font-body">Gerencie previsões de ferramentas e materiais que serão adquiridos no decorrer da obra.</p>
      </div>

      {isFormOpen ? (
        <ShoppingForm 
          initialData={editingItem}
          onSubmit={handleSubmit}
          onCancel={() => setIsFormOpen(false)}
          submitting={submitting}
        />
      ) : (
        <ShoppingList 
          items={items} 
          loading={loading}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onTransform={handleTransform}
        />
      )}
    </div>
  );
}
