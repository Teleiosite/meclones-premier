-- Employee profiles and unified attendance
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE,
  department TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS unified_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present','absent','late','half_day','leave')),
  check_in TIMESTAMPTZ NULL,
  check_out TIMESTAMPTZ NULL,
  notes TEXT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, date)
);

CREATE INDEX IF NOT EXISTS idx_unified_attendance_date ON unified_attendance(date);
CREATE INDEX IF NOT EXISTS idx_unified_attendance_employee_id ON unified_attendance(employee_id);

CREATE OR REPLACE FUNCTION update_attendance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_unified_attendance_updated_at ON unified_attendance;
CREATE TRIGGER trg_unified_attendance_updated_at
BEFORE UPDATE ON unified_attendance
FOR EACH ROW
EXECUTE FUNCTION update_attendance_updated_at();

-- RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE unified_attendance ENABLE ROW LEVEL SECURITY;

-- If profile table doesnt exist, we create a simple roles table
CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  role TEXT CHECK (role IN ('admin','manager','employee'))
);
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Policies for employees
DROP POLICY IF EXISTS "Auth users can select employees" ON employees;
CREATE POLICY "Auth users can select employees" ON employees FOR SELECT USING (auth.uid() IS NOT NULL);

-- Policies for attendance
DROP POLICY IF EXISTS "Auth users can select attendance" ON unified_attendance;
CREATE POLICY "Auth users can select attendance" ON unified_attendance FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Only admin/manager can insert attendance" ON unified_attendance;
CREATE POLICY "Only admin/manager can insert attendance" ON unified_attendance FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin','manager')) OR 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','manager'))
);

DROP POLICY IF EXISTS "Only admin/manager can update attendance" ON unified_attendance;
CREATE POLICY "Only admin/manager can update attendance" ON unified_attendance FOR UPDATE USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin','manager')) OR 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','manager'))
);

DROP POLICY IF EXISTS "Only admin/manager can delete attendance" ON unified_attendance;
CREATE POLICY "Only admin/manager can delete attendance" ON unified_attendance FOR DELETE USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin','manager')) OR 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','manager'))
);

-- Seed data for employees since UI relies on it
INSERT INTO employees (full_name, email, department)
VALUES 
  ('David Okafor', 'david@example.com', 'Primary 3A'),
  ('Grace Okafor', 'grace@example.com', 'Primary 5A'),
  ('Amina Yusuf', 'amina@example.com', 'JSS 1A'),
  ('Emeka Eze', 'emeka@example.com', 'SS 1A'),
  ('Teacher 1', 'teacher1@example.com', 'Staff')
ON CONFLICT DO NOTHING;
