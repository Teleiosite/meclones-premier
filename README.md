# Meclones Academy — Source-Based Technical Audit

> Senior full-stack architecture and security audit.  
> Date: May 13–14, 2026.  
> Scope: actual implementation under `src/` plus Supabase SQL/functions under `supabase/`.

---

## 🚀 Remediation Progress (May 14, 2026)

We have successfully moved from **Audit** to **Remediation Phase 1**.

### 1. Technical Debt & Stability
- [x] **Resolved Hook Violations**: Fixed "Invalid hook call" crashes in `StudentDashboard`, `ParentDashboard`, and `TeacherDashboard` by moving logic into component bodies.
- [x] **Environment Diagnostics**: Implemented `isMissingEnv` checks to fail visibly when `VITE_SUPABASE_URL` is undefined.
- [x] **Route Restoration**: Resolved **404 errors** in the password reset flow by creating `src/pages/auth/ResetPassword.tsx` and registering the route.

### 2. Authentication & User Provisioning
- [x] **Secure Orchestration**: Created a production-hardened Database RPC `manage_user` (Security Definer) to handle atomic user creation.
- [x] **Staff Onboarding**: Admin portal now supports full Teacher creation (Auth + Profile + Teacher record).
- [x] **Student Onboarding**: Admin portal now supports full Student creation (Auth + Profile + Student record).
- [x] **Admission Pipeline**: Approving an admission now automatically provisions **both** Parent and Student accounts and links them.

### 3. Security & Database Hardening
- [x] **RLS Recursion Fix**: Resolved "Infinite recursion" in `profiles` table by implementing a `get_my_role()` security-definer helper.
- [x] **Schema Alignment**: Added missing `notes` column to `admissions` table.
- [x] **Permission Grants**: Fixed 403 errors on public forms by granting explicit `INSERT` rights to `anon` and `authenticated` roles.
- [x] **Search Path Isolation**: Hardened SQL functions against hijacking attacks using `SET search_path = public`.

### 4. Feature Integration
- [x] **Public Contact Form**: Integrated "How can we help?" form with Supabase `contact_enquiries` table.
- [x] **Portal UI Fixes**: Restored missing Lucide icons and navigation hooks in the Parent Portal.

---

## Confirmed Deployment Architecture

- **Frontend:** Vercel hosting a React/Vite single-page application.
- **Backend:** Supabase for Postgres, Auth, RLS, Edge Functions, and optional Realtime.
- **Payments:** Paystack integration should be handled through trusted server-side code. The repository currently includes a Supabase Edge Function webhook handler at `supabase/functions/paystack-webhook/index.ts`.

### Vercel + Supabase notes for Lagos users

