-- Add created_by column to households if it doesn't exist
ALTER TABLE households ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Drop existing policy to redefine it
DROP POLICY IF EXISTS "View household" ON households;

-- Allow SELECT if you are a member OR if you created it (owner)
CREATE POLICY "View household" ON households FOR SELECT USING (
  (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.household_id = households.id))
  OR 
  (created_by = auth.uid())
);

-- Allow INSERT for authenticated users, enforcing that they set themselves as creator
CREATE POLICY "Insert household" ON households FOR INSERT TO authenticated WITH CHECK (
  created_by = auth.uid()
);

-- Allow UPDATE if you are member or owner
CREATE POLICY "Update household" ON households FOR UPDATE TO authenticated USING (
  (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.household_id = households.id))
  OR 
  (created_by = auth.uid())
);
