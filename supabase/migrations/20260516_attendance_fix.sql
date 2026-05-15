-- ============================================================
-- Attendance System: Complete Fix Migration
-- Meclones Academy
-- Run this in the Supabase SQL Editor
-- ============================================================

-- 1. ATTENDANCE POLICIES TABLE (for editable Clock-In/Out Matrix)
CREATE TABLE IF NOT EXISTS attendance_policies (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key         TEXT UNIQUE NOT NULL,   -- e.g. 'earliest_signin', 'punctuality_limit'
  value       TEXT NOT NULL,          -- e.g. '07:00'
  label       TEXT,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default policy values
INSERT INTO attendance_policies (key, value, label) VALUES
  ('earliest_signin',    '07:00', 'Earliest Sign-In'),
  ('punctuality_limit',  '09:00', 'Punctuality Limit'),
  ('grace_threshold',    '15',    'Grace Threshold (Min)'),
  ('absence_trigger',    '11:00', 'Absence Trigger'),
  ('half_day_boundary',  '13:00', 'Half-Day Boundary'),
  ('window_authorization','16:00','Window Authorization'),
  ('standard_shift_end', '18:00', 'Standard Shift End')
ON CONFLICT (key) DO NOTHING;

-- Auto-update updated_at on policy change
CREATE OR REPLACE FUNCTION update_policy_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_policy_updated_at ON attendance_policies;
CREATE TRIGGER trg_policy_updated_at
BEFORE UPDATE ON attendance_policies
FOR EACH ROW EXECUTE FUNCTION update_policy_updated_at();

-- 2. RLS FOR EXISTING teacher_clockin TABLE
--    (Already created in init_schema.sql — just add policies)
ALTER TABLE teacher_clockin ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Teachers can view their own clockin" ON teacher_clockin;
CREATE POLICY "Teachers can view their own clockin" ON teacher_clockin
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM teachers
      WHERE teachers.id = teacher_clockin.teacher_id
        AND teachers.profile_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Teachers can insert their own clockin" ON teacher_clockin;
CREATE POLICY "Teachers can insert their own clockin" ON teacher_clockin
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM teachers
      WHERE teachers.id = teacher_clockin.teacher_id
        AND teachers.profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Teachers can update their own clockin" ON teacher_clockin;
CREATE POLICY "Teachers can update their own clockin" ON teacher_clockin
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM teachers
      WHERE teachers.id = teacher_clockin.teacher_id
        AND teachers.profile_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- 3. RLS FOR attendance_policies
ALTER TABLE attendance_policies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone authenticated can read policies" ON attendance_policies;
CREATE POLICY "Anyone authenticated can read policies" ON attendance_policies
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Only admins can update policies" ON attendance_policies;
CREATE POLICY "Only admins can update policies" ON attendance_policies
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- 4. GRANTS — this is the fix for "Could not find the table in schema cache"
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON teacher_clockin TO anon, authenticated;
GRANT INSERT, UPDATE ON teacher_clockin TO authenticated;
GRANT SELECT ON attendance_policies TO anon, authenticated;
GRANT UPDATE ON attendance_policies TO authenticated;
GRANT SELECT ON teachers TO anon, authenticated;
GRANT SELECT ON profiles TO anon, authenticated;

-- Force PostgREST to reload its schema cache
NOTIFY pgrst, 'reload schema';
