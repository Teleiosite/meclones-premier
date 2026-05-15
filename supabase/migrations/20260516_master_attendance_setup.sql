-- ============================================================
-- MASTER ATTENDANCE SETUP — Run this ONCE in Supabase SQL Editor
-- This replaces all previous attendance migration files.
-- ============================================================

-- 1. ATTENDANCE POLICIES TABLE
CREATE TABLE IF NOT EXISTS attendance_policies (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key        TEXT UNIQUE NOT NULL,
  value      TEXT NOT NULL DEFAULT '',
  label      TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at
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

-- Seed all policy rows
INSERT INTO attendance_policies (key, value, label) VALUES
  ('earliest_signin',     '07:00',    'Earliest Sign-In'),
  ('punctuality_limit',   '09:00',    'Punctuality Limit'),
  ('grace_threshold',     '15',       'Grace Threshold (Min)'),
  ('absence_trigger',     '11:00',    'Absence Trigger'),
  ('half_day_boundary',   '13:00',    'Half-Day Boundary'),
  ('window_authorization','16:00',    'Window Authorization'),
  ('standard_shift_end',  '18:00',    'Standard Shift End'),
  ('ip_pool',             '',         'Authorized IP Pool'),
  ('ip_enforcement',      'disabled', 'IP Enforcement Protocol'),
  ('geo_latitude',        '',         'Latitude Reference'),
  ('geo_longitude',       '',         'Longitude Reference'),
  ('geo_radius',          '200',      'Authorized Radius (m)'),
  ('geo_enforcement',     'disabled', 'Accuracy Protocol')
ON CONFLICT (key) DO NOTHING;


-- 2. TEACHER CLOCKIN RLS (table already exists from init_schema.sql)
ALTER TABLE teacher_clockin ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Teachers view own clockin" ON teacher_clockin;
CREATE POLICY "Teachers view own clockin" ON teacher_clockin
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM teachers WHERE teachers.id = teacher_clockin.teacher_id AND teachers.profile_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

DROP POLICY IF EXISTS "Teachers insert own clockin" ON teacher_clockin;
CREATE POLICY "Teachers insert own clockin" ON teacher_clockin
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM teachers WHERE teachers.id = teacher_clockin.teacher_id AND teachers.profile_id = auth.uid())
  );

DROP POLICY IF EXISTS "Teachers update own clockin" ON teacher_clockin;
CREATE POLICY "Teachers update own clockin" ON teacher_clockin
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM teachers WHERE teachers.id = teacher_clockin.teacher_id AND teachers.profile_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

DROP POLICY IF EXISTS "Admin delete clockin" ON teacher_clockin;
CREATE POLICY "Admin delete clockin" ON teacher_clockin
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );


-- 3. ATTENDANCE POLICIES RLS
ALTER TABLE attendance_policies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can read policies" ON attendance_policies;
CREATE POLICY "Authenticated can read policies" ON attendance_policies
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins can update policies" ON attendance_policies;
CREATE POLICY "Admins can update policies" ON attendance_policies
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );


-- 4. GRANTS — Critical: fixes "schema cache" errors
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON attendance_policies TO anon, authenticated;
GRANT UPDATE ON attendance_policies TO authenticated;
GRANT SELECT ON teacher_clockin TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON teacher_clockin TO authenticated;
GRANT SELECT ON teachers TO anon, authenticated;
GRANT SELECT ON profiles TO anon, authenticated;


-- 5. DROP old tables from previous migrations (no longer used)
DROP TABLE IF EXISTS unified_attendance CASCADE;
DROP TABLE IF EXISTS employees CASCADE;


-- 6. Force PostgREST schema cache reload
NOTIFY pgrst, 'reload schema';
