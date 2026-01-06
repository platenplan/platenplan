-- Migration: Add automation columns to recurring_expenses

ALTER TABLE recurring_expenses
ADD COLUMN IF NOT EXISTS auto_post BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_posted_at TIMESTAMPTZ;
