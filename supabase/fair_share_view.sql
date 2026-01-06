-- FAIR CONTRIBUTION VIEW
-- Calculates how much each user paid and how much they benefited.

CREATE OR REPLACE VIEW fair_contribution_view AS
SELECT
  p.id AS user_id,
  p.full_name,
  
  -- Total paid by this user (via their personal wallets)
  -- Note: We assume wallets have 'owner_user_id'. 
  -- If paying via 'shared' wallet, logic might differ, but for 'fair share' usually 
  -- we track who put money IN, or we track who physically paid if wallets are personal.
  -- Simplified: Sum of expenses where paid_by_wallet belongs to this user.
  COALESCE((
    SELECT SUM(e.amount)
    FROM expenses e
    JOIN wallets w ON e.paid_by_wallet_id = w.id
    WHERE w.owner_user_id = p.id
  ), 0) AS total_paid,

  -- Total benefited (via expense_beneficiaries)
  -- Sum of (Expense Amount * Percentage / 100)
  -- If percentage is NULL, we assume equal split logic handled correctly in insertion, 
  -- but for this view we rely on explicit 'percentage' column being populated.
  -- Improved logic: If 0 or null percentage, handle gracefully or assume simple sum if linked.
  COALESCE((
    SELECT SUM(e.amount * (COALESCE(eb.percentage, 100) / 100.0))
    FROM expense_beneficiaries eb
    JOIN expenses e ON eb.expense_id = e.id
    WHERE eb.user_id = p.id
  ), 0) AS total_benefited

FROM profiles p;

-- Allow RLS to control access if needed (views inherit permissions of underlying tables usually, 
-- but in Supabase/Postgres views run with privileges of creator unless defined otherwise. 
-- Best to wrap in function or ensuring underlying tables have RLS enabled).
