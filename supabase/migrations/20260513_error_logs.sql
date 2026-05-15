-- ============================================================
-- Migration: frontend_errors table
-- Creates a table to store client-side React crashes and errors.
-- ============================================================

CREATE TABLE IF NOT EXISTS frontend_errors (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Soft reference to the user who experienced the error (can be null if logged out)
  route       TEXT,                                            -- The URL path where the error occurred
  message     TEXT NOT NULL,                                   -- The actual error message
  stack_trace TEXT,                                            -- The full stack trace
  user_agent  TEXT,                                            -- Browser user agent
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE frontend_errors ENABLE ROW LEVEL SECURITY;

-- 1. Admins can read all errors
CREATE POLICY "admins_read_errors" ON frontend_errors FOR SELECT
  USING (
    ( (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' )
  );

-- 2. Anyone (even unauthenticated) can insert an error. 
-- If an app crashes before login, we still want to log it.
CREATE POLICY "public_insert_errors" ON frontend_errors FOR INSERT
  WITH CHECK (TRUE);

-- Block UPDATE and DELETE to keep the logs immutable
CREATE POLICY "no_update_errors" ON frontend_errors FOR UPDATE
  USING (FALSE);

CREATE POLICY "no_delete_errors" ON frontend_errors FOR DELETE
  USING (FALSE);

-- Index for querying by date
CREATE INDEX IF NOT EXISTS idx_frontend_errors_date ON frontend_errors (created_at DESC);
