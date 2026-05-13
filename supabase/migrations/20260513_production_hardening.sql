-- ============================================================
-- Production Hardening: RBAC, attendance transactions, payments
-- Generated: May 13, 2026
--
-- This migration closes the highest-risk audit findings:
--   1. prevent client-side role escalation
--   2. make attendance saves server-authoritative + audited
--   3. make payment references/statuses enforceable
--   4. align schema with current frontend fields
--   5. move reminder audit writes behind a privileged RPC
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── 1. Schema alignment / metadata columns ───────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE timetable
  ADD COLUMN IF NOT EXISTS time_slot TEXT,
  ADD COLUMN IF NOT EXISTS room TEXT,
  ADD COLUMN IF NOT EXISTS color TEXT DEFAULT 'bg-navy',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Backfill time_slot from older schema column if needed.
UPDATE timetable SET time_slot = time WHERE time_slot IS NULL AND time IS NOT NULL;

ALTER TABLE attendance
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1;

ALTER TABLE teacher_clockin
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE payment_audit_log
  ADD COLUMN IF NOT EXISTS actor_type TEXT NOT NULL DEFAULT 'user';

ALTER TABLE payment_audit_log
  ALTER COLUMN changed_by DROP NOT NULL;

ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS fee_id UUID REFERENCES fees(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1;

-- ── 2. Generic updated_at trigger ────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON profiles;
CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_timetable_updated_at ON timetable;
CREATE TRIGGER set_timetable_updated_at
BEFORE UPDATE ON timetable
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_attendance_updated_at ON attendance;
CREATE TRIGGER set_attendance_updated_at
BEFORE UPDATE ON attendance
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_clockin_updated_at ON teacher_clockin;
CREATE TRIGGER set_clockin_updated_at
BEFORE UPDATE ON teacher_clockin
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_payments_updated_at ON payments;
CREATE TRIGGER set_payments_updated_at
BEFORE UPDATE ON payments
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 3. Stop profile role escalation from browser clients ─────
CREATE OR REPLACE FUNCTION public.prevent_profile_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE'
     AND NEW.role IS DISTINCT FROM OLD.role
     AND COALESCE(auth.role(), '') <> 'service_role' THEN
    RAISE EXCEPTION 'Profile role changes are restricted to privileged server-side operations';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_profile_role_change ON profiles;
CREATE TRIGGER prevent_profile_role_change
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_role_change();

-- Recreate profile update policy with a WITH CHECK clause. The trigger above
-- protects the privileged role column; this policy only permits own-row edits.
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ── 4. Timetable and payment constraints ─────────────────────
WITH ranked AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY class_name, day, time_slot
           ORDER BY created_at, id
         ) AS rn
    FROM timetable
   WHERE class_name IS NOT NULL
     AND day IS NOT NULL
     AND time_slot IS NOT NULL
)
DELETE FROM timetable t
 USING ranked
 WHERE t.id = ranked.id
   AND ranked.rn > 1;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'timetable_class_day_time_unique'
  ) THEN
    ALTER TABLE timetable
      ADD CONSTRAINT timetable_class_day_time_unique UNIQUE (class_name, day, time_slot);
  END IF;
END $$;

-- Normalize duplicate payment references before enforcing uniqueness. This keeps
-- the first row unchanged and makes later duplicate references traceable by id.
WITH ranked AS (
  SELECT id, reference,
         ROW_NUMBER() OVER (PARTITION BY reference ORDER BY created_at, id) AS rn
    FROM payments
   WHERE reference IS NOT NULL AND BTRIM(reference) <> ''
)
UPDATE payments p
   SET reference = ranked.reference || '-DUP-' || SUBSTRING(p.id::TEXT, 1, 8)
  FROM ranked
 WHERE p.id = ranked.id
   AND ranked.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS payments_reference_unique_idx
  ON payments(reference)
  WHERE reference IS NOT NULL AND BTRIM(reference) <> '';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'payments_status_check'
  ) THEN
    ALTER TABLE payments
      ADD CONSTRAINT payments_status_check CHECK (
        status IN ('pending', 'success', 'failed', 'abandoned', 'refunded', 'partial', 'Outstanding', 'Partial', 'Paid')
      ) NOT VALID;
  END IF;
END $$;

