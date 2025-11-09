-- Drop existing SELECT policies
DROP POLICY IF EXISTS "Users can view own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can view own policies" ON public.policies;

-- Create new global SELECT policies for all authenticated users
CREATE POLICY "All authenticated users can view all clients"
ON public.clients
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "All authenticated users can view all policies"
ON public.policies
FOR SELECT
TO authenticated
USING (true);