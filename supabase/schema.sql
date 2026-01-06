-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- USERS & HOUSEHOLDS
-- Note: 'users' table extends the auth.users logic or works alongside it. 
-- In a simple setup, we might just use public.profiles linked to auth.users.
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  household_id uuid, -- Users in the same household share data
  role text default 'member', -- 'admin', 'member'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- WALLETS
create table public.wallets (
  id uuid default uuid_generate_v4() primary key,
  household_id uuid not null, -- Linked to household
  name text not null, -- 'Dad', 'Mom', 'Shared', 'Savings'
  type text default 'personal', -- 'personal', 'shared'
  owner_id uuid references public.profiles(id), -- If personal, who owns it
  balance numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- CATEGORIES
create table public.categories (
  id uuid default uuid_generate_v4() primary key,
  household_id uuid, -- Null means global default, otherwise custom
  name text not null,
  icon text,
  type text default 'expense', -- 'expense', 'income'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- SUBCATEGORIES
create table public.subcategories (
  id uuid default uuid_generate_v4() primary key,
  category_id uuid references public.categories(id) on delete cascade not null,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- EXPENSES
create table public.expenses (
  id uuid default uuid_generate_v4() primary key,
  household_id uuid not null,
  amount numeric not null,
  date date not null default current_date,
  description text,
  
  category_id uuid references public.categories(id),
  subcategory_id uuid references public.subcategories(id),
  
  paid_by_wallet_id uuid references public.wallets(id),
  
  payment_mode text, -- 'cash', 'card', 'transfer'
  attachment_url text,
  
  created_by_user_id uuid references public.profiles(id),
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  is_deleted boolean default false
);

-- EXPENSE BENEFICIARIES (Split logic)
create table public.expense_beneficiaries (
  id uuid default uuid_generate_v4() primary key,
  expense_id uuid references public.expenses(id) on delete cascade not null,
  user_id uuid references public.profiles(id), -- Who benefited (null could mean 'family' generic if needed, but better to be explicit)
  percentage numeric, -- Optional, for non-equal splits
  amount numeric -- Calculated share
);

-- INVENTORY
create table public.inventory_items (
  id uuid default uuid_generate_v4() primary key,
  household_id uuid not null,
  name text not null,
  category_id uuid references public.categories(id), -- e.g. 'Groceries'
  quantity numeric default 0,
  unit text, -- 'kg', 'pcs', 'l'
  cost_per_unit numeric,
  expiry_date date,
  status text default 'in_stock', -- 'in_stock', 'low', 'expired'
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RECIPES
create table public.recipes (
  id uuid default uuid_generate_v4() primary key,
  household_id uuid not null,
  name text not null,
  description text,
  estimated_cost numeric,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.recipe_ingredients (
  id uuid default uuid_generate_v4() primary key,
  recipe_id uuid references public.recipes(id) on delete cascade not null,
  inventory_item_id uuid references public.inventory_items(id), -- Specific item link
  -- OR generic name if not in inventory yet? Let's stick to simple text if needed, or item link.
  quantity_needed numeric,
  unit text
);

-- RLS (Row Level Security)
alter table public.profiles enable row level security;
alter table public.wallets enable row level security;
alter table public.categories enable row level security;
alter table public.subcategories enable row level security;
alter table public.expenses enable row level security;
alter table public.inventory_items enable row level security;

-- Policies (Simplified for initial setup: Users allow read/write if they belong to household)
-- NOTE: User creation needs a trigger to key profile creation.

-- Profiles: Users can read their own profile.
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Wallets: Users can see wallets in their household.
create policy "Household view wallets" on public.wallets for select using (
  exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.household_id = wallets.household_id)
);
create policy "Household update wallets" on public.wallets for all using (
  exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.household_id = wallets.household_id)
);

-- Expenses:
create policy "Household view expenses" on public.expenses for select using (
  exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.household_id = expenses.household_id)
);
create policy "Household manage expenses" on public.expenses for all using (
  exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.household_id = expenses.household_id)
);

-- Function to handle new user signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, household_id)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', uuid_generate_v4()); 
  -- Note: assigns new household ID by default. Later logic can join existing household.
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for auth.users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

