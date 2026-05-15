-- Master Remediation Migration
-- Date: 2026-05-15
-- Description: Consolidates all database fixes including manage_user, fee_stats, and missing columns.

-- 1. Setup Extensions
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS pgcrypto SCHEMA extensions;

-- 2. Ensure missing columns exist in core tables
ALTER TABLE public.parents ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.parents ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.parents ADD COLUMN IF NOT EXISTS occupation TEXT;
ALTER TABLE public.parents ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active';

ALTER TABLE public.students ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active';
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS class_id UUID REFERENCES public.classes(id);
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active';


ALTER TABLE public.timetable ADD COLUMN IF NOT EXISTS time_slot TEXT;
ALTER TABLE public.timetable ADD COLUMN IF NOT EXISTS day TEXT;
ALTER TABLE public.timetable ADD COLUMN IF NOT EXISTS subject TEXT;
ALTER TABLE public.timetable ADD COLUMN IF NOT EXISTS room TEXT;
ALTER TABLE public.timetable ADD COLUMN IF NOT EXISTS color TEXT DEFAULT 'bg-navy';
ALTER TABLE public.timetable ADD COLUMN IF NOT EXISTS teacher_id UUID REFERENCES public.teachers(profile_id);
ALTER TABLE public.timetable ADD COLUMN IF NOT EXISTS class_name TEXT;


ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS term TEXT;

ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'Bank Transfer';
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS academic_year TEXT DEFAULT '2023/2024';

-- 3. Create Fee Structures table
CREATE TABLE IF NOT EXISTS public.fee_structures (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_name  TEXT NOT NULL,
  term        TEXT NOT NULL,
  tuition     DECIMAL DEFAULT 0,
  uniform     DECIMAL DEFAULT 0,
  books       DECIMAL DEFAULT 0,
  others      DECIMAL DEFAULT 0,
  total       DECIMAL GENERATED ALWAYS AS (tuition + uniform + books + others) STORED,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_name, term)
);

-- 4. Create Academic Hub tables
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.classes (
  id UUID PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  section TEXT,
  room_no TEXT,
  teacher_id UUID REFERENCES public.teachers(profile_id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.school_settings (
  id TEXT PRIMARY KEY,
  session TEXT NOT NULL DEFAULT '2023/2024',
  term TEXT NOT NULL DEFAULT 'First Term',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.school_settings (id, session, term)
VALUES ('current', '2023/2024', 'First Term')
ON CONFLICT (id) DO NOTHING;


-- 5. Set Permissions and Security
GRANT ALL ON public.fee_structures TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fee_structures TO authenticated;

GRANT ALL ON public.subjects TO authenticated;
GRANT ALL ON public.classes TO authenticated;
GRANT ALL ON public.timetable TO authenticated;
GRANT ALL ON public.school_settings TO authenticated;

-- Enable RLS
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Everyone can view settings" ON public.school_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage settings" ON public.school_settings FOR ALL TO authenticated USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

CREATE POLICY "Everyone can view subjects" ON public.subjects FOR SELECT USING (true);

CREATE POLICY "Admins can manage subjects" ON public.subjects FOR ALL TO authenticated USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

CREATE POLICY "Everyone can view classes" ON public.classes FOR SELECT USING (true);
CREATE POLICY "Admins can manage classes" ON public.classes FOR ALL TO authenticated USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

CREATE POLICY "Everyone can view timetable" ON public.timetable FOR SELECT USING (true);
CREATE POLICY "Admins can manage timetable" ON public.timetable FOR ALL TO authenticated USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

CREATE POLICY "Everyone can view fee structures" ON public.fee_structures FOR SELECT USING (true);
CREATE POLICY "Admins can manage fee structures" ON public.fee_structures FOR ALL TO authenticated USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

-- 6. Unified User Management RPC



CREATE OR REPLACE FUNCTION public.manage_user(
  p_action TEXT,
  p_role TEXT DEFAULT NULL,
  p_email TEXT DEFAULT NULL,
  p_password TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}',
  p_admission_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public, auth, extensions
AS $func$
DECLARE
  v_user_id UUID;
BEGIN
  -- Security check
  IF (auth.jwt() -> 'user_metadata' ->> 'role') != 'admin' THEN
    RAISE EXCEPTION 'Only admins can manage users';
  END IF;

  IF p_action = 'create' THEN
    v_user_id := extensions.gen_random_uuid();

    -- Create Auth User
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, role, aud)
    VALUES (v_user_id, p_email, extensions.crypt(p_password, extensions.gen_salt('bf')), NULL, '{"provider":"email"}', jsonb_build_object('role', p_role, 'full_name', p_metadata->>'full_name'), 'authenticated', 'authenticated');

    -- Create Public Profile
    INSERT INTO public.profiles (id, role, email, full_name) 
    VALUES (v_user_id, p_role, p_email, p_metadata->>'full_name');

    -- Role Specific Logic
    IF p_role = 'teacher' THEN
      INSERT INTO public.teachers (profile_id, employee_id, subject_specialization, qualification, status)
      VALUES (v_user_id, p_metadata->>'employee_id', p_metadata->>'subject_specialization', p_metadata->>'qualification', 'Active');
    
    ELSIF p_role = 'student' THEN
      INSERT INTO public.students (profile_id, admission_no, class, gender, status)
      VALUES (v_user_id, p_metadata->>'admission_no', p_metadata->>'class', p_metadata->>'gender', 'Active');

    ELSIF p_role = 'parent' THEN
      INSERT INTO public.parents (profile_id, phone, address, occupation, status)
      VALUES (v_user_id, p_metadata->>'phone', p_metadata->>'address', p_metadata->>'occupation', 'Active');
    END IF;

    RETURN jsonb_build_object('status', 'success', 'user_id', v_user_id);
  END IF;
  
  RETURN jsonb_build_object('status', 'error', 'message', 'Invalid action');
END;
$func$;

-- 5. Financial Stats RPC
CREATE OR REPLACE FUNCTION get_fee_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_collected DECIMAL;
  v_pending DECIMAL;
  v_total_students INT;
BEGIN
  SELECT COALESCE(SUM(amount), 0) INTO v_collected FROM public.payments WHERE status = 'success';
  SELECT COALESCE(SUM(amount), 0) INTO v_pending FROM public.payments WHERE status = 'pending';
  SELECT COUNT(*) INTO v_total_students FROM public.students;

  RETURN jsonb_build_object(
    'collected', v_collected,
    'pending', v_pending,
    'total_students', v_total_students
  );
END;
$$;
