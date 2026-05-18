# VoteSphere — Modern Election Management System

🌍 **Live Demo:** [https://votesphere-fmrolcpi7-shinefatim151-8164s-projects.vercel.app](https://votesphere-fmrolcpi7-shinefatim151-8164s-projects.vercel.app)

VoteSphere is a highly secure, comprehensive, and scalable web-based Election Management System (EMS). Designed for organizations, universities, and communities, VoteSphere makes it effortless to create, manage, and participate in transparent digital elections.

## ✨ Key Features

### 🏢 **Role-Based Access Architecture**
VoteSphere is built around a secure three-tier access control system:
- **Super Admin**: Oversees platform health, manages users, approves election creators, and monitors audit logs.
- **Election Creator**: Can draft elections, register candidates, monitor voter registration, and view real-time results.
- **Voter**: Registers for elections using an encrypted **Secret ID**, votes securely, and views public results.

### 🗳️ **Election Workflow & Transparency**
- **Draft & Approval**: Creators submit elections which are reviewed by the Super Admin to maintain platform integrity.
- **Live Showcase**: An elegant public landing page automatically showcases Active and Approved elections.
- **Secret ID Voting**: A highly secure mechanism where voters are issued single-use cryptographic Secret IDs, ensuring anonymity and preventing duplicate voting.
- **Real-Time Results**: Beautiful, animated result trackers that become visible once an election concludes.

### 🎨 **Modern & Engaging UI/UX**
- Fully responsive design using **Tailwind CSS**.
- Dynamic, data-driven dashboards with rich metrics, charts, and activity feeds.
- Beautiful micro-interactions and animations powered by **Framer Motion**.
- Intelligent toast notifications and status badges.

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Routing**: React Router DOM (v6)
- **State Management**: Zustand (Modular stores for Auth, Elections, Voting, and Notifications)
- **Styling**: Tailwind CSS, Lucide React (Icons)
- **Backend/Database**: Supabase (PostgreSQL, Row Level Security, Realtime Subscriptions)
- **Authentication**: Supabase Auth (Email/Password, Role-based JWTs)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn
- A Supabase Project

### Installation

1. **Clone the repository** (or navigate to the frontend directory):
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create a `.env` file in the `frontend` root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database Migration**:
   Apply the SQL schemas and policies to your Supabase project. You can run the contents of the `.sql` files found in `supabase/migrations/` inside the Supabase SQL Editor to set up the tables, Row Level Security (RLS) policies, and triggers.

5. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   The application will be running at `http://localhost:5173` (or `5174`).

## 🗄️ Database Schema & RLS

VoteSphere heavily utilizes **PostgreSQL Row Level Security (RLS)** in Supabase to enforce data privacy directly at the database layer. 
- `profiles`: Stores user roles, verification status, and organization info.
- `elections`: Tracks election metadata and lifecycle statuses (`draft`, `pending`, `approved`, `active`, `completed`).
- `election_requests`: Used by admins to vet new Election Creator signups.
- `candidates`: Tied strictly to elections.
- `voter_registrations` & `secret_ids`: Handles secure voter participation workflows.
- `audit_logs`: A tamper-evident log for critical administrative actions.

## 🔒 Security

- **Trigger Automations**: Automated triggers handle profile creation on signup and automatically route creators into a pending approval workflow.
- **Voter Anonymity**: Votes are tied to temporary Secret IDs rather than user profiles to maintain ballot secrecy.
- **Guarded Routes**: Frontend incorporates strict `AuthGuard`, `RoleGuard`, and `GuestGuard` wrappers to prevent unauthorized UI access.

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License
This project is licensed under the MIT License.
