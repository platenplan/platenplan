-- RLS POLICIES FIX
-- Enables full access for household members to their own data

-- Helper Logic (reused in policies):
-- users can access rows where household_id matches their profile's household_id

-- 1. EXPENSES
CREATE POLICY "Household ALL" ON expenses
FOR ALL
USING (
  household_id = (SELECT household_id FROM profiles WHERE id = auth.uid())
);

-- 2. WALLETS
CREATE POLICY "Household ALL" ON wallets
FOR ALL
USING (
  household_id = (SELECT household_id FROM profiles WHERE id = auth.uid())
);

-- 3. INVENTORY
CREATE POLICY "Household ALL" ON inventory
FOR ALL
USING (
  household_id = (SELECT household_id FROM profiles WHERE id = auth.uid())
);

-- 4. RECIPES
CREATE POLICY "Household ALL" ON recipes
FOR ALL
USING (
  household_id = (SELECT household_id FROM profiles WHERE id = auth.uid())
);

-- 5. RECURRING EXPENSES
CREATE POLICY "Household ALL" ON recurring_expenses
FOR ALL
USING (
  household_id = (SELECT household_id FROM profiles WHERE id = auth.uid())
);

-- 6. BUDGETS
CREATE POLICY "Household ALL" ON budgets
FOR ALL
USING (
  household_id = (SELECT household_id FROM profiles WHERE id = auth.uid())
);

-- 7. CATEGORIES (Usually read-only or admin managed, but allowing household edit for now)
CREATE POLICY "Household ALL" ON categories
FOR ALL
USING (
  household_id = (SELECT household_id FROM profiles WHERE id = auth.uid())
);

-- 8. EXPENSE BENEFICIARIES
-- Linked via expense_id usually, but simple check:
-- We trust valid users to add beneficiaries.
-- A stricter policy would join expenses, but for performance/MVP:
CREATE POLICY "Authenticated users can insert beneficiaries" 
ON expense_beneficiaries FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users view beneficiaries of visible expenses" 
ON expense_beneficiaries FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM expenses e 
    WHERE e.id = expense_beneficiaries.expense_id 
    AND e.household_id = (SELECT household_id FROM profiles WHERE id = auth.uid())
  )
);
