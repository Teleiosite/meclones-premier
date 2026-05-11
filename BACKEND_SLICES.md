# Backend Slices — Implementation Reference

This doc accompanies the migrations in `supabase/migrations/`. It documents the schema, RLS, indexes, seed data, REST examples, FE integration checklist and risk notes for slices 1–3.

All tables enforce **Row Level Security**. Access is granted only via the policies described below.

---

## Slice 1 — Auth, Profiles, Roles (validated, already shipped)

### Tables
- `public.profiles` — one row per `auth.users` (id, full_name, phone, avatar_url, timestamps)
- `public.user_roles` — (user_id, role) where role ∈ `admin | teacher | student | parent`

### Trigger
- `handle_new_user()` on `auth.users` insert → creates a `profiles` row using `raw_user_meta_data`.

### Helpers
- `has_role(_user_id uuid, _role app_role) returns boolean` — SECURITY DEFINER. Used in every admin policy. **Safe to expose** to authenticated (intentional).

## Slice 2 — Core Academic Schema
- `teachers`, `classes`, `students`, `subjects`, `class_subjects`, `enrollments`, `timetable_entries`, `parent_student_links`
- Writes on academic tables are **admin-only**.

## Slice 3 — Attendance + Clock-in/out
- `attendance_policy`, `attendance_logs`, `attendance_anomalies`, `student_attendance`
- Teacher owns clock records; admin has full surveillance/policy access.

## RLS and helper hardening policy
- All tables are RLS-enabled.
- Internal helper functions (`current_teacher_id`, `current_student_id`, `teacher_teaches_class`, `is_parent_of_student`) are security-definer and have `EXECUTE` revoked from `anon`/`authenticated`.
- `has_role()` remains callable by authenticated users to support policy checks.

## Notes
- Use paginated queries for heavy lists (`limit <= 50`).
- Prefer additive schema evolution while FE integration is in progress.