1. Vercel is suitable for fast static asset and route delivery, but authenticated Supabase API calls still travel from the browser to the Supabase project region.
2. Cloud/edge frontend hosting does not secure data by itself. Supabase RLS, server-side RPCs, and Edge Functions must enforce authorization and integrity.
3. Never expose Supabase service-role keys or Paystack secret keys in Vercel frontend environment variables. Only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` belong in the browser bundle.
4. For Lagos 4G users, reduce dashboard query fan-out by replacing multi-query browser loading with Supabase RPC/view responses.

---

## Executive Verdict

The application now includes the critical hardening patch generated from this audit, but it should still be treated as **release-candidate, not production-final**, until the new Supabase migration is applied, RLS is smoke-tested with real role accounts, and Paystack webhook replay tests pass.

The original highest-risk issues and their current remediation status are:

1. **Client-side role escalation risk:** mitigated by a migration trigger that blocks browser-side `profiles.role` changes and by removing frontend role bootstrap logic.
2. **Attendance writes are not server-authoritative:** mitigated by `submit_attendance_batch`, a SECURITY DEFINER RPC that validates teacher/class/student ownership and writes audit rows transactionally.
3. **Lost updates are possible:** reduced by moving teacher saves through a locking RPC and adding `version`, `updated_at`, and `updated_by` columns.
4. **Fees/payment model is incomplete:** mitigated with `payments.reference` uniqueness, payment status constraints, and an explicit `payments.fee_id` relationship.
5. **No Supabase Realtime table subscriptions exist:** partially mitigated with focused Realtime invalidation for teacher attendance and admin fee records.
6. **Several dashboard cards are random/static placeholders:** reduced by replacing key teacher/admin random metrics with database-derived values or clear dashes where aggregates do not exist yet.

---

## Audit Scope

The scan covered:

- React routing, dashboards, cards, and buttons.
- Zustand state and persistence boundaries.
- Supabase client initialization.
- Supabase Auth and route protection.
- Attendance and teacher clock-in flows.
- Admin fee tracking and Paystack webhook handling.
- Supabase schema, RLS policies, RPCs, and audit-log migrations.
- Realtime/concurrency behavior.
- Vercel + Supabase performance characteristics for Lagos, Nigeria.

---

## Data Integrity Audit

### Teacher dashboard and attendance

#### Persisted behavior

- Teacher identity is loaded from `teachers.profile_id = user.id`.
- Teacher classes are derived from `timetable` rows filtered by teacher id.
- Students are fetched from `students` for the selected class.
- Attendance is saved with `student_id`, `date`, `status`, and `marked_by` through an upsert on `student_id,date`.
- The database schema enforces one attendance row per student per date with `UNIQUE(student_id, date)`.

#### UI-only or weakly persisted states

| UI area | Current behavior | Risk |
| --- | --- | --- |
| Student attendance default | Each loaded student defaults to `present: true` before existing records are applied. | A teacher can accidentally save a full class as present without positively marking every learner. |
| `lastSaved` | Local React state only. | Disappears on reload/device switch and is not an authoritative audit marker. |
| Attendance audit | Written after the attendance upsert as a separate fire-and-forget operation. | Attendance can save while audit insertion fails. |
| Teacher dashboard attendance rate | Hard-coded as `94%`. | Misleading operational metric. |
| Teacher class attendance and average score | Generated with `Math.random()`. | Changes on refresh and does not reflect real records. |
| Pending reviews | Hard-coded as `5`. | Not linked to assignments or submissions. |
| Pending tasks | Static array of task labels/counts. | Looks actionable but is not backed by workflow state. |

#### Server-side validation gaps

Attendance RLS only confirms that the submitted `marked_by` teacher row belongs to the authenticated user. It does not verify:

- the submitted `student_id` belongs to a class taught by that teacher;
- the attendance date is inside the active term/session;
- the teacher is clocked in before marking attendance;
- the record is being edited within an allowed correction window;
- late edits include an approved reason;
- attendance and audit records are written atomically.

#### Schema mismatch

The dashboard selects timetable fields such as `time_slot`, `room`, and `color`, while the migration defines `time` and does not define `room` or `color`. Either the live database differs from the migrations, or the dashboard query will fail/return incomplete data.

---

### Teacher clock-in / clock-out

#### Persisted behavior

- The teacher clock-in page persists records in `teacher_clockin`.
- The schema enforces one row per teacher per date with `UNIQUE(teacher_id, date)`.

#### Risks

- The UI displays check-in and sign-out windows, but the database does not enforce them.
- Sign-in uses a plain insert, so a double click or second device can trigger a uniqueness error rather than an idempotent result.
- Sign-out updates `clock_out` without a database-side guard preventing overwrite of an existing value.
- “On Time”, “Late”, and “Half Day” status is calculated in the browser, not stored or validated server-side.

---

### AdminDashboard fee tracking

#### Database-backed behavior

- Admin dashboard counts students, teachers, pending admissions, successful payments, and today's attendance through Supabase queries.
- The Admin Fees page uses the `get_fee_stats()` RPC wrapper for summary KPIs.
- The RPC calculates total collected, outstanding, current-month collection, collection rate, and fee count.

#### Integrity issues

| Area | Current behavior | Risk |
| --- | --- | --- |
| `payments.status` | Free-form `TEXT NOT NULL`. | Typos or unexpected statuses can corrupt reports. |
| `payments.reference` | Plain text without uniqueness in the schema. | Paystack idempotency is not guaranteed. |
| Payment-fee relationship | UI selects `fees(term)`, but the schema has no `payments.fee_id`. | Recent payment query may fail or misrepresent term data. |
| Outstanding calculation | Global `SUM(fees.amount) - SUM(success payments)`. | Not accurate per student, invoice, class, term, scholarship, or partial payment. |
| Admin fee chart | Browser normalizes and pads bars with fallback values. | Chart can display non-real data. |
| Recent payment recency | Dashboard uses `created_at`, not `paid_at`. | Payment activity ordering can be wrong. |
| Reminders | The button logs an audit entry and shows success. | No actual SMS/email/WhatsApp delivery is implemented. |

---

## Security & RBAC Analysis

### Route protection

`AuthGuard` checks for a Supabase session, fetches `profiles.role`, maps the role to a dashboard route prefix, and redirects users away from other dashboard prefixes. This is helpful for user experience, but **frontend route guards are not a security boundary**. Supabase RLS must enforce all real authorization.

### Critical role escalation issue

The RLS migration allows users to update their own `profiles` row. Because `profiles` contains `role`, a user may be able to change their own role to `admin` unless the live database has additional constraints/triggers not shown in the repo.

Required fix:

- do not allow browser clients to update `profiles.role`;
- move role assignment to service-role-only code, `app_metadata`, or a locked `user_roles` table;
- expose a safe profile-edit RPC that only updates non-privileged fields.

### Login role logic issue

The login flow checks `user_metadata.role` before falling back to `profiles.role`, and it contains a frontend auto-admin bootstrap for `admin@meclones.edu.ng`. User metadata is not a reliable RBAC authority, and frontend auto-admin logic should be removed from production.

Required fix:

- treat server-controlled profile/role records as the only role source;
- remove frontend auto-admin assignment;
- seed the first admin with SQL/service-role tooling.

### Supabase client initialization

The browser client uses the public Supabase anon key, which is expected. However, when environment variables are missing, the code exports a proxy client that returns “Supabase not initialized” instead of failing fast. In production, this can hide configuration failures.

Required fix:

- fail visibly at app boot if `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` is missing/invalid;
- do not run a production dashboard with a fake Supabase client.

### Audit log trust issue

The audit-log policies allow any authenticated user to insert audit rows. Audit logs should be server-authored by triggers or privileged RPC/Edge Functions, not freely inserted by clients.

Required fix:

- revoke generic authenticated audit inserts;
- write attendance and payment audit entries transactionally inside server-side functions/triggers.

---

## Concurrency & Realtime Check

### Realtime status

No `supabase.channel(...)`, `postgres_changes`, or table-level Realtime subscriptions were found. The only subscriptions are auth-state listeners.

Consequences:

- Admin dashboards do not update automatically when teachers save attendance.
- Teachers do not see if another actor changed the same attendance sheet.
- Fees dashboards do not update immediately after Paystack webhook success.
- Zustand state is not synchronized with Supabase.

### Zustand status

The Zustand store contains seed data for classes, subjects, timetables, and teacher attendance. Several actions mutate only in-memory state. These records are not persisted to Supabase and can diverge from database-backed pages.

### Lost-update risks

#### Attendance

- `attendance` has one row per `student_id,date`.
- The teacher UI upserts by that same key.
- A stale tab can overwrite a newer admin/teacher correction.
- There is no `updated_at`, `updated_by`, `version`, conflict check, or transactional audit write.

#### Teacher clock-in

- Sign-in is not idempotent.
- Sign-out can overwrite `clock_out` unless database constraints/triggers prevent it.

#### Payments

- The Paystack webhook checks if a reference is already processed, but the schema does not enforce unique references.
- Duplicate references can make idempotency ambiguous.

---

## Dashboard Cards & Buttons Audit

### Teacher dashboard

#### Cards/panels

- **Total Classes:** database-derived unique timetable class count.
- **Total Students:** database-derived count across assigned classes.
- **Attendance Rate:** hard-coded `94%`.
- **Pending Reviews:** hard-coded `5`.
- **My Classes:** class/subject/student count plus random attendance and random average score.
- **Assignments Overview:** assignment rows load from Supabase, but submitted count is displayed as `–`.
- **Today's Schedule:** depends on timetable columns that do not match the migration.
- **Quick Actions:** route-only action buttons.
- **Pending Tasks:** static labels and counts.

#### Buttons

- **CLOCK IN / CLOCK OUT:** routes to `/dashboard/teacher/clockin-clockout`; it does not directly perform a clock action.
- **VIEW CLASS:** routes to the teacher classes page.
- **GRADE:** routes to assignments.
- **ATTEND.:** routes to attendance.
- **ASSIGN:** routes to assignments.
- **GRADES:** routes to exams.
- **NOTICE:** routes to messages.

### Teacher attendance page

- **Class selector buttons:** update selected class only.
- **Date input:** updates local date state and reloads students.
- **Student buttons:** toggle local present/absent state.
- **SAVE ATTENDANCE:** persists through Supabase upsert.
- **MARK ALL PRESENT:** updates local state only until save.

### Teacher clock-in page

- **Main clock card:** displays browser time, date, check-in, and check-out state.
- **Sign In:** inserts into `teacher_clockin`.
- **Sign Out:** updates `teacher_clockin.clock_out`.
- **Sign-In Window / Late Grace Period / Sign-Out Window cards:** display-only.
- **Recent Attendance:** table backed by `teacher_clockin` records.

### Admin dashboard

#### Cards/panels

- **Total Students:** database count.
- **Teachers:** database count.
- **Pending Admissions:** database count.
- **Fees Collected:** browser sum of successful payment rows.
- **Attendance Overview:** last-30-day attendance data with fallback/default values.
- **Fees Collection:** successful payment history normalized to SVG bars and padded with defaults.
- **Recent Activity:** combined admissions, payments, and assignment submissions from separate queries.
- **Pending Admissions:** database count plus link.
- **Today Overview:** attendance rate and counts.
- **School Classes:** student counts plus random class performance.
- **Quick Actions:** route-only buttons.

#### Buttons/links

- **Pending Admissions → View All:** links to admissions.
- **REVIEW APPLICATIONS:** links to admissions.
- **School Classes → View All:** links to academics.
- **ADD STUDENT:** routes to students.
- **NEW REPORT:** routes to academics, not a report builder.
- **ATTENDANCE:** routes to admin attendance.
- **SEND NOTICE:** routes to announcements.

### Admin fees page

#### Cards/panels

- **Total Collected:** RPC-backed.
- **This Month:** RPC-backed.
- **Outstanding:** RPC-backed but limited by the fee/payment model.
- **Collection Rate:** RPC-backed.
- **Fee Collection Progress:** visualizes RPC stats.
- **Recent Payment Records:** loads the latest 20 payment records.

#### Buttons

- **REFRESH:** refetches fee stats and recent payment rows.
- **EXPORT CSV:** exports only currently loaded payment rows, not a full report.
- **REMIND:** logs a payment audit entry and shows a toast; no delivery provider is called.

---

## Infrastructure Bottlenecks: Vercel + Supabase for Lagos, Nigeria

### What should work well

- Vercel is appropriate for the React/Vite frontend and CDN delivery.
- Route-level lazy loading in `App.tsx` helps reduce initial JavaScript cost.

### What will suffer on metered 4G

1. **Dashboard query fan-out**
   - AdminDashboard issues many separate Supabase queries.
   - Each authenticated request adds latency and failure surface.

2. **Raw browser-side aggregation**
   - Attendance and fee charts are built in the browser from row data.
   - Use Postgres RPCs/views for aggregate payloads.

3. **Image delivery**
   - Public images are moderate but should be converted to responsive WebP/AVIF.
   - Add `srcset`, explicit dimensions, and only preload above-the-fold hero assets.

4. **No offline attendance support**
   - Teachers marking attendance over unstable 4G can lose work or submit stale data.

5. **Supabase region latency**
   - Vercel edge delivery does not eliminate latency to the Supabase database region.

### Optimization strategy

- Create `get_admin_dashboard_summary()` and `get_teacher_dashboard_summary()` RPCs.
- Replace raw chart data queries with chart-ready aggregates.
- Use TanStack Query stale times and cache invalidation.
- Add Realtime subscriptions only for critical records, not whole tables.
- Use IndexedDB for attendance drafts and sync queue.
- Compress images and emit responsive image variants.
- Paginate all large tables and select only required columns.

---

## Remaining Technical Requirements

1. ✅ Server-side transactional attendance save RPC implemented in the production hardening migration.
2. ✅ Server-authored attendance/reminder audit paths implemented for the critical teacher/admin flows.
3. ✅ Role management hardening added through trigger-backed role-change protection and frontend login cleanup.
4. ✅ Unique payment references added through a partial unique index.
5. ✅ Payment status check constraint added.
6. ✅ Explicit `payments.fee_id` relationship added; broader invoice allocation workflows still need product validation.
7. ✅ `updated_at`, `updated_by`, and `version` columns added where needed for critical mutable records.
8. ⚠️ Conflict-aware attendance reconciliation UI is partially addressed by locking/versioning; a full conflict review screen is still recommended.
9. ✅ Focused Supabase Realtime invalidation added for teacher attendance and admin fee records.
10. ⚠️ Offline-first attendance queue remains a recommended next step.
11. ✅ Idempotent server-side teacher clock-in/out RPCs added; strict time-window rules can be tuned in SQL after policy confirmation.
12. ✅ Teacher-to-class validation added inside `submit_attendance_batch`.
13. ⚠️ Rate limiting/CAPTCHA for public admissions inserts remains recommended.
14. ⚠️ Structured handling of all Supabase query errors remains a broad codebase cleanup.
15. ✅ Schema/code alignment improved for profile, timetable, and payment relationships.
16. ⚠️ Full admin CSV/export endpoint remains recommended.
17. ⚠️ Real SMS/email/WhatsApp reminder delivery remains recommended; current action now logs safely without claiming delivery.
18. ⚠️ Monitoring and alerting for webhooks, attendance sync, and RLS denials remains recommended.
19. ⚠️ Backup/restore drills remain operational requirements.
20. ⚠️ Term/session calendar model remains recommended.
21. ⚠️ Parent notification queue remains recommended.
22. ⚠️ Edge/server payment initialization remains recommended; webhook reconciliation was hardened.
23. ⚠️ Automated RLS tests by role remain recommended.
24. ⚠️ End-to-end tests for admin, teacher, parent, and student workflows remain recommended.
25. ⚠️ Mobile performance budget testing under Lagos 4G conditions remains recommended.

---

## Critical Fixes

### P0 — implemented in this patch

1. ✅ Block client-side role escalation by preventing browser updates to `profiles.role`.
2. ✅ Remove `user_metadata.role` as an RBAC authority.
3. ✅ Remove frontend auto-admin bootstrap for `admin@meclones.edu.ng`.
4. ✅ Replace attendance upsert with a transactional RPC.
5. ✅ Add teacher-class-student validation to attendance writes.
6. ✅ Make critical attendance/reminder audit logs server-authored and transactional.
7. ✅ Fix schema mismatches around profiles, timetable, and payments/fees.
8. ✅ Add `UNIQUE(reference)` to payments.

### P1 — partially implemented / next validation

1. Create broader dashboard aggregate RPCs beyond fee stats.
2. ✅ Add Realtime subscriptions or query invalidation for attendance and payments; admissions/announcements can follow the same pattern.
3. ✅ Add optimistic concurrency columns to critical mutable tables.
4. ✅ Make clock-in and clock-out idempotent through RPCs.
5. ✅ Replace key random/static dashboard metrics with real aggregates or explicit dashes.
6. Implement actual notification delivery for reminders.
7. Add RLS regression tests.

### P2 — performance and UX hardening

1. Compress and serve responsive images.
2. Add offline attendance queue with retry/backoff.
3. Use cached reads for non-critical dashboard data.
4. Add route-level error boundaries and centralized API error handling.
5. Add monitoring, alerting, and backup restore verification.

---

## Production Recommendation: Paystack Webhooks

The existing Supabase Edge Function is a good starting point because it validates Paystack signatures, uses service-role access, and writes an audit row. Before production, harden it as follows:

1. **Initialize payments server-side.**
   - Browser requests a server function.
   - Server creates a pending payment row.
   - Server generates a unique reference.
   - Server returns Paystack authorization data.

2. **Add database constraints.**
   - `payments.reference TEXT UNIQUE NOT NULL`.
   - strict `payments.status` check constraint.
   - `payments.fee_id UUID REFERENCES fees(id)`.
   - non-null `student_id` and validated amount/currency.

3. **Validate webhook payloads.**
   - Verify signature.
   - Confirm event is `charge.success`.
   - Confirm amount, currency, reference, and expected student/invoice.

4. **Process atomically.**
   - Lock payment row.
   - Check status.
   - Update payment.
   - Update invoice balance.
   - Insert audit row.
   - Store raw webhook event.

5. **Improve audit identity.**
   - Replace placeholder system UUID with nullable `changed_by` plus `actor_type = 'system'`, or create a real system actor.

6. **Add observability.**
   - Alert on webhook failures, duplicate references, and amount mismatches.
   - Provide an admin reconciliation screen.

---

## Production Recommendation: Offline-First Attendance

1. Store local attendance drafts in IndexedDB, not only React/Zustand state.
2. Use explicit statuses: `Unmarked`, `Present`, `Absent`, `Late`.
3. Require every student to be marked before final submission.
4. Add a sync queue with deterministic `client_mutation_id` values.
5. Sync through a server RPC or Edge Function that validates teacher/class/student relationships.
6. Store sync receipts and audit rows transactionally.
7. Add conflict handling for stale edits.
8. Show clear sync states: `pending`, `synced`, `failed`, and `conflict`.

---

## Go / No-Go

**Recommendation: CONDITIONAL GO after deployment validation.**

The P0 code and migration fixes have been implemented in this repository. Before enabling production-critical school operations for 230 active users, apply `supabase/migrations/20260513_production_hardening.sql`, verify RLS with admin/teacher/parent/student test accounts, run Paystack webhook replay/idempotency tests, and confirm Vercel production environment variables are configured.
