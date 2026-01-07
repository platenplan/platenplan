-- Allow authenticated users to insert their own profile
-- This is critical for "self-healing" if the automatic trigger fails.

CREATE POLICY "Users can insert own profile" 
ON profiles 
FOR INSERT 
TO authenticated 
WITH CHECK (id = auth.uid());
