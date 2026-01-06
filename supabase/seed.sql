-- SEED DATA
-- 1. Create a Household (if not exists)
-- NOTE: In a real app, this happens on signup. For manual seeding, we insert one.
INSERT INTO households (id, name)
VALUES 
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'My Family')
ON CONFLICT (id) DO NOTHING;

-- 2. Create Categories
INSERT INTO categories (household_id, name)
VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Groceries'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Transport'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Health'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Dining Out'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Utilities'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Entertainment'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Shopping'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Education'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Other');

-- 3. Create Wallets
INSERT INTO wallets (household_id, name, type, balance)
VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Cash Wallet', 'personal', 5000),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Bank Account', 'shared', 15000);

-- IMPORTANT: 
-- You must manually link your User to this Household in the 'profiles' table 
-- for the RLS policies to allow you to see this data.
-- Run similar to:
-- UPDATE profiles SET household_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' WHERE id = 'YOUR_USER_ID';
