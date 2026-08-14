# Apiary App

Modern apiary management for beekeepers — built with Next.js, Supabase, and Tailwind CSS. Default location context: **Agra, Oklahoma**.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS v4, Shadcn/Radix primitives, Recharts, Lucide icons
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **State**: TanStack Query

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Supabase

Copy `.env.local.example` to `.env.local` and add your Supabase project credentials:

```bash
cp .env.local.example .env.local
```

### 3. Run the database migration

Apply the schema in `supabase/migrations/20260729000000_initial_schema.sql` via the Supabase SQL editor or CLI:

```bash
npx supabase db push
```

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
├── components/
│   ├── dashboard/          # Dashboard widgets
│   ├── layout/             # Sidebar, navigation
│   └── ui/                 # Shadcn-style primitives
├── lib/
│   ├── supabase/           # Client, server, middleware
│   └── utils.ts            # Helpers, seasonal advice
└── types/
    └── database.ts         # Supabase TypeScript definitions
supabase/
└── migrations/             # PostgreSQL schema + RLS
```

## Database Schema

| Table | Purpose |
|-------|---------|
| `apiaries` | Top-level apiary locations |
| `hives` | Individual colonies (includes current honey super count) |
| `inspections` | Field inspection records (including supers added or removed) |
| `queen_logs` | Queen status tracking |
| `mite_counts` | Varroa mite test results |
| `treatments` | Treatment schedules |
| `honey_yields` | Harvest records |
| `expenses` | Cost tracking |

All tables have Row Level Security policies scoped to the authenticated user.

## Auth

Sign up at `/signup`, sign in at `/login`. Protected routes redirect to login when you are signed out.

1. Put your Supabase URL + anon key in `.env.local`
2. Run the SQL migration in the Supabase SQL Editor
3. Authentication → Providers → Email (optionally disable Confirm email for local testing)
4. Restart `npm run dev` and create an account

