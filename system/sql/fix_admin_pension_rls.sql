-- ============================================
-- Fix: Admin access to all pensions
-- Allows the system admin (shaharsolutions@gmail.com) to view and manage all pensions.
-- This is essential for the "Impersonation Mode" to display correct settings (like capacity).
-- ============================================

-- 1. Add Select Policy for Admin on Pensions
DROP POLICY IF EXISTS "Admin can view all pensions" ON public.pensions;
CREATE POLICY "Admin can view all pensions"
ON public.pensions
FOR SELECT
TO authenticated
USING (
    auth.jwt() ->> 'email' = 'shaharsolutions@gmail.com'
);

-- 2. Add Update Policy for Admin on Pensions (Optional but good for support)
DROP POLICY IF EXISTS "Admin can update all pensions" ON public.pensions;
CREATE POLICY "Admin can update all pensions"
ON public.pensions
FOR UPDATE
TO authenticated
USING (
    auth.jwt() ->> 'email' = 'shaharsolutions@gmail.com'
)
WITH CHECK (
    auth.jwt() ->> 'email' = 'shaharsolutions@gmail.com'
);

-- 3. Also ensure Admin can see all profiles (Double check)
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
CREATE POLICY "Admin can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
    auth.jwt() ->> 'email' = 'shaharsolutions@gmail.com'
);
