-- University Skill Portfolio Management System schema
create extension if not exists "uuid-ossp";

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  email text not null unique,
  role text not null check (role in ('admin', 'student')),
  department text,
  semester text,
  profile_picture text,
  is_verified_developer boolean default false,
  is_top_performer boolean default false,
  contact_email text,
  linkedin_url text,
  created_at timestamptz default now()
);

create table if not exists public.skills (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  skill_name text not null,
  skill_level text not null check (skill_level in ('Beginner', 'Intermediate', 'Expert')),
  created_at timestamptz default now()
);

create table if not exists public.projects (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  description text,
  tech_used text,
  github_link text,
  cover_image text,
  created_at timestamptz default now()
);

create table if not exists public.services (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  description text,
  offering_tags text,
  availability text,
  created_at timestamptz default now()
);

create table if not exists public.certificates (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  certificate_name text not null,
  file_url text not null,
  issue_date date,
  created_at timestamptz default now()
);

alter table public.users enable row level security;
alter table public.skills enable row level security;
alter table public.projects enable row level security;
alter table public.certificates enable row level security;
alter table public.services enable row level security;

create table if not exists public.opportunities (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text not null,
  required_skills jsonb not null default '[]'::jsonb,
  deadline date not null,
  created_by uuid not null references public.users(id) on delete cascade,
  created_at timestamptz default now()
);

create table if not exists public.applications (
  id uuid primary key default uuid_generate_v4(),
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  student_id uuid not null references public.users(id) on delete cascade,
  status text not null check (status in ('pending', 'accepted', 'rejected')) default 'pending',
  created_at timestamptz default now()
);

alter table public.opportunities enable row level security;
alter table public.applications enable row level security;

-- SECURITY DEFINER: avoids RLS recursion when policies need an "is admin?" check.
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

drop policy if exists "users_select_own_or_admin" on public.users;
create policy "users_select_own_or_admin"
on public.users for select
using (auth.role() = 'authenticated');

drop policy if exists "users_update_own_or_admin" on public.users;
create policy "users_update_own_or_admin"
on public.users for update
using (id = auth.uid() or (select role from public.users where id = auth.uid()) = 'admin');

drop policy if exists "skills_owner_or_admin" on public.skills;
create policy "skills_owner_or_admin"
on public.skills for all
using (user_id = auth.uid() or (select role from public.users where id = auth.uid()) = 'admin')
with check (user_id = auth.uid() or (select role from public.users where id = auth.uid()) = 'admin');

drop policy if exists "projects_owner_or_admin" on public.projects;
create policy "projects_owner_or_admin"
on public.projects for all
using (user_id = auth.uid() or (select role from public.users where id = auth.uid()) = 'admin')
with check (user_id = auth.uid() or (select role from public.users where id = auth.uid()) = 'admin');

drop policy if exists "certificates_owner_or_admin" on public.certificates;
create policy "certificates_owner_or_admin"
on public.certificates for all
using (user_id = auth.uid() or (select role from public.users where id = auth.uid()) = 'admin')
with check (user_id = auth.uid() or (select role from public.users where id = auth.uid()) = 'admin');

drop policy if exists "services_owner_or_admin" on public.services;
create policy "services_owner_or_admin"
on public.services for all
using (user_id = auth.uid() or (select role from public.users where id = auth.uid()) = 'admin')
with check (user_id = auth.uid() or (select role from public.users where id = auth.uid()) = 'admin');

drop policy if exists "opportunities_admin_all" on public.opportunities;
create policy "opportunities_admin_all"
on public.opportunities for all
using (
  exists (
    select 1 from public.users
    where id = auth.uid() and role = 'admin'
  )
)
with check (
  exists (
    select 1 from public.users
    where id = auth.uid() and role = 'admin'
  )
);

drop policy if exists "opportunities_student_select" on public.opportunities;
drop policy if exists "opportunities_auth_select" on public.opportunities;
create policy "opportunities_auth_select"
on public.opportunities for select
using (auth.role() = 'authenticated');

drop policy if exists "applications_admin_all" on public.applications;
create policy "applications_admin_all"
on public.applications for all
using ((select role from public.users where id = auth.uid()) = 'admin')
with check ((select role from public.users where id = auth.uid()) = 'admin');

drop policy if exists "applications_student_select" on public.applications;
create policy "applications_student_select"
on public.applications for select
using (student_id = auth.uid());

drop policy if exists "applications_student_insert" on public.applications;
create policy "applications_student_insert"
on public.applications for insert
with check (student_id = auth.uid());

drop function if exists public.current_role();

insert into storage.buckets (id, name, public)
values ('profile-pictures', 'profile-pictures', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('certificates', 'certificates', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('project-images', 'project-images', true)
on conflict (id) do nothing;

drop policy if exists "Public read profile images" on storage.objects;
create policy "Public read profile images"
on storage.objects for select
using (bucket_id = 'profile-pictures');

drop policy if exists "Users upload own profile image" on storage.objects;
create policy "Users upload own profile image"
on storage.objects for insert
to authenticated
with check (bucket_id = 'profile-pictures' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Public read certificates" on storage.objects;
create policy "Public read certificates"
on storage.objects for select
using (bucket_id = 'certificates');

drop policy if exists "Users upload own certificate" on storage.objects;
create policy "Users upload own certificate"
on storage.objects for insert
to authenticated
with check (bucket_id = 'certificates' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Public read project images" on storage.objects;
create policy "Public read project images"
on storage.objects for select
using (bucket_id = 'project-images');

drop policy if exists "Users upload own project images" on storage.objects;
create policy "Users upload own project images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'project-images' and (storage.foldername(name))[1] = auth.uid()::text);
