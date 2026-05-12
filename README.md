# Meclones Academy — School Management Platform

> A full-featured, role-based school management system for a premium Nigerian combined school (Nursery–SS3). Built with React 18, TypeScript, Vite 5, Tailwind CSS, shadcn/ui, and Supabase. **Now live on Vercel with real backend authentication.**

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [File Architecture](#file-architecture)
4. [File Structure](#file-structure)
5. [Design System](#design-system)
6. [What Has Been Achieved](#what-has-been-achieved)
7. [What Remains (Road to Production)](#what-remains-road-to-production)
8. [Getting Started (Local Dev)](#getting-started-local-dev)

---

## Project Overview

Meclones Academy is a **premium combined school** in Lagos, Nigeria, offering education from Nursery through SS3. This repository contains both the **public-facing marketing website** and the **internal school management portal**, served from the same React SPA.

The portal supports **four user roles**, each with their own dedicated dashboard and sub-pages:

| Role | Portal Route | Primary Purpose |
|---|---|---|
| Admin | `/dashboard/admin` | School-wide management, attendance policy, timetables, fees |
| Teacher | `/dashboard/teacher` | Class management, student attendance, assignments, clock-in |
| Student | `/dashboard/student` | Courses, results, timetable, assignments |
| Parent | `/dashboard/parent` | Children overview, fees, attendance monitoring |

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build Tool | Vite 5 (SWC transformer) |
| Styling | Tailwind CSS v3 + custom HSL design tokens |
| Components | shadcn/ui (Radix UI primitives) |
| State Management | Zustand v5 (timetable/UI only) + Supabase (persistent data) |
| Routing | React Router DOM v6 |
| Forms | React Hook Form + Zod validation |
| Data Fetching | TanStack React Query v5 |
| Notifications | Sonner (toast) |
| Icons | Lucide React |
| Charts | Recharts |
| Fonts | Inter (sans) + Fraunces (display) via Google Fonts |
| Backend / Database | Supabase (PostgreSQL + Auth + Row Level Security) |
| Hosting | Vercel (automatic GitHub deploys) |
| Testing | Vitest + Testing Library |
| Linting | ESLint 9 + TypeScript-ESLint |

---

## File Architecture

```
meclones-premier/
│
├── public/                    # Static assets served at root
│   ├── favicon.png            # Meclones Academy school emblem
│   ├── placeholder.svg        # Generic image placeholder
│   └── robots.txt             # SEO crawler directives
│
├── src/
│   ├── main.tsx               # React root mount
│   ├── App.tsx                # Router tree — all routes declared here
│   ├── App.css                # Global app-level styles (minimal)
│   ├── index.css              # Tailwind directives + CSS custom properties (design tokens)
│   ├── vite-env.d.ts          # Vite type declarations
│   │
│   ├── store/
│   │   └── index.ts           # Zustand global state (timetables, teacher attendance)
│   │
│   ├── lib/
│   │   └── utils.ts           # cn() helper (clsx + tailwind-merge)
│   │
│   ├── hooks/                 # Custom React hooks (currently minimal)
│   │
│   ├── assets/                # Bundled static assets (images, SVGs)
│   │
│   ├── components/
│   │   ├── NavLink.tsx        # Active-aware router link wrapper
│   │   ├── ui/                # shadcn/ui primitives (button, card, dialog, etc.)
│   │   ├── site/              # Public website components
│   │   │   ├── SiteLayout.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── PageHero.tsx
│   │   │   ├── CTABanner.tsx
│   │   │   └── MobileStickyCTA.tsx
│   │   └── dashboard/         # Shared dashboard components
│   │       ├── DashboardLayout.tsx   # Sidebar + content shell (all portals)
│   │       └── StatCard.tsx          # KPI summary card
│   │
│   ├── pages/
│   │   ├── Home.tsx           # Public homepage
│   │   ├── Primary.tsx        # Primary school page
│   │   ├── Secondary.tsx      # Secondary school page
│   │   ├── About.tsx
│   │   ├── Admissions.tsx
│   │   ├── Fees.tsx
│   │   ├── News.tsx
│   │   ├── Contact.tsx
│   │   ├── NotFound.tsx       # 404 fallback
│   │   │
│   │   ├── auth/
│   │   │   ├── Login.tsx      # Role-based login (Admin/Teacher/Student/Parent)
│   │   │   └── ForgotPassword.tsx
│   │   │
│   │   └── dashboard/
│   │       ├── AdminDashboard.tsx    # Admin layout + home overview
│   │       ├── TeacherDashboard.tsx  # Teacher layout + home overview
│   │       ├── StudentDashboard.tsx  # Student layout + home overview
│   │       ├── ParentDashboard.tsx   # Parent layout + home overview
│   │       │
│   │       ├── admin/
│   │       │   ├── Attendance.tsx    # Biometric attendance matrix + policy config
│   │       │   ├── Students.tsx      # Full student roster management
│   │       │   ├── Teachers.tsx      # Teacher management + clock-in status
│   │       │   ├── Fees.tsx          # Fee tracking
│   │       │   ├── Admissions.tsx    # Application management
│   │       │   ├── Academics.tsx     # Subject/class oversight
│   │       │   ├── Timetable.tsx     # School-wide timetable editor
│   │       │   └── Announcements.tsx # Notice board management
│   │       │
│   │       ├── teacher/
│   │       │   ├── ClockinClockout.tsx  # ★ My Attendance — live clock, sign-in/out, history
│   │       │   ├── Attendance.tsx        # Mark student attendance per class
│   │       │   ├── Classes.tsx
│   │       │   ├── Students.tsx
│   │       │   ├── Assignments.tsx
│   │       │   ├── Exams.tsx
│   │       │   ├── Timetable.tsx         # Reads from Zustand (admin-driven)
│   │       │   ├── Messages.tsx
│   │       │   ├── Reports.tsx
│   │       │   └── Settings.tsx
│   │       │
│   │       ├── student/
│   │       │   ├── Courses.tsx
│   │       │   ├── Assignments.tsx
│   │       │   ├── Results.tsx
│   │       │   ├── Timetable.tsx
│   │       │   ├── Attendance.tsx
│   │       │   ├── Messages.tsx
│   │       │   ├── Resources.tsx
│   │       │   ├── Profile.tsx
│   │       │   └── Settings.tsx
│   │       │
│   │       └── parent/
│   │           ├── Children.tsx
│   │           ├── Fees.tsx
│   │           ├── Attendance.tsx
│   │           ├── Results.tsx
│   │           ├── Messages.tsx
│   │           ├── Calendar.tsx
│   │           ├── Reports.tsx
│   │           └── Settings.tsx
│   │
│   └── test/                  # Vitest test files
│
├── index.html                 # HTML entry point (SEO meta, favicon, OG tags)
├── package.json               # Dependencies + scripts
├── tailwind.config.ts         # Tailwind + custom color tokens
├── vite.config.ts             # Vite build config (port 8080, @-alias)
├── tsconfig.json              # TypeScript root config
├── tsconfig.app.json          # App-level TS config
├── components.json            # shadcn/ui registry config
├── eslint.config.js           # ESLint flat config
└── vitest.config.ts           # Vitest config (jsdom environment)
```

---

## Design System

The project uses a **custom HSL token system** defined in `src/index.css` and extended in `tailwind.config.ts`.

### Core Color Tokens

| Token | HSL Value | Usage |
|---|---|---|
| `--navy` | `220 70% 14%` | Primary text, buttons, headers |
| `--gold` | `44 80% 53%` | Accent, active states, highlights |
| `--cream` | `44 33% 96%` | Page background |
| `--primary` | Same as `--navy` | shadcn button default |
| `--accent` | Same as `--gold` | shadcn accent |
| `--muted` | `44 20% 90%` | Subtle backgrounds |

### Typography
- **Display / Headings**: `Fraunces` (serif, variable optical size)
- **Body / UI**: `Inter` (geometric sans)
- Base `--radius`: `0.25rem` — intentionally minimal; components use `rounded-md` / `rounded-lg`

### Component Conventions
- Cards: `bg-white border border-border` (no shadow by default)
- Active tab: `bg-navy text-white` or `bg-navy text-gold`
- Primary action buttons: `bg-navy text-gold hover:bg-navy/90`
- Secondary/outline buttons: `border border-primary text-primary hover:bg-primary/5`
- Status badges: semantic colors (`emerald`, `amber`, `rose`, `violet`)

---

## What Has Been Achieved

> Last updated: May 2026. Production URL: **https://meclones-premier.vercel.app**

### ✅ Infrastructure & Deployment
- [x] **Live on Vercel** — automatic deploys on every `git push` to `main`
- [x] **Supabase backend** — 16-table PostgreSQL schema with Row Level Security (RLS)
- [x] **Environment variables** configured on Vercel (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
- [x] **Global Error Boundary** — the app shows a diagnostic screen instead of a white page if something crashes
- [x] **Supabase URL auto-fix** — handles cases where only the project ID is provided instead of the full URL

### ✅ Public Website
- [x] Full multi-page marketing site (Home, Primary, Secondary, About, Admissions, Fees, News, Contact)
- [x] Responsive Navbar with mobile menu
- [x] Footer with school links and contact info
- [x] Hero sections, CTA banners, and mobile sticky CTA
- [x] SEO meta tags, OG tags, Twitter card tags

### ✅ Authentication (Live)
- [x] **Real Supabase Auth** — `signInWithPassword`, session tokens, JWT
- [x] **AuthGuard** — all `/dashboard/*` routes are protected; unauthenticated users are redirected to `/login`
- [x] **Role-based routing** — user role is read from Supabase `profiles` table → redirected to `/dashboard/:role`
- [x] **Metadata fallback** — role stored in `user_metadata` to bypass RLS on first login
- [x] **Admin auto-provisioning** — if `admin@meclones.edu.ng` logs in without a profile row, role is assigned automatically
- [x] Forgot Password page (Supabase magic link)

### ✅ Admin Portal — Wired to Supabase
- [x] **Teachers** — loads real teacher records from `teachers` table, shows active count
- [x] **Admissions** — loads applications from `admissions` table; approve/reject writes back to DB
- [x] **Fees (Admin)** — loads payment history from `payments` table, shows collection totals
- [x] **Announcements** — loads and creates announcements from `announcements` table
- [x] Dashboard overview UI (KPI stat cards)
- [x] Students management table (UI only — see below)

### ✅ Teacher Portal — Wired to Supabase
- [x] **Clock-In / Clock-Out** — persistent timestamps in `teacher_clockin` table; history loads from DB
- [x] **Mark Attendance** — loads students from `timetable` table by assigned class; saves records via `upsert` to `attendance` table

### ✅ Student Portal — Wired to Supabase
- [x] **Results** — loads from `results` joined with `exams` tables
- [x] **Attendance** — loads personal attendance history from `attendance` table with live progress bars

### ✅ Parent Portal — Wired to Supabase
- [x] **Children** — loads child profiles with live attendance rates and subject scores
- [x] **Fees** — loads payment history and outstanding balances from `fees` and `payments` tables

### ✅ Branding / Housekeeping
- [x] Custom Meclones Academy school emblem favicon
- [x] Cleaned all third-party meta tags from `index.html`
- [x] Package renamed and versioned to `meclones-premier@1.0.0`

---

## What Remains (Road to Full Production)

### 🔴 Critical — Pages Still on Mock/Dummy Data

These pages are fully designed but still show hardcoded data, not live database records:

| Page | Location | Status | Fix Needed |
|---|---|---|---|
| Admin Dashboard (overview stats) | `AdminDashboard.tsx` | 🔴 Mock | Wire stats to `students`, `teachers`, `payments` counts |
| Admin Students Roster | `admin/Students.tsx` | 🔴 Mock | Load from `students` table |
| Admin Attendance Matrix | `admin/Attendance.tsx` | 🔴 Mock | Load from `attendance` + `teacher_clockin` tables |
| Admin Academics (Classes/Subjects) | `admin/Academics.tsx` | 🔴 Zustand | Wire to `classes` table in Supabase |
| Admin Timetable | `admin/Timetable.tsx` | 🔴 Zustand | Wire to `timetable` table in Supabase |
| Teacher Classes | `teacher/Classes.tsx` | 🔴 Mock | Load teacher's classes from `timetable` |
| Teacher Students | `teacher/Students.tsx` | 🔴 Mock | Load students from teacher's class |
| Teacher Assignments | `teacher/Assignments.tsx` | 🔴 Mock | Load from `assignments` table |
| Teacher Exams | `teacher/Exams.tsx` | 🔴 Mock | Load from `exams` table |
| Teacher Timetable | `teacher/Timetable.tsx` | 🔴 Zustand | Load from `timetable` table |
| Student Courses | `student/Courses.tsx` | 🔴 Mock | Load from `timetable` by student's class |
| Student Assignments | `student/Assignments.tsx` | 🔴 Mock | Load from `assignments` table |
| Student Timetable | `student/Timetable.tsx` | 🔴 Mock | Load from `timetable` table |
| Parent Attendance | `parent/Attendance.tsx` | 🔴 Mock | Load from `attendance` for children |
| Parent Results | `parent/Results.tsx` | 🔴 Mock | Load from `results` for children |

### 🟡 Important — Partially Done or Not Started

#### 1. Profiles Table INSERT Policy (Security Fix)
**Problem:** The `profiles` table has no INSERT RLS policy, so the frontend cannot create profile rows.
**Fix:** Run this SQL in Supabase SQL Editor:
```sql
-- Allow users to insert their own profile row on first login
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```
Once this is done, the admin email bypass in `Login.tsx` can be removed.

#### 2. Paystack Payment Integration
**What:** The "Pay Now" button in `parent/Fees.tsx` is a placeholder.
**How:** Use the `react-paystack` package (already installed):
```tsx
<PaystackButton
  publicKey={import.meta.env.VITE_PAYSTACK_PUBLIC_KEY}
  amount={amount * 100}  // kobo
  email={parentEmail}
  onSuccess={(ref) => recordPayment(ref)}
/>
```
Add `VITE_PAYSTACK_PUBLIC_KEY` to Vercel env vars.

#### 3. Messaging System
**What:** All Messages pages (`teacher/Messages.tsx`, `student/Messages.tsx`, `parent/Messages.tsx`) are static UI shells.
**How:** Wire to the `messages` table (already in schema). Use Supabase real-time subscriptions for live chat.

#### 4. Real-Time Teacher Clock-In on Admin Dashboard
**What:** Admin Teacher table shows teacher status but reads from Zustand (lost on refresh).
**How:** Replace with a Supabase real-time subscription to `teacher_clockin` table.

#### 5. Admin Student Admissions → Auto-Create User Account
**What:** When admin approves an admission, the student should automatically get a Supabase Auth account.
**How:** Use a Supabase Edge Function to call `supabase.auth.admin.createUser()` on approval.

### 🟢 Polish

| Item | Status |
|---|---|
| PDF report generation (jsPDF) | Not started |
| Mobile responsive audit of dashboard tables | Not done |
| Automated tests (Vitest + Playwright) | Not done |
| OG image for social sharing | Placeholder URL |
| Notifications / unread badge in sidebar | Not wired |

---

## Getting Started (Local Dev)

### Prerequisites
- Node.js 18+
- npm 9+

### Setup

```bash
# Clone
git clone https://github.com/Teleiosite/meclones-premier.git
cd meclones-premier

# Install dependencies
npm install

# Create .env file
echo "VITE_SUPABASE_URL=https://your-project-id.supabase.co" >> .env
echo "VITE_SUPABASE_ANON_KEY=your-anon-key" >> .env

# Start dev server (runs on http://localhost:8080)
npm run dev
```

### Available Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Start Vite dev server on port 8080 |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest test suite once |
| `npm run test:watch` | Run Vitest in watch mode |

### Live Credentials (Production)

Authentication is **live and real** — credentials are stored in Supabase Auth.

| Role | Email | Notes |
|---|---|---|
| Admin | `admin@meclones.edu.ng` | Auto-provisioned on first login |
| Teacher | Create in Supabase Auth + `profiles` table | Assign `role = 'teacher'` |
| Student | Create in Supabase Auth + `profiles` table | Assign `role = 'student'` |
| Parent | Create in Supabase Auth + `profiles` table | Assign `role = 'parent'` |

### ✅ Public Website
- [x] Full multi-page marketing site (Home, Primary, Secondary, About, Admissions, Fees, News, Contact)
- [x] Responsive Navbar with mobile menu
- [x] Footer with school links and contact info
- [x] Hero sections, CTA banners, and mobile sticky CTA
- [x] SEO meta tags, OG tags, Twitter card tags (Meclones-branded)

### ✅ Authentication Shell
- [x] Login page with role selector (Admin / Teacher / Student / Parent)
- [x] Forgot Password page
- [x] Route-based portal separation (each role has its own `/dashboard/:role` tree)
> ⚠️ Authentication is **UI only** — no real backend auth, no session tokens, no protected routes yet.

### ✅ Admin Portal
- [x] Dashboard overview with KPI stat cards
- [x] **Attendance Matrix** — Surveillance log, Anomaly Detection, Security Policy (IP/GPS) tabs; fully consistent UI (navy/gold design tokens)
- [x] Students management table (search, filter, status badges)
- [x] Teachers management table with real-time clock-in status (via Zustand)
- [x] Fees tracking page
- [x] Admissions management
- [x] Academics overview
- [x] Timetable editor (reads/writes Zustand global state)
- [x] Announcements/notice board

### ✅ Teacher Portal
- [x] Dashboard with class stats, today's schedule, assignment overview, quick actions, pending tasks
- [x] **My Attendance (ClockinClockout)** — live real-time clock, Sign In / Sign Out (Zustand-backed), sign-in window info cards, attendance history table with seeded records
- [x] Mark Attendance — class selector, student toggle grid, save/mark-all-present
- [x] My Classes
- [x] Students list
- [x] Assignments
- [x] Exams & Grading
- [x] Timetable (reads admin-set Zustand timetable)
- [x] Messages
- [x] Reports
- [x] Settings

### ✅ Student Portal
- [x] Dashboard with KPI cards
- [x] Courses, Assignments, Results, Timetable, Attendance, Messages, Resources, Profile, Settings

### ✅ Parent Portal
- [x] Dashboard with children overview
- [x] Children, Fees, Attendance, Results, Messages, Calendar, Reports, Settings

### ✅ Global State
- [x] Zustand store for timetable data (admin writes → teacher reads)
- [x] Zustand store for teacher clock-in status (teacher writes → admin reads)

### ✅ Branding / Housekeeping
- [x] Removed all `lovable-tagger` references (package, vite config, node_modules)
- [x] Replaced Lovable favicon with custom Meclones Academy school emblem
- [x] Cleaned all `@Lovable` / `lovable.dev` meta tags from `index.html`
- [x] Renamed package from `vite_react_shadcn_ts` → `meclones-premier`
- [x] Version bumped to `1.0.0`

---

## What Remains (Road to Production)

### 🔴 Critical — Must-Haves Before Launch

#### 1. Real Authentication & Authorization
**What:** Replace the UI-only login shell with a real auth system.
**How:**
- Integrate **Supabase Auth** (recommended — free tier generous, Nigerian-friendly latency via EU region) or **Firebase Auth**
- Implement JWT-based session management
- Create protected route wrappers that redirect unauthenticated users to `/login`
- Map authenticated user `role` field to the correct portal (`/dashboard/:role`)
- Store user profile in Supabase `profiles` table linked to `auth.users`

```
Files to create/modify:
  src/hooks/useAuth.ts           ← session hook
  src/components/ProtectedRoute.tsx ← route guard
  src/pages/auth/Login.tsx       ← wire to real API
  src/App.tsx                    ← wrap all dashboard routes with ProtectedRoute
```

#### 2. Real Database
**What:** All data is currently hardcoded mock data inside components. None persists between page refreshes.
**How:** Use **Supabase** (PostgreSQL) with the following core tables:

```sql
-- Core tables needed
users (id, role, name, email, photo_url, created_at)
students (id, user_id, class, admission_no, guardian_id)
teachers (id, user_id, subjects, employee_id)
parents (id, user_id)
children (parent_id, student_id)         -- junction table

attendance_logs (id, teacher_id, check_in, check_out, date, status)
student_attendance (id, student_id, class, date, present, marked_by)

assignments (id, title, class, subject, due_date, teacher_id)
submissions (id, assignment_id, student_id, file_url, submitted_at, grade)

timetable_slots (id, teacher_id, day, time_slot, class, room)
fee_records (id, student_id, amount, term, status, paid_at)
announcements (id, title, body, audience, created_by, created_at)
```

#### 3. File/Image Storage
**What:** Student photos, profile pictures, assignment submissions, and report card PDFs are not storable yet.
**How:** Supabase Storage buckets — `avatars`, `submissions`, `reports`.

#### 4. Replace Hardcoded Placeholder Data
**What:** Every portal uses local JS arrays as mock data. These need replacing with real API calls.
**How:** Use **TanStack React Query** (already installed) to `useQuery` from Supabase client.

```
Priority pages (in order):
  1. admin/Students.tsx       ← useQuery(['students'])
  2. admin/Teachers.tsx       ← useQuery(['teachers'])
  3. admin/Fees.tsx           ← useQuery(['fees'])
  4. teacher/ClockinClockout  ← useMutation + useQuery on attendance_logs
  5. teacher/Attendance.tsx   ← useMutation on student_attendance
  6. student/Results.tsx      ← useQuery(['results', studentId])
```

---

### 🟡 Important — For Full Functionality

#### 5. Real-Time Clock-In Sync (Admin ↔ Teacher)
**What:** Currently uses Zustand in-memory state — admin sees teacher clock-in status, but only within the same browser tab session. Refreshing loses all data.
**How:** Replace Zustand `attendance` slice with Supabase real-time subscriptions:
```ts
supabase.from('attendance_logs').on('INSERT', callback).subscribe()
```
The admin teacher management page then streams live clock-in events.

#### 6. Messaging System
**What:** Messages pages exist as UI shells with hardcoded message arrays.
**How:** Implement with Supabase real-time:
- `messages` table: `(id, from_id, to_id, body, read, created_at)`
- Subscribe to new messages per user session
- Can scope to parent↔teacher, teacher↔admin conversations

#### 7. Notifications & Announcements
**What:** Announcements page exists but doesn't broadcast to portals.
**How:** Create a `notifications` table and show unread count badge in DashboardLayout sidebar.

#### 8. Report Generation
**What:** Reports pages exist as static layouts.
**How:**
- Use **Recharts** (already installed) to chart real attendance/grade data fetched from Supabase
- Add PDF export using `jsPDF` or `@react-pdf/renderer` for student result slips and teacher attendance reports

#### 9. Timetable Persistence
**What:** Timetable edits made by admin live only in Zustand (lost on refresh).
**How:** Wire `setTimetableSlot` in Zustand to also write to `timetable_slots` table in Supabase. Load from Supabase on app init.

#### 10. Fee Payment Integration
**What:** Fees page shows records but has no payment gateway.
**How:** Integrate **Paystack** (Nigerian payment gateway, best in class):
- Paystack Popup SDK for one-click payment
- Webhook endpoint (Supabase Edge Function) to confirm payment and update `fee_records`
- WhatsApp or email receipt via Supabase + Resend

---

### 🟢 Polish — Production Quality

#### 11. Form Validation Everywhere
**What:** Several forms (admissions, settings, login) have minimal or no validation.
**How:** All forms already import `react-hook-form` and `zod` — just wire up the schemas.

#### 12. Loading & Error States
**What:** No loading spinners or error boundaries when queries fail.
**How:** Use TanStack Query `isLoading` / `isError` states + add a global `ErrorBoundary` component.

#### 13. Responsive Mobile Polish
**What:** Dashboard sidebars collapse on mobile but some table-heavy pages need horizontal scroll or card layouts on small screens.
**How:** Audit each dashboard page at 375px width and apply responsive grid/stack overrides.

#### 14. Accessibility (a11y)
**What:** Some interactive elements (custom buttons, tab selectors) lack `aria-*` labels.
**How:** Add `role`, `aria-selected`, `aria-label` to all custom interactive primitives. Run `axe-core` audit.

#### 15. SEO & OG Image
**What:** OG image tag references a placeholder URL.
**How:** Design a 1200×630 Meclones Academy branded OG image, host it on Supabase Storage or Cloudflare R2, and update the `og:image` meta tag.

#### 16. Deployment
**Recommended hosting:** **Vercel** (zero-config, free tier, automatic preview URLs per PR)

```bash
# Production build
npm run build

# Deploy to Vercel
npx vercel --prod
```

Set environment variables in Vercel dashboard:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_PAYSTACK_PUBLIC_KEY=pk_live_...
```

#### 17. Automated Tests
**What:** `vitest.config.ts` and `@testing-library/react` are installed but the `src/test/` folder is empty.
**How:**
- Unit test Zustand store actions (`toggleClockIn`, `setTimetableSlot`)
- Integration test the Login page role selector
- E2E test critical flows (login → dashboard → mark attendance → save) using Playwright

---

## Getting Started (Local Dev)

### Prerequisites
- Node.js 18+
- npm 9+

### Setup

```bash
# Clone
git clone https://github.com/Teleiosite/meclones-premier.git
cd meclones-premier

# Install dependencies
npm install

# Start dev server (runs on http://localhost:8080)
npm run dev
```

### Available Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Start Vite dev server on port 8080 |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest test suite once |
| `npm run test:watch` | Run Vitest in watch mode |

### Demo Credentials (Current UI-only Login)

The login page accepts any input and routes based on the selected role. No password is validated yet.

| Role | Route after login |
|---|---|
| Admin | `/dashboard/admin` |
| Teacher | `/dashboard/teacher` |
| Student | `/dashboard/student` |
| Parent | `/dashboard/parent` |

---

## Contributing

This is a private project for Meclones Academy. All development is tracked via GitHub. Feature branches should follow the naming convention:

```
feat/feature-name
fix/bug-description
chore/task-description
```

Open a Pull Request against `main`. All PRs must pass lint before merge.

---

*Meclones Academy School Management Platform — Built with ❤️ for Nigerian education excellence.*
