# CUI SkillSphere (Uni SkillSphere)

University skill portfolio platform for **COMSATS University Islamabad** — build, manage, and showcase student portfolios in one place. React + Supabase stack.

## Live demo

**Production (Vercel):** [https://uni-skillsphere.vercel.app/](https://uni-skillsphere.vercel.app/)
**Credentials**
**Student login**
aliza123@gmail.com
12345678
**Admin login**
tehseen151@gmail.com
12345678

## Features

- Landing page with Student Portal and Admin Portal cards.
- Role-based authentication (`student`, `admin`) with separate login pages.
- Student portal:
  - Dashboard stats
  - Profile management with profile image upload
  - Skills CRUD
  - Projects CRUD
  - Certificates upload + CRUD
  - Public portfolio URL
- Admin portal:
  - Global dashboard stats
  - Student account creation and deletion
  - Skills/Projects/Certificates moderation and delete actions
- Responsive UI:
  - Mobile-first layout
  - Sidebar drawer for mobile
  - Responsive cards/forms
- Toast notifications, loading states, and error handling.

## Tech Stack

- React (Vite)
- Tailwind CSS
- Supabase Auth + PostgreSQL + Storage
- React Router
- React Hot Toast

## Project Structure

```
src/
  components/
  context/
  lib/
  pages/
    admin/
    student/
  services/
  utils/
supabase/
  schema.sql
```

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy env file and fill values:

   ```bash
   cp .env.example .env
   ```

3. Add these variables:

   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_SUPABASE_SERVICE_ROLE_KEY`

4. In Supabase SQL editor, run `supabase/schema.sql`.

   **Already created the project earlier?** If login shows success but you return to the home page, your database likely still has the old `current_role()` RLS helper (it breaks reading `public.users`). Run `supabase/fix_rls_recursion.sql` once in the SQL editor, then try again.

   **Toast: "Profile row missing or blocked"** means: Auth login worked, but there is no matching row in `public.users` for your `auth.users.id`, or RLS is blocking `select` on `public.users`. Fix: (1) run `supabase/fix_rls_recursion.sql` in the SQL editor; (2) ensure a row exists in `public.users` with the same `id` as your auth user (students should be created via Admin Portal so this row is inserted automatically; admins need a manual `insert` with `role = 'admin'` after creating the auth user).

5. Create admin user:
   - Create account in Supabase Auth.
   - Insert matching row into `users` table with `role = 'admin'`.

6. Run local dev server:

   ```bash
   npm run dev
   ```

## Deployment (Vercel)

The app is deployed as **Uni SkillSphere** on Vercel:

- **URL:** [https://uni-skillsphere.vercel.app/](https://uni-skillsphere.vercel.app/)

To deploy your own fork or update the project:

1. Push the repository to GitHub.
2. Import the project in Vercel.
3. Add environment variables from `.env.example`.
4. Deploy.

## Notes

- No public student signup is implemented.
- Admin creates student accounts in Admin Portal.
- For production security, prefer moving student creation to Supabase Edge Function instead of exposing service-role key in browser environments.
