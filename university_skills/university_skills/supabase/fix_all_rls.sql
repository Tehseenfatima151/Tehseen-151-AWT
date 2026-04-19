-- Comprehensive fix for infinite RLS recursion causing timeouts.
-- This script safely removes recursive functions and corrects all policies 
-- utilizing direct inline queries now that the users table is unlocked for authenticated reading.

-- 1. Unlock the users table so inline queries don't recurse
DROP POLICY IF EXISTS "users_select_own_or_admin" ON public.users;
CREATE POLICY "users_select_own_or_admin" ON public.users 
FOR SELECT USING (auth.role() = 'authenticated');

-- 2. Clean users update policy
DROP POLICY IF EXISTS "users_update_own_or_admin" ON public.users;
CREATE POLICY "users_update_own_or_admin" ON public.users 
FOR UPDATE USING (id = auth.uid() OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

-- 3. Clean all other tables relying on role checks to use inline non-recursive subqueries
-- Skills
DROP POLICY IF EXISTS "skills_owner_or_admin" ON public.skills;
CREATE POLICY "skills_owner_or_admin" ON public.skills FOR ALL 
USING (user_id = auth.uid() OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin') 
WITH CHECK (user_id = auth.uid() OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

-- Projects
DROP POLICY IF EXISTS "projects_owner_or_admin" ON public.projects;
CREATE POLICY "projects_owner_or_admin" ON public.projects FOR ALL 
USING (user_id = auth.uid() OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin') 
WITH CHECK (user_id = auth.uid() OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

-- Certificates
DROP POLICY IF EXISTS "certificates_owner_or_admin" ON public.certificates;
CREATE POLICY "certificates_owner_or_admin" ON public.certificates FOR ALL 
USING (user_id = auth.uid() OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin') 
WITH CHECK (user_id = auth.uid() OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

-- Services
DROP POLICY IF EXISTS "services_owner_or_admin" ON public.services;
CREATE POLICY "services_owner_or_admin" ON public.services FOR ALL 
USING (user_id = auth.uid() OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin') 
WITH CHECK (user_id = auth.uid() OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

-- Opportunities
DROP POLICY IF EXISTS "opportunities_admin_all" ON public.opportunities;
CREATE POLICY "opportunities_admin_all" ON public.opportunities FOR ALL 
USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin') 
WITH CHECK ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

DROP POLICY IF EXISTS "opportunities_auth_select" ON public.opportunities;
CREATE POLICY "opportunities_auth_select" ON public.opportunities FOR SELECT 
USING (auth.role() = 'authenticated');

-- Applications
DROP POLICY IF EXISTS "applications_admin_all" ON public.applications;
CREATE POLICY "applications_admin_all" ON public.applications FOR ALL 
USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin') 
WITH CHECK ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

-- 4. Lastly, remove the problematic recursive security definer function entirely
DROP FUNCTION IF EXISTS public.is_admin();
