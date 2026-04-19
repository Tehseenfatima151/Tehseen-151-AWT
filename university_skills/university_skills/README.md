# CUI SkillSphere — Talent Discovery & Opportunity Platform

A full-stack university skill portfolio and **talent discovery platform** for **COMSATS University Islamabad**. Students build professional portfolios; admins post opportunities, discover talent, and manage applications — all in one place. Built with React + Supabase.

## Live Demo

**Production (Vercel):** [https://uni-skillsphere.vercel.app/](https://uni-skillsphere.vercel.app/)

### Login Credentials

| Role    | Email                   | Password |
|---------|-------------------------|----------|
| Admin   | tehseen151@gmail.com    | 12345678 |
| Student | aliza123@gmail.com      | 12345678 |

---

## Features

### 🎓 Student Portal
- **Dashboard** — Stats overview with application status cards (Pending / Accepted / Rejected)
- **Profile Management** — Profile image upload, bio, contact info
- **Skills CRUD** — Add skills with proficiency levels and visual progress bars
- **Projects CRUD** — Projects with cover images, tech stack, and GitHub links
- **Certificates** — Upload and manage certificates with preview links
- **Services** — List professional services with availability info
- **Education & Experience** — Academic and work history
- **Portfolio** — Public shareable portfolio URL (no login required to view)
- **Opportunities Board** — Browse all posted jobs/internships/projects from admins
- **My Applications** — Track application status in real-time (Pending / Accepted / Rejected)

### 🛡️ Admin Portal
- **Dashboard** — Global platform stats (students, skills, projects, certificates, etc.)
- **Talent Discovery** — Search and filter students by skill, department, and badges
  - Toggle **Verified Developer** and **Top Performer** badges per student
- **Opportunities Board** — Post, edit, and delete real-world job/internship opportunities
  - Required skills stored as JSON arrays for powerful skill-based filtering
  - Set deadlines per opportunity
- **Applications Management** — Review all student applications with status control (Accept / Reject)
- **Student Portfolios** — View any student's full portfolio, write feedback, assign ratings (1–5)
- **Leaderboard** — Live rankings of top-rated students with animated premium UI
- **Moderation** — Review and delete user-generated content (skills, projects, certificates)
- **Feedback** — Send personalized feedback messages to students

### 🌐 Public Portfolio Page
- Viewable by anyone without login
- Displays profile, badges (Verified Developer / Top Performer), skills, projects, services, certificates, education, experience, and social links
- **Hire Me** button — Opens a contact modal with pre-filled email draft sent via your local email client
- **LinkedIn** button — Opens student's LinkedIn in a new tab
- Animated with Framer Motion — premium first impression

---

## Tech Stack

| Layer        | Technology |
|--------------|------------|
| Frontend     | React 19 (Vite 8) |
| Styling      | Tailwind CSS v4 |
| Animations   | Framer Motion |
| Database     | Supabase (PostgreSQL) |
| Auth         | Supabase Auth |
| Storage      | Supabase Storage |
| Routing      | React Router v7 |
| Icons        | Lucide React |
| Toasts       | React Hot Toast |
| Charts       | Recharts |

---

## Database Schema

Tables created by `supabase/schema.sql` and migrated by `supabase/migrations/20260419200000_opportunity_features.sql`:

| Table          | Description |
|----------------|-------------|
| `users`        | Students and admins with role, badges, and contact info |
| `skills`       | Student skills with proficiency levels |
| `projects`     | Student projects with cover images |
| `services`     | Professional services offered by students |
| `certificates` | Uploaded certificate files |
| `education`    | Academic history |
| `experience`   | Work/internship experience |
| `ratings`      | Admin ratings for students (1–5) |
| `feedback`     | Admin feedback messages per student |
| `opportunities`| Job/internship/project postings by admins |
| `applications` | Student applications linked to opportunities |

### New columns on `users` (added via migration)
- `is_verified_developer` — Boolean badge controlled by admin
- `is_top_performer` — Boolean badge controlled by admin
- `contact_email` — Optional public contact email
- `linkedin_url` — Optional LinkedIn profile link

---

## Project Structure

```
src/
  components/
    common/          # Reusable UI (EmptyState, Skeleton, PageTransition...)
    layout/          # DashboardLayout, SiteBackground
    portfolio/       # PortfolioView component
  context/
    AuthContext.jsx  # Auth state, optimistic signOut, profile fetching
  lib/
    supabase.js      # Singleton Supabase client (prevents GoTrueClient conflicts)
  pages/
    admin/
      AdminDashboardPage.jsx
      AdminStudentsPage.jsx        # Talent Discovery with skill search + badge toggles
      AdminOpportunitiesPage.jsx   # Post / Edit / Delete opportunities
      AdminApplicationsPage.jsx    # Review and update application statuses
      AdminLeaderboardPage.jsx     # Animated leaderboard
      AdminFeedbackPage.jsx
      AdminModerationPage.jsx
      AdminStudentPortfolioPage.jsx
    student/
      StudentDashboardPage.jsx     # With application stats
      StudentOpportunitiesPage.jsx # Browse and apply for opportunities
      StudentApplicationsPage.jsx  # Track application status
      StudentProfilePage.jsx
      StudentSkillsPage.jsx
      StudentProjectsPage.jsx
      StudentServicesPage.jsx
      StudentCertificatesPage.jsx
      StudentPortfolioPage.jsx
    PublicPortfolioPage.jsx
  services/
    adminService.js   # Admin CRUD (uses service-role key for RLS bypass)
    studentService.js # Student data operations
  utils/
    portalConfig.js   # Navigation config for both portals
supabase/
  schema.sql
  fix_all_rls.sql
  migrations/
    20260419200000_opportunity_features.sql
```

---

## Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure environment:**

   ```bash
   cp .env.example .env
   ```

   Fill in these values:

   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

   > ⚠️ The service role key is needed for admin operations (create student accounts, post opportunities, manage applications). In production, move these to Edge Functions.

3. **Run schema in Supabase SQL editor:**

   ```
   supabase/schema.sql
   ```

4. **Run the opportunity features migration:**

   ```
   supabase/migrations/20260419200000_opportunity_features.sql
   ```

5. **Fix RLS policies (if login loops or read errors occur):**

   ```
   supabase/fix_all_rls.sql
   ```

6. **Create your admin user:**
   - Create account in Supabase Auth Dashboard.
   - Insert matching row into `users` table:
     ```sql
     INSERT INTO public.users (id, name, email, role)
     VALUES ('<auth-user-id>', 'Admin Name', 'admin@example.com', 'admin');
     ```

7. **Start the dev server:**

   ```bash
   npm run dev
   ```

---

## Deployment (Vercel)

1. Push the repository to GitHub.
2. Import the project in [Vercel](https://vercel.com).
3. Add environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SUPABASE_SERVICE_ROLE_KEY`).
4. Deploy.

**Live URL:** [https://uni-skillsphere.vercel.app/](https://uni-skillsphere.vercel.app/)

---

## Application Flow (End-to-End)

```
Admin posts opportunity
        ↓
Student views opportunity on Opportunities Board
        ↓
Student clicks Apply
        ↓
Admin sees application in Applications Management
        ↓
Admin sets status → Accepted / Rejected
        ↓
Student sees updated status in My Applications
```

---

## Notes

- No public student self-signup — admin creates all student accounts.
- The `supabaseAdmin` client (service role) uses a separate `storageKey` to prevent GoTrueClient auth lock conflicts in the browser.
- RLS policies use inline subqueries `(SELECT role FROM users WHERE id = auth.uid())` — the `is_admin()` function was intentionally removed to prevent recursive deadlocks.
- All opportunity and application CRUD bypasses RLS via the service-role client for reliable admin access.
