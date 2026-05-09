# Supabase Setup Notes

## 1) Create project
- Create a Supabase project.
- Copy `Project URL` and `anon key` into `.env` using `.env.example`.

## 2) Apply schema
- Open SQL Editor in Supabase dashboard.
- Run `supabase/schema.sql`.

## 3) Auth + role bootstrap
- Create users via Supabase Auth.
- Insert corresponding `public.profiles` rows with role values:
  - `admin`
  - `teacher`
  - `student`
  - `parent`

## 4) Integration targets in this frontend
- Admissions page (`src/pages/Admissions.tsx`) -> insert to `public.admissions`.
- Teacher Clockin-Clockout page (`src/pages/dashboard/teacher/ClockinClockout.tsx`) -> write/read `public.attendance_logs`.
- Admin Attendance page (`src/pages/dashboard/admin/Attendance.tsx`) -> read `attendance_logs` + `attendance_policy`, and update policy.

## 5) Next implementation step
- Add `@supabase/supabase-js` client wiring once package installation is available in this environment.
