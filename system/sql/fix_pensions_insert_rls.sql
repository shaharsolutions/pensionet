-- ============================================
-- Fix: Pensions Table Insert/Management RLS
-- Allows authenticated users to create their own pension record
-- and manage it if they are the owner.
-- ============================================

-- 1. Allow authenticated users to create a pension record
-- This is critical for the setup.html process to work.
DROP POLICY IF EXISTS "Users can insert their own pension" ON public.pensions;
CREATE POLICY "Users can insert their own pension" ON public.pensions
    FOR INSERT TO authenticated 
    WITH CHECK ((select auth.uid()) = owner_id);

-- 2. Ensure owners can delete their own pension
DROP POLICY IF EXISTS "Owners can delete their own pension" ON public.pensions;
CREATE POLICY "Owners can delete their own pension" ON public.pensions
    FOR DELETE TO authenticated 
    USING ((select auth.uid()) = owner_id);

-- 3. Optimize and Refine Select Policy
-- Users can view if they are linked via profile OR if they are the owner.
DROP POLICY IF EXISTS "Users can view their own pension" ON public.pensions;
CREATE POLICY "Users can view their own pension" ON public.pensions
    FOR SELECT TO authenticated 
    USING (
        id = public.get_my_pension_id() 
        OR (select auth.uid()) = owner_id
    );

-- 4. Optimize and Refine Update Policy
-- Managers (via profile) or Owners (via owner_id) can update.
DROP POLICY IF EXISTS "Managers can update their own pension" ON public.pensions;
CREATE POLICY "Managers can update their own pension" ON public.pensions
    FOR UPDATE TO authenticated 
    USING (
        (id = public.get_my_pension_id() AND public.get_my_role() = 'manager') 
        OR (select auth.uid()) = owner_id
    );
