# Foodify (Mini Foodpanda Clone)

Foodify is a simple full-stack food ordering system with:
- Customer and Restaurant roles
- Panda animated login/register UI
- Restaurant, menu, cart, and order workflows

## Tech Stack
- Frontend: React + Bootstrap + Axios
- Backend: Node.js + Express (MVC)
- Database: MySQL
- Auth: JWT + role-based authorization

## Project Structure
- `frontend/` React app
- `backend/` Express API
- `backend/sql/schema.sql` database schema

## Setup

### 1) Database
1. Create MySQL database/tables by running:
   - `backend/sql/schema.sql`
2. Copy `backend/.env.example` to `backend/.env`
3. Update database credentials in `backend/.env`
4. (Optional demo data) Run:
   - `cd backend && npm run seed`

### 2) Backend
```bash
cd backend
npm install
npm run dev
```
Backend runs on `http://localhost:5000`

### 3) Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`

## Demo Seed Accounts (Restaurant)
- Password for all demo restaurant accounts: `12345678`
- `spicehub@foodify.demo`
- `burgerpoint@foodify.demo`
- `pastahouse@foodify.demo`

## Demo Seed Account (Customer)
- Email: `customer@foodify.demo`
- Password: `12345678`
- Seed also inserts sample `pending` and `accepted` orders so restaurant dashboards show incoming orders immediately.

## Auth and Roles
- Register with role:
  - `customer`
  - `restaurant`
- Login redirects by role:
  - Customer -> `/customer`
  - Restaurant -> `/restaurant`

## Core Features
- Authentication: register/login with hashed password + JWT
- Customer:
  - View restaurants
  - View menu
  - Add/remove cart items
  - Place order
- Restaurant:
  - Add/update/delete menu items
  - View incoming orders
  - Accept pending orders

## Important Note About Panda UI
- Panda login style and animation behavior are preserved
- Alignment and responsiveness are improved for clean center layout
- Authentication logic is wired through React/JS without redesigning the visual style