-- ── 5. Audit logs must be server-authored ────────────────────
DROP POLICY IF EXISTS "authenticated_insert_att_audit" ON attendance_audit_log;
DROP POLICY IF EXISTS "authenticated_insert_pay_audit" ON payment_audit_log;
DROP POLICY IF EXISTS "service_insert_att_audit" ON attendance_audit_log;
DROP POLICY IF EXISTS "service_insert_pay_audit" ON payment_audit_log;

CREATE POLICY "service_insert_att_audit" ON attendance_audit_log FOR INSERT
  WITH CHECK (FALSE);

CREATE POLICY "service_insert_pay_audit" ON payment_audit_log FOR INSERT
  WITH CHECK (FALSE);

-- ── 6. Server-authoritative attendance save RPC ──────────────
CREATE OR REPLACE FUNCTION public.submit_attendance_batch(
  p_class_name TEXT,
  p_date DATE,
  p_records JSONB
)
RETURNS TABLE(saved_count INTEGER, present_count INTEGER, absent_count INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor UUID := auth.uid();
  v_teacher_id UUID;
  v_row JSONB;
  v_student_id UUID;
  v_status TEXT;
  v_old_status TEXT;
  v_saved INTEGER := 0;
  v_present INTEGER := 0;
  v_absent INTEGER := 0;
BEGIN
  IF v_actor IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF p_class_name IS NULL OR BTRIM(p_class_name) = '' THEN
    RAISE EXCEPTION 'Class name is required';
  END IF;

  IF p_records IS NULL OR jsonb_typeof(p_records) <> 'array' OR jsonb_array_length(p_records) = 0 THEN
    RAISE EXCEPTION 'At least one attendance record is required';
  END IF;

  SELECT id INTO v_teacher_id
    FROM teachers
   WHERE profile_id = v_actor
   LIMIT 1;

  IF v_teacher_id IS NULL THEN
    RAISE EXCEPTION 'Only teacher accounts can submit attendance';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM timetable
     WHERE teacher_id = v_teacher_id
       AND class_name = p_class_name
  ) THEN
    RAISE EXCEPTION 'Teacher is not assigned to class %', p_class_name;
  END IF;

  FOR v_row IN SELECT * FROM jsonb_array_elements(p_records)
  LOOP
    v_student_id := NULLIF(v_row->>'student_id', '')::UUID;
    v_status := COALESCE(NULLIF(v_row->>'status', ''), 'Absent');

    IF v_status NOT IN ('Present', 'Absent', 'Late') THEN
      RAISE EXCEPTION 'Invalid attendance status: %', v_status;
    END IF;

    v_old_status := NULL;

    IF NOT EXISTS (
      SELECT 1 FROM students
       WHERE id = v_student_id
         AND class = p_class_name
         AND COALESCE(status, 'Active') = 'Active'
    ) THEN
      RAISE EXCEPTION 'Student % is not active in class %', v_student_id, p_class_name;
    END IF;

    SELECT status INTO v_old_status
      FROM attendance
     WHERE student_id = v_student_id
       AND date = p_date
     FOR UPDATE;

    INSERT INTO attendance (student_id, date, status, marked_by, updated_by, version)
    VALUES (v_student_id, p_date, v_status, v_teacher_id, v_actor, 1)
    ON CONFLICT (student_id, date)
    DO UPDATE SET
      status = EXCLUDED.status,
      marked_by = EXCLUDED.marked_by,
      updated_by = EXCLUDED.updated_by,
      updated_at = NOW(),
      version = attendance.version + 1;

    INSERT INTO attendance_audit_log (student_id, teacher_id, date, old_status, new_status, note)
    VALUES (
      v_student_id,
      v_teacher_id,
      p_date,
      v_old_status,
      v_status,
      'Server-authoritative attendance batch for ' || p_class_name
    );

    v_saved := v_saved + 1;
    IF v_status = 'Present' THEN
      v_present := v_present + 1;
    ELSE
      v_absent := v_absent + 1;
    END IF;
  END LOOP;

  RETURN QUERY SELECT v_saved, v_present, v_absent;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_attendance_batch(TEXT, DATE, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_attendance_batch(TEXT, DATE, JSONB) TO authenticated;

-- Teachers must use submit_attendance_batch(); admins keep direct access.
DROP POLICY IF EXISTS "attendance_teacher_write" ON attendance;
DROP POLICY IF EXISTS "attendance_teacher_update" ON attendance;

-- ── 7. Payment reminder audit RPC ────────────────────────────
CREATE OR REPLACE FUNCTION public.log_payment_reminder(
  p_payment_id UUID,
  p_note TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor UUID := auth.uid();
  v_payment RECORD;
BEGIN
  IF v_actor IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = v_actor AND role = 'admin') THEN
    RAISE EXCEPTION 'Only admins can log payment reminders';
  END IF;

  SELECT id, student_id, status
    INTO v_payment
    FROM payments
   WHERE id = p_payment_id;

  IF v_payment.id IS NULL THEN
    RAISE EXCEPTION 'Payment not found';
  END IF;

  INSERT INTO payment_audit_log (
    payment_id, student_id, old_status, new_status, changed_by, action, note
  ) VALUES (
    v_payment.id,
    v_payment.student_id,
    v_payment.status,
    v_payment.status,
    v_actor,
    'reminder',
    COALESCE(p_note, 'Payment reminder triggered by admin')
  );
END;
$$;

REVOKE ALL ON FUNCTION public.log_payment_reminder(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.log_payment_reminder(UUID, TEXT) TO authenticated;

-- ── 8. Idempotent teacher clock-in/out RPCs ──────────────────
CREATE OR REPLACE FUNCTION public.teacher_clock_in()
RETURNS TABLE(id UUID, clock_in TIMESTAMPTZ, clock_out TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor UUID := auth.uid();
  v_teacher_id UUID;
  v_today DATE := (NOW() AT TIME ZONE 'Africa/Lagos')::DATE;
  v_now TIMESTAMPTZ := NOW();
BEGIN
  IF v_actor IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT teachers.id INTO v_teacher_id FROM teachers WHERE profile_id = v_actor LIMIT 1;
  IF v_teacher_id IS NULL THEN
    RAISE EXCEPTION 'Only teacher accounts can clock in';
  END IF;

  INSERT INTO teacher_clockin (teacher_id, date, clock_in)
  VALUES (v_teacher_id, v_today, v_now)
  ON CONFLICT (teacher_id, date)
  DO UPDATE SET clock_in = COALESCE(teacher_clockin.clock_in, EXCLUDED.clock_in)
  WHERE teacher_clockin.clock_out IS NULL;

  RETURN QUERY
  SELECT tc.id, tc.clock_in, tc.clock_out
    FROM teacher_clockin tc
   WHERE tc.teacher_id = v_teacher_id AND tc.date = v_today;
END;
$$;

CREATE OR REPLACE FUNCTION public.teacher_clock_out()
RETURNS TABLE(id UUID, clock_in TIMESTAMPTZ, clock_out TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor UUID := auth.uid();
  v_teacher_id UUID;
  v_today DATE := (NOW() AT TIME ZONE 'Africa/Lagos')::DATE;
  v_now TIMESTAMPTZ := NOW();
BEGIN
  IF v_actor IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT teachers.id INTO v_teacher_id FROM teachers WHERE profile_id = v_actor LIMIT 1;
  IF v_teacher_id IS NULL THEN
    RAISE EXCEPTION 'Only teacher accounts can clock out';
  END IF;

  UPDATE teacher_clockin
     SET clock_out = v_now
   WHERE teacher_id = v_teacher_id
     AND date = v_today
     AND clock_in IS NOT NULL
     AND clock_out IS NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No active clock-in session found for today';
  END IF;

  RETURN QUERY
  SELECT tc.id, tc.clock_in, tc.clock_out
    FROM teacher_clockin tc
   WHERE tc.teacher_id = v_teacher_id AND tc.date = v_today;
END;
$$;

REVOKE ALL ON FUNCTION public.teacher_clock_in() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.teacher_clock_out() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.teacher_clock_in() TO authenticated;
GRANT EXECUTE ON FUNCTION public.teacher_clock_out() TO authenticated;

DROP POLICY IF EXISTS "clockin_teacher_write" ON teacher_clockin;
DROP POLICY IF EXISTS "clockin_teacher_update" ON teacher_clockin;

-- Financial KPIs should not be callable by anon users.
REVOKE EXECUTE ON FUNCTION get_fee_stats() FROM anon;
GRANT EXECUTE ON FUNCTION get_fee_stats() TO authenticated;
