-- 1. ENUMS (Roles, Payment Modes, Units)
-- User roles
CREATE TYPE user_role AS ENUM ('admin', 'member');

-- Payment modes
CREATE TYPE payment_mode AS ENUM ('cash', 'card', 'bank_transfer', 'wallet', 'upi', 'other');

-- Units for inventory
CREATE TYPE unit_type AS ENUM ('kg', 'g', 'litre', 'ml', 'piece', 'pack', 'box', 'other');

-- 2. USERS TABLE
-- Supabase already has auth.users. We create a profile table linked to it.
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  household_id UUID NOT NULL,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'member',
  relation TEXT, -- you, wife, child1, child2
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX profiles_household_idx ON profiles(household_id);

-- 3. HOUSEHOLDS TABLE
-- Supports multi‑user family setup.
CREATE TABLE households (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. WALLETS TABLE
CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- You, Wife, Shared
  type TEXT NOT NULL, -- personal / shared
  owner_user_id UUID REFERENCES profiles(id),
  balance NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX wallets_household_idx ON wallets(household_id);

-- 5. CATEGORIES & SUBCATEGORIES
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name TEXT NOT NULL
);

CREATE TABLE subcategories (
  id SERIAL PRIMARY KEY,
  category_id INT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL
);

CREATE INDEX subcat_cat_idx ON subcategories(category_id);

-- 6. EXPENSES TABLE
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  category_id INT REFERENCES categories(id),
  subcategory_id INT REFERENCES subcategories(id),
  paid_by_wallet_id UUID REFERENCES wallets(id),
  payment_mode payment_mode DEFAULT 'cash',
  shared_flag BOOLEAN DEFAULT FALSE,
  notes TEXT,
  attachment_url TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  date DATE DEFAULT CURRENT_DATE
);

CREATE INDEX expenses_household_idx ON expenses(household_id);
CREATE INDEX expenses_category_idx ON expenses(category_id);

-- 7. EXPENSE BENEFICIARIES TABLE
-- Supports per‑child cost, shared logic, fairness.
CREATE TABLE expense_beneficiaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  percentage NUMERIC(5,2) -- optional
);

CREATE INDEX exp_benefit_exp_idx ON expense_beneficiaries(expense_id);

-- 8. INVENTORY TABLE
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  quantity NUMERIC(12,2),
  unit unit_type,
  linked_expense_id UUID REFERENCES expenses(id),
  expiry_date DATE,
  category TEXT, -- food, household, etc.
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX inventory_household_idx ON inventory(household_id);

-- 9. RECIPES TABLE
CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  ingredients JSONB, -- [{item_id, qty, unit}]
  created_at TIMESTAMP DEFAULT NOW()
);

-- 10. BUDGETS TABLE
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  category_id INT REFERENCES categories(id),
  monthly_limit NUMERIC(12,2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 11. RECURRING EXPENSES TABLE
CREATE TABLE recurring_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount NUMERIC(12,2),
  category_id INT REFERENCES categories(id),
  subcategory_id INT REFERENCES subcategories(id),
  due_day INT, -- e.g., 1st of every month
  created_at TIMESTAMP DEFAULT NOW()
);

-- 12. RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_expenses ENABLE ROW LEVEL SECURITY;

-- 12.1 RLS Policies
-- Profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (id = auth.uid());

-- RLS Helper function to check household membership (Optional but clean)
-- For now, using direct queries as requested.

-- Households:
-- Users can see households they belong to (via profile)
CREATE POLICY "View household" ON households FOR SELECT USING (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.household_id = households.id)
);

-- Expenses
CREATE POLICY "Household access"
ON expenses
FOR SELECT USING (
  household_id = (SELECT household_id FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "Household insert"
ON expenses
FOR INSERT WITH CHECK (
  household_id = (SELECT household_id FROM profiles WHERE id = auth.uid())
);

-- Wallets
CREATE POLICY "Household view wallets" ON wallets FOR SELECT USING (
  household_id = (SELECT household_id FROM profiles WHERE id = auth.uid())
);
CREATE POLICY "Household update wallets" ON wallets FOR ALL USING (
  household_id = (SELECT household_id FROM profiles WHERE id = auth.uid())
);

-- Inventory
CREATE POLICY "Household view inventory" ON inventory FOR SELECT USING (
  household_id = (SELECT household_id FROM profiles WHERE id = auth.uid())
);
CREATE POLICY "Household manage inventory" ON inventory FOR ALL USING (
  household_id = (SELECT household_id FROM profiles WHERE id = auth.uid())
);

-- Recipes
CREATE POLICY "Household view recipes" ON recipes FOR SELECT USING (
  household_id = (SELECT household_id FROM profiles WHERE id = auth.uid())
);

-- Budgets
CREATE POLICY "Household view budgets" ON budgets FOR SELECT USING (
  household_id = (SELECT household_id FROM profiles WHERE id = auth.uid())
);

-- Recurring Expenses
CREATE POLICY "Household view recurring" ON recurring_expenses FOR SELECT USING (
  household_id = (SELECT household_id FROM profiles WHERE id = auth.uid())
);

-- 13. Sample Seed Data
-- NOTE: Requires a valid household ID and user ID in real usage.
-- Since this is SQL to be pasted, we cannot dynamic select easily without a DO block or manual ID insertion.
-- The provided sample:
-- INSERT INTO households (name) VALUES ('My Family');
-- INSERT INTO categories (household_id, name) VALUES ...
-- This works if run sequentially in a script where variables are allowed or referencing last ID.
-- For Supabase SQL Editor, multiple CTEs or DO blocks are better, but simple inserts work if run line-by-line or if ID is known.
