export interface UserRole {
  user_id: string;
  role: 'admin' | 'viewer' | 'convidado';
}

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  created_at?: string;
  user_roles?: { role: string }[];
}

export interface ExpenseParticipant {
  id: string;
  expense_id: string;
  user_id: string;
  amount_paid: number;
  created_at: string;
  profiles?: {
    full_name: string;
  };
}

export interface Expense {
  id: string;
  title: string;
  description: string | null;
  amount: number;
  date: string;
  category: string;
  status: string;
  quantity: number | null;
  created_by: string | null;
  created_at: string;
}

export interface Attachment {
  id: string;
  expense_id: string;
  file_url: string;
  label: string | null;
  created_at: string;
}

// Joined interface for frontend convenience
export interface ExpenseWithAttachments extends Expense {
  attachments: Attachment[];
  expense_participants: ExpenseParticipant[];
}

export interface Supplier {
  id: string;
  name: string;
  category: string;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectDocument {
  id: string;
  title: string;
  category: string;
  file_url: string;
  version: string | null;
  description: string | null;
  created_at: string;
}

export interface Worker {
  id: string;
  name: string;
  phone: string | null;
  specialty: string | null;
  is_active: boolean;
  created_at: string;
}

export interface WorkerPayment {
  id: string;
  worker_id: string;
  expense_id: string | null;
  amount: number;
  date: string;
  payment_type: 'Diária' | 'Empreitada' | 'Outro';
  status: 'Pendente' | 'Pago';
  description: string | null;
  created_at: string;
  worker?: Worker;
}

export interface ToolLending {
  id: string;
  tool_description: string;
  worker_id: string | null;
  borrower_name: string | null;
  lend_date: string;
  expected_return_date: string | null;
  actual_return_date: string | null;
  status: 'Pendente' | 'Devolvido' | 'Extraviado';
  photo_links: string[] | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  worker?: Worker;
}

export interface ShoppingItem {
  id: string;
  title: string;
  description: string | null;
  quantity_text: string | null;
  estimated_amount: number | null;
  expected_date: string;
  category: string | null;
  status: 'Pendente' | 'Comprado' | 'Cancelado';
  expense_id: string | null;
  created_by: string | null;
  created_at: string;
}
