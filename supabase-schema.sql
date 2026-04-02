-- 1. Create User Roles Table
create table user_roles (
  user_id uuid references auth.users not null primary key,
  role text check (role in ('admin', 'viewer')) default 'viewer'
);

-- 2. Create Expenses Table
-- Note: Keeping 'status' column as it's crucial for business logic
create table expenses (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  amount numeric not null,
  date date not null,
  category text not null,
  status text not null default 'Pendente',
  created_by uuid references auth.users,
  created_at timestamptz default now()
);

-- 3. Create Attachments Table (Google Drive links)
create table attachments (
  id uuid primary key default uuid_generate_v4(),
  expense_id uuid references expenses(id) on delete cascade not null,
  file_url text not null check (file_url ~ '^https?://(drive\.google\.com|docs\.google\.com)/.*$'),
  label text,
  created_at timestamptz default now()
);

-- Turn on Security
alter table user_roles enable row level security;
alter table expenses enable row level security;
alter table attachments enable row level security;

-- 4. RLS for Expenses and Attachments (Public Read)
create policy "Users can check their own role"
  on user_roles for select using (auth.uid() = user_id);

create policy "Public read access on expenses"
  on expenses for select using (true);

create policy "Public read access on attachments"
  on attachments for select using (true);

-- 5. RLS for Expenses and Attachments (Admin Write)
create policy "Admin check for expenses"
  on expenses for all using (
    exists (
        select 1 from user_roles
        where user_roles.user_id = auth.uid()
        and user_roles.role = 'admin'
    )
  );

create policy "Admin check for attachments"
  on attachments for all using (
    exists (
        select 1 from user_roles
        where user_roles.user_id = auth.uid()
        and user_roles.role = 'admin'
    )
  );
  
-- Automatic Role Assigner
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_roles (user_id, role)
  values (new.id, 'admin'); -- Defaulting to admin for MVP
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Seed Data
do $$
declare
  exp_id1 uuid;
  exp_id2 uuid;
begin
  insert into expenses (title, description, amount, date, category, status) values
  ('Compra de Cimento S.A.', 'Compra de Cimento (500 sacos)', 15500, '2024-04-01', 'Material', 'Pago')
  returning id into exp_id1;

  insert into expenses (title, description, amount, date, category, status) values
  ('Serviço de Terraplanagem', 'Construtora Rocha', 42000, '2024-03-28', 'Mão de Obra', 'Pago')
  returning id into exp_id2;

  insert into attachments (expense_id, file_url, label) values
  (exp_id1, 'https://drive.google.com/exemplo1', 'Nota Fiscal Cimento'),
  (exp_id2, 'https://drive.google.com/exemplo2', 'Recibo Terraplanagem');
end $$;
