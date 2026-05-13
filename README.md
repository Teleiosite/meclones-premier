# Meclones Academy — School Management Platform

> A full-featured, role-based school management system for a premium Nigerian combined school (Nursery–SS3). Built with React 18, TypeScript, Vite 5, Tailwind CSS, shadcn/ui, and Supabase. **Fully production-ready with live data persistence and real-time messaging.**

---

## Project Overview

Meclones Academy is a **premium combined school** in Lagos, Nigeria. This platform manages all school operations across four distinct user roles, each with a dedicated, live-data dashboard.

| Role | Portal Route | Primary Purpose |
|---|---|---|
| **Admin** | `/dashboard/admin` | School-wide management, admissions, academics, and finances |
| **Teacher** | `/dashboard/teacher` | Class management, attendance, grading, and clock-in/out |
| **Student** | `/dashboard/student` | Academic courses, results, timetable, and assignments |
| **Parent** | `/dashboard/parent` | Children performance monitoring, fees, and attendance |

---

## Tech Stack

| Category | Technology |
|---|---|
| **Framework** | React 18 + TypeScript |
| **Build Tool** | Vite 5 |
| **Backend** | Supabase (PostgreSQL + Auth + RLS) |
| **Styling** | Tailwind CSS + Custom HSL Tokens |
| **Components** | shadcn/ui (Radix UI) |
| **State** | Zustand (local UI) + Supabase (global persistence) |
| **Real-time** | Supabase Realtime (Messaging & Notifications) |

---

## Key Achievements (Persistence Finalized)

The platform has transitioned from a mock UI to a **fully data-driven application**:

### ✅ Authentication & RBAC
- [x] Live Supabase Auth integration with role-based routing.
- [x] Protected routes for Admin, Teacher, Student, and Parent portals.

### ✅ Messaging System (Cross-Portal)
- [x] **Universal Inbox:** Real-time messaging between Students, Teachers, Parents, and Admins.
- [x] Functional "Compose", "Reply", and "Mark as Read" features.
- [x] Persistent message history stored in Supabase.

### ✅ Academic & Student Management
- [x] **Admissions:** Live approval workflow; status updates reflected instantly.
- [x] **Academics:** Dynamic class and curriculum management.
- [x] **Attendance:** Automated attendance logging for both Teachers (Clock-in) and Students.
- [x] **Results:** Live grading and termly report aggregation.

### ✅ Financial Tracking
- [x] **Fees:** Real-time payment tracking and outstanding balance calculation.
- [x] **Export:** CSV export functionality for all major data tables.

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

# Configure Environment
# Create a .env file with your Supabase credentials:
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your-anon-key

# Start dev server
npm run dev
```

---

## Road to Production (Next Steps)

While the core data flow is persistent, the following items are scheduled for future sprints:

1. **PDF Generation:** Implementation of `jsPDF` for generating downloadable report cards.
2. **Push Notifications:** Webhook integration for SMS/Email notifications on fee payments.
3. **Advanced Analytics:** Deeper Recharts integration for academic trend analysis.

---

*Meclones Academy School Management Platform — Built with ❤️ for Nigerian education excellence.*
