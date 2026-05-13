-- ============================================================
-- Audit Logs: attendance_audit_log + payment_audit_log
-- Immutable, append-only tables for the audit trail.
-- NOTE: No FK constraints intentionally — audit records must
--       survive even if the source row is deleted.
-- ============================================================

-- ── Attendance Audit Log ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS attendance_audit_log (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id    UUID        NOT NULL,   -- soft ref to students.id
  teacher_id    UUID        NOT NULL,   -- soft ref to teachers.id
  date          DATE        NOT NULL,
  old_status    TEXT,                   -- NULL on first insert
  new_status    TEXT        NOT NULL,   -- 'Present' | 'Absent' | 'Late'
  changed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  note          TEXT
);

-- Only append; no updates or deletes allowed
ALTER TABLE attendance_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins_read_att_audit" ON attendance_audit_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
       WHERE profiles.id = auth.uid()
         AND profiles.role = 'admin'
    )
  );

CREATE POLICY "teachers_read_own_att_audit" ON attendance_audit_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM teachers
       WHERE teachers.id = attendance_audit_log.teacher_id
         AND teachers.profile_id = auth.uid()
    )
  );

CREATE POLICY "authenticated_insert_att_audit" ON attendance_audit_log FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Block UPDATE and DELETE — append-only
CREATE POLICY "no_update_att_audit" ON attendance_audit_log FOR UPDATE
  USING (FALSE);

CREATE POLICY "no_delete_att_audit" ON attendance_audit_log FOR DELETE
  USING (FALSE);

CREATE INDEX IF NOT EXISTS idx_att_audit_teacher_date
  ON attendance_audit_log (teacher_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_att_audit_student
  ON attendance_audit_log (student_id, date DESC);


-- ── Payment Audit Log ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payment_audit_log (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id    UUID,                   -- soft ref to payments.id
  student_id    UUID,                   -- soft ref to students.id
  old_status    TEXT,
  new_status    TEXT        NOT NULL,
  changed_by    UUID        NOT NULL,   -- auth.uid() of actor
  changed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  action        TEXT        NOT NULL DEFAULT 'status_change', -- 'reminder' | 'status_change' | 'webhook'
  note          TEXT
);

ALTER TABLE payment_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins_read_pay_audit" ON payment_audit_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
       WHERE profiles.id = auth.uid()
         AND profiles.role = 'admin'
    )
  );

CREATE POLICY "authenticated_insert_pay_audit" ON payment_audit_log FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "no_update_pay_audit" ON payment_audit_log FOR UPDATE
  USING (FALSE);

CREATE POLICY "no_delete_pay_audit" ON payment_audit_log FOR DELETE
  USING (FALSE);

CREATE INDEX IF NOT EXISTS idx_pay_audit_payment
  ON payment_audit_log (payment_id, changed_at DESC);

CREATE INDEX IF NOT EXISTS idx_pay_audit_actor
  ON payment_audit_log (changed_by, changed_at DESC);
