-- Run this in Supabase SQL Editor if login succeeds but you bounce back to "/" or stay on login.
-- Fixes broken RLS: current_role() queried public.users under RLS and blocked profile reads.

drop policy if exists "Users can view own profile or admin can view all" on public.users;
drop policy if exists "Users can update own profile or admin" on public.users;
drop policy if exists "Skills owner/admin access" on public.skills;
drop policy if exists "Projects owner/admin access" on public.projects;
drop policy if exists "Certificates owner/admin access" on public.certificates;
drop policy if exists "users_select_own_or_admin" on public.users;
drop policy if exists "users_update_own_or_admin" on public.users;
drop policy if exists "skills_owner_or_admin" on public.skills;
drop policy if exists "projects_owner_or_admin" on public.projects;
drop policy if exists "certificates_owner_or_admin" on public.certificates;

drop function if exists public.current_role();

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_admin() to service_role;

create policy "users_select_own_or_admin"
on public.users for select
using (id = auth.uid() or public.is_admin());

create policy "users_update_own_or_admin"
on public.users for update
using (id = auth.uid() or public.is_admin());

create policy "skills_owner_or_admin"
on public.skills for all
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

create policy "projects_owner_or_admin"
on public.projects for all
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

create policy "certificates_owner_or_admin"
on public.certificates for all
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "services_owner_or_admin" on public.services;
create policy "services_owner_or_admin"
on public.services for all
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());
