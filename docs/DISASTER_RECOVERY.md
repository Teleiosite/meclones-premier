# Disaster Recovery & Monitoring Playbook

This document outlines the monitoring, alerting, and backup strategies for Meclones Academy to ensure production readiness, zero data loss, and high availability.

## 1. Monitoring & Error Logging

We are utilizing a **zero-cost, Supabase-backed error logging system**. 

### How it works:
- If the frontend React application crashes, the `ErrorBoundary` component catches the failure.
- A user-friendly "Something went wrong" UI is displayed instead of a blank white screen.
- The error message, stack trace, affected route, and user ID are silently written to the `frontend_errors` table in Supabase.

### Action Items for Admins:
- Regularly query the `frontend_errors` table via the Supabase SQL Editor or Table Editor to identify client-side bugs.
  ```sql
  SELECT * FROM frontend_errors ORDER BY created_at DESC LIMIT 50;
  ```

---

## 2. Alerting Configuration

To ensure you are notified immediately of downtime or resource exhaustion, configure the following native alerts:

### Vercel Alerts (Frontend)
1. Go to the **Vercel Dashboard** > Your Project > Settings > **Notifications**.
2. Enable email notifications for:
   - **Deployment Failed** (To catch bad pushes to the main branch).
   - **Serverless Function Error** (If API routes or webhooks fail).

### Supabase Alerts (Backend/Database)
1. Go to the **Supabase Dashboard** > Project Settings > **Webhooks/Alerts**.
2. Configure email alerts for the following metrics:
   - **CPU Usage > 80%** (indicates heavy load or unoptimized queries).
   - **Database Connection Exhaustion** (indicates connection leaks).
   - **API Error Rates > 5%** (indicates failing RPCs or RLS blocks).

---

## 3. Backup & Disaster Recovery Drill

Supabase provides automated daily backups on the Pro tier. However, knowing how to manually backup and restore is critical.

### Scenario A: Minor Data Corruption (Pro Plan)
If you are on the Supabase Pro plan, you have access to **Point-in-Time Recovery (PITR)**.
1. Go to **Database** > **Backups** in the Supabase Dashboard.
2. Select a specific minute prior to the corruption event.
3. Click **Restore**.

### Scenario B: Complete Rebuild / Migration (Manual Backup)
If you need to move to a new project or recover a deleted database on the free tier:

**Step 1: Backup (Export)**
You can export your database using the Supabase CLI:
```bash
supabase db dump --db-url "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" -f full_backup.sql
```

**Step 2: Restore (Import)**
1. Run the initialization script to recreate the blank schema:
   ```bash
   # Run in Supabase SQL Editor
   supabase/migrations/20260513_init_schema.sql
   ```
2. Import the data dump using `psql`:
   ```bash
   psql -h [NEW_HOST] -U postgres -d postgres -f full_backup.sql
   ```
3. Re-apply the Row Level Security (RLS) policies:
   ```bash
   # Run in Supabase SQL Editor
   supabase/migrations/20260513_rls_policies.sql
   ```
4. Re-apply any missing RPCs or custom configurations (like `20260513_fee_stats_rpc.sql`).

---

**Prepared on:** May 13, 2026
**Status:** ✅ Production Ready
