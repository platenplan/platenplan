-- 1. GROCERY TEMPLATES
CREATE TABLE IF NOT EXISTS grocery_items_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id),
  merchant TEXT, 
  label TEXT,            -- "Weekly groceries", "Carrefour usual"
  items JSONB,           -- [{ inventory_item_id, qty, unit, approx_price }]
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. KIDS COST INSIGHTS VIEW
-- Calculates spending per child based on expense_beneficiaries
CREATE OR REPLACE VIEW kids_cost_insights AS
SELECT
  eb.user_id AS child_id,
  date_trunc('month', e.created_at) AS month,
  SUM(e.amount * (COALESCE(eb.percentage, 100) / 100.0)) AS total,
  SUM(
    CASE WHEN c.name ILIKE '%Education%' OR c.name ILIKE '%School%'
    THEN e.amount * (COALESCE(eb.percentage, 100) / 100.0) ELSE 0 END
  ) AS education,
  SUM(
    CASE WHEN c.name ILIKE '%Dining%' OR c.name ILIKE '%Food%'
    THEN e.amount * (COALESCE(eb.percentage, 100) / 100.0) ELSE 0 END
  ) AS eating_out,
  SUM(
    CASE WHEN c.name ILIKE '%Health%' OR c.name ILIKE '%Medical%'
    THEN e.amount * (COALESCE(eb.percentage, 100) / 100.0) ELSE 0 END
  ) AS health
FROM expense_beneficiaries eb
JOIN expenses e ON e.id = eb.expense_id
JOIN categories c ON e.category_id = c.id
GROUP BY eb.user_id, date_trunc('month', e.created_at);

-- 3. INVENTORY COSTING
ALTER TABLE inventory 
ADD COLUMN IF NOT EXISTS cost_per_unit NUMERIC(12,4) DEFAULT 0;
