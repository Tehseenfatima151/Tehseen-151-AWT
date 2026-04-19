-- Add new fields to users table for badges
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS is_verified_developer boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_top_performer boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS contact_email text,
ADD COLUMN IF NOT EXISTS linkedin_url text;

-- Create opportunities table
CREATE TABLE IF NOT EXISTS public.opportunities (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text not null,
  required_skills jsonb not null default '[]'::jsonb,
  deadline date not null,
  created_by uuid not null references public.users(id) on delete cascade,
  created_at timestamptz default now()
);

-- Create applications table
CREATE TABLE IF NOT EXISTS public.applications (
  id uuid primary key default uuid_generate_v4(),
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  student_id uuid not null references public.users(id) on delete cascade,
  status text not null check (status in ('pending', 'accepted', 'rejected')) default 'pending',
  created_at timestamptz default now()
);

-- Enable RLS
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Policies for Opportunities
-- Admins can manage all opportunities. Authenticated users can view active opportunities.
DROP POLICY IF EXISTS "opportunities_admin_all" ON public.opportunities;
DROP POLICY IF EXISTS "opportunities_student_select" ON public.opportunities;
DROP POLICY IF EXISTS "opportunities_auth_select" ON public.opportunities;

CREATE POLICY "opportunities_admin_all" ON public.opportunities 
FOR ALL USING (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
) WITH CHECK (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

CREATE POLICY "opportunities_auth_select" ON public.opportunities 
FOR SELECT USING (
    auth.role() = 'authenticated'
);

-- Policies for Applications
-- Admins can read and update all applications.
-- Students can read their own applications, upload/insert their own apps.
DO $$ 
BEGIN
    if not exists (select 1 from pg_policies where policyname = 'applications_admin_all') then
        CREATE POLICY "applications_admin_all" ON public.applications FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
    end if;
    
    if not exists (select 1 from pg_policies where policyname = 'applications_student_select') then
        CREATE POLICY "applications_student_select" ON public.applications FOR SELECT USING (student_id = auth.uid());
    end if;

    if not exists (select 1 from pg_policies where policyname = 'applications_student_insert') then
        CREATE POLICY "applications_student_insert" ON public.applications FOR INSERT WITH CHECK (student_id = auth.uid());
    end if;
END $$;
