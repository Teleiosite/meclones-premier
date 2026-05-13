# Meclones Academy — School Management Platform

> Independent code audit summary (May 13, 2026). This README reflects the current implementation status based on `src/` inspection, not prior self-assessment.

---

## Executive Summary

**Short answer:** fixing the issues from the audit will make the app **materially closer** to production, but production readiness also depends on non-code and operational controls (monitoring, incident response, backups, key rotation, SLOs, load testing, etc.).

As of this audit, the app is **not yet production-ready for financial and attendance-critical workflows** due to gaps in RBAC enforcement, data integrity guarantees, and concurrency handling.

---

## Audit Scope

- React dashboards and route protection
- Zustand state usage and persistence boundaries
- Supabase client initialization and query patterns
- Attendance and fee-tracking data flows
- Realtime/concurrency behavior
- Infrastructure fit for Vercel + Supabase (Lagos 4G users)

---


## Deployment Architecture (Confirmed)

- **Frontend:** Vercel (React/Vite build output, CDN edge delivery).
- **Backend:** Supabase (Postgres, Auth, RLS, Storage, Realtime where needed).
- **Payments Integration:** Paystack webhook handled in a trusted server runtime (prefer Supabase Edge Function; Vercel Serverless also viable).

### Platform Notes for Vercel + Supabase

1. Keep all sensitive operations (webhook verification, payment reconciliation, privileged writes) off the browser and in server-side functions.
2. Frontend route guards improve UX only; true authorization must be enforced with Supabase RLS policies.
3. Use Vercel environment variables for public client keys and never expose service-role keys in frontend bundles.
4. Prefer Supabase RPC/views for KPI aggregates to reduce round-trips and improve 4G performance.

---

## Key Findings

### 1) Data Integrity

- Teacher daily student attendance is persisted via `upsert(student_id, date)` (good baseline idempotency).
- Teacher dashboard has a separate **UI-only clock-in/out state** in Zustand that is not persisted, while a different page writes to `teacher_clockin`; this creates dual sources of truth.
- Fee dashboard calculates major financial totals in the client, which is not ledger-grade and can drift from authoritative accounting semantics.
- “Remind” action is currently UI-only (toast), not an audited outbound workflow.

### 2) Security & RBAC

- Protected route currently checks only whether a user is authenticated, not whether they are authorized for a specific role route.
- Role is fetched in auth hook but not enforced by route guard.
- If RLS policies are permissive, users may access or mutate out-of-scope records by direct API manipulation.

### 3) Concurrency & Realtime

- No Supabase Realtime subscriptions were found in core attendance/fees state paths.
- Simultaneous writes risk last-write-wins behavior without conflict awareness/audit diff.
- Admin metrics can become stale between users/sessions until refresh.

### 4) Infra & Mobile Performance

- Dashboard pages issue multi-query loading patterns; this will be expensive on metered 4G.
- Nested relational selects in large tables may increase latency and payload size.
- Lack of server-side KPI pre-aggregation increases client work and round trips.

---

## Remaining Requirements (Must-Have Before Production)

1. **Role-aware route authorization** (not just authenticated session checks).
2. **Verified table-by-table RLS policies** and policy tests.
3. **Server-side financial aggregates** (RPC/views), not client-only arithmetic.
4. **Attendance conflict strategy** (versioning/event log + reconciliation UI).
5. **Audit logs** for attendance edits, payment state transitions, and reminders.
6. **Webhook security** (Paystack signature verification, idempotency, replay-safe processing).
7. **Error boundaries + centralized API error handling**.
8. **Observability** (structured logs, traces, alerting, Sentry or equivalent).
9. **Backups + DR** (restore drills and retention policy).
10. **Performance controls** (pagination, selective fields, caching, image optimization).

---

## Critical Fix Plan

### P0 (Immediate)

- ✅ Implemented role-based route guard and cross-role redirect in `AuthGuard` (May 13, 2026), including deny-by-default for missing/unknown role claims.
- ✅ Replaced UI-only teacher dashboard clock-in indicator with persisted `teacher_clockin` state (May 13, 2026).
- ✅ Added app-layer ownership guardrails for teacher attendance/clock-out paths (while full DB-level RLS SQL validation remains pending).
- ✅ Resolved `TeacherDashboard.tsx` hook placement/state initialization consistency issue (May 13, 2026).

### P1 (Next Sprint)

- ✅ Replace fee KPI calculations with DB-backed RPC/view outputs (`get_fee_stats()` RPC deployed, May 13 2026).
- ✅ Add append-only audit trail for attendance and payment changes (`attendance_audit_log` + `payment_audit_log` tables with RLS, May 13 2026).
- Add conflict-aware save semantics for attendance edits.

### P2

- Add targeted realtime invalidation for critical dashboards.
- Optimize payloads and query fan-out (pagination, field projection).
- Add mobile-network-focused UX fallbacks (skeletons + stale-safe indicators).

---

## Production Recommendation

### Paystack Webhooks

- Handle webhooks in a trusted backend (Edge Function/Worker).
- Verify signature before processing.
- Enforce idempotency on transaction reference.
- Write raw payload + normalized payment rows transactionally.
- Emit post-commit events for dashboard invalidation/realtime updates.

### Offline-First Attendance

- Queue attendance intents in IndexedDB with deterministic IDs.
- Sync via a conflict-aware server endpoint when online.
- Keep immutable event history for reconciliation.
- Show explicit sync states: `pending`, `synced`, `conflict`.

---

## Production Readiness Gate (Go/No-Go)

Mark **GO** only when all are true:

- [x] Role-enforced route authorization implemented in `AuthGuard` (frontend route-level).
- [ ] RLS policies validated for all touched tables (app-layer checks tightened; SQL policy verification still pending)
- [ ] Webhook signature/idempotency live in production
- [x] Financial KPIs server-aggregated via `get_fee_stats()` RPC (May 13 2026)
- [x] Attendance audit trail enabled — `attendance_audit_log` writes on every save; `payment_audit_log` tracks reminder actions (May 13 2026)
- [ ] Monitoring/alerting + backup restore drill completed
- [ ] Mobile performance budgets met under Lagos 4G test conditions

If any item is unchecked, release should be **NO-GO** for production-critical usage.
