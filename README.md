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
- Infrastructure fit for Cloudflare Pages + Supabase (Lagos 4G users)

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

- Implement role-based route guard and deny cross-role dashboard access.
- Remove/replace UI-only teacher dashboard clock-in state with server-backed state only.
- Enforce strict RLS ownership checks on attendance and teacher clock-in rows.
- Resolve structural issue in `TeacherDashboard.tsx` (hook placement consistency).

### P1 (Next Sprint)

- Replace fee KPI calculations with DB-backed RPC/view outputs.
- Add append-only audit trail for attendance and payment changes.
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

- [ ] Role-enforced route authorization implemented and tested
- [ ] RLS policies validated for all touched tables
- [ ] Webhook signature/idempotency live in production
- [ ] Financial KPIs server-aggregated and reconciled
- [ ] Attendance conflict handling and audit trails enabled
- [ ] Monitoring/alerting + backup restore drill completed
- [ ] Mobile performance budgets met under Lagos 4G test conditions

If any item is unchecked, release should be **NO-GO** for production-critical usage.
