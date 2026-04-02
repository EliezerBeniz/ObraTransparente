export interface UserRole {
  user_id: string;
  role: 'admin' | 'viewer';
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
