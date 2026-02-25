<h1 align="center">Drive Management System</h1>
<p align="center">🚀 A modern Next.js app to manage staff, candidates, client programs, and hiring drives</p>
<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js" />
  <img src="https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript" />
  <img src="https://img.shields.io/badge/TailwindCSS-v4-38bdf8?style=flat-square&logo=tailwindcss" />
  <img src="https://img.shields.io/badge/Supabase-Auth%20%26%20DB-3ecf8e?style=flat-square&logo=supabase" />
  <img src="https://img.shields.io/badge/TanStack_Table-v8-ff4154?style=flat-square" />
  <img src="https://img.shields.io/badge/License-Internal-orange?style=flat-square" />
</p>

---

## Table of Contents

1. [Introduction](#introduction)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Getting Started](#getting-started)
5. [Project Structure](#project-structure)
6. [Configuration](#configuration)
7. [Data Model Mapping](#data-model-mapping)
8. [Application Routes](#application-routes)
9. [Available Scripts](#available-scripts)
10. [Performance Notes](#performance-notes)
11. [Deployment](#deployment)
12. [License and Contribution](#license-and-contribution)

---

## Introduction

Drive Management System is a recruitment operations platform built with Next.js App Router and Supabase. It centralizes workflows for staff, candidate pipelines, client program tracking, and recruitment drives in a single dashboard-oriented application.

---

## Features

- ✅ Authentication flow with Supabase (`/login`)
- ✅ Dashboard with cross-entity analytics cards and trend chart
- ✅ CRUD management for:
  - Staff
  - Candidates
  - Client Programs
  - Drives
- ✅ Search, filtering, sorting, and pagination in entity tables
- ✅ Quick Create flow for candidates (`/candidate?add=1`)
- ✅ CSV export support per entity
- ✅ Responsive sidebar-based UI

---

## Tech Stack

| Tool | Description |
| ---- | ----------- |
| [Next.js 15](https://nextjs.org/) | App Router framework and runtime |
| [React 19](https://react.dev/) | UI layer |
| [TypeScript](https://www.typescriptlang.org/) | Static typing |
| [Tailwind CSS v4](https://tailwindcss.com/) | Utility-first styling |
| [Radix UI](https://www.radix-ui.com/) | Accessible primitive components |
| [Supabase](https://supabase.com/) | Authentication and Postgres-backed data |
| [TanStack Table](https://tanstack.com/table/latest) | Table engine for filtering/sorting |
| [Recharts](https://recharts.org/) | Dashboard charting |
| [Framer Motion](https://www.framer.com/motion/) | UI animation |

---

## Getting Started

### Clone the Repository

```bash
git clone <your-repo-url>
```

### Open the Project

```bash
cd drive-management-system
```

### Install Dependencies

```bash
pnpm install
```

### Configure Environment Variables

```bash
cp env.example .env.local
```

Update `.env.local` with your real Supabase project values.

### Run the Development Server

```bash
pnpm dev
```

Open `http://localhost:3000`.

---

## Project Structure

```bash
.
├── app/
│   ├── dashboard/
│   ├── staff/
│   ├── candidate/
│   ├── client/
│   ├── drive/
│   ├── login/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── Button/
│   ├── Cards/
│   ├── Chart/
│   ├── EntityTable/
│   ├── Skeleton/
│   └── ui/
├── hooks/
├── lib/
│   ├── auth/
│   ├── repositories/
│   └── subabase/
├── store/
├── supabase/
├── types/
├── env.example
├── next.config.ts
├── package.json
└── README.md
```

---

## Configuration

### Environment Variables

Set these in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

`env.example` also contains Kinde placeholders. Current code paths use Supabase auth and do not depend on Kinde variables.

---

## Data Model Mapping

Current repository-to-table mapping:

| Service | Table | ID Field |
| ------- | ----- | -------- |
| `clientDataService` | `client_data` | `programNo` |
| `staffDataService` | `staff_data` | `id` |
| `candidateDataService` | `candidate_data` | `id` |
| `driveDataService` | `drive_data` | `id` |

Reference: `lib/repositories/index.ts`.

---

## Application Routes

| Route | Description |
| ----- | ----------- |
| `/` | Landing page |
| `/login` | Auth screen |
| `/dashboard` | Overall analytics and trends |
| `/staff` | Staff management |
| `/candidate` | Candidate management |
| `/client` | Client program management |
| `/drive` | Drive management |

---

## Available Scripts

```bash
pnpm dev      # Start development server (Turbopack)
pnpm build    # Create production build
pnpm start    # Run production server
pnpm lint     # Run ESLint
```

---

## Performance Notes

- Current data fetching uses full-table reads (`select("*")`) in `DataService`.
- Table filtering and pagination are client-side.
- For large datasets, move to server-side pagination, filtering, and sorting.

---

## Deployment

### Vercel (Recommended)

1. Push repository to GitHub.
2. Import project into Vercel.
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel Environment Variables.
4. Deploy.

### Self-hosted

1. Build app:

```bash
pnpm build
```

2. Run app:

```bash
pnpm start
```

---

## License and Contribution

This project is currently treated as an internal/private codebase.

## 🤝 Contribution Guidelines

- Create a branch from main (`feature/<name>` or `fix/<name>`).
- Keep PRs scoped and include clear change notes.
- Run lint before opening PR:

```bash
pnpm lint
```

---
