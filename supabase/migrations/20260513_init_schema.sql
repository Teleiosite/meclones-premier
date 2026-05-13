-- ============================================================
-- Initialization Schema: Meclones Academy
-- Reconstructed from frontend application source code.
-- Generated: May 13, 2026
--
-- INSTRUCTIONS: Run this script in the Supabase SQL Editor
-- to create all base tables. After this succeeds, run the
-- RLS Policies script.
-- ============================================================

-- Enable pgcrypto for UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ── 1. Core Users & Profiles ─────────────────────────────────

-- Profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role       TEXT NOT NULL CHECK (role IN ('admin', 'teacher', 'student', 'parent')),
  email      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Parents
CREATE TABLE IF NOT EXISTS parents (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  phone      TEXT,
  email      TEXT,
  status     TEXT DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Students
CREATE TABLE IF NOT EXISTS students (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id   UUID REFERENCES profiles(id) ON DELETE CASCADE,
  parent_id    UUID REFERENCES parents(id) ON DELETE SET NULL,
  admission_no TEXT UNIQUE NOT NULL,
  name         TEXT NOT NULL,
  class        TEXT NOT NULL,
  gender       TEXT,
  status       TEXT DEFAULT 'Active',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Teachers
CREATE TABLE IF NOT EXISTS teachers (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id             UUID REFERENCES profiles(id) ON DELETE CASCADE,
  employee_id            TEXT UNIQUE NOT NULL,
  name                   TEXT NOT NULL,
  subject_specialization TEXT,
  qualification          TEXT,
  status                 TEXT DEFAULT 'Active',
  created_at             TIMESTAMPTZ DEFAULT NOW()
);


-- ── 2. Academics & Timetable ─────────────────────────────────

-- Classes
CREATE TABLE IF NOT EXISTS classes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT UNIQUE NOT NULL,
  section    TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Timetable
CREATE TABLE IF NOT EXISTS timetable (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_name TEXT NOT NULL,
  subject    TEXT NOT NULL,
  teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
  day        TEXT NOT NULL,
  time       TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ── 3. Attendance & Operations ───────────────────────────────

-- Attendance
CREATE TABLE IF NOT EXISTS attendance (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  date       DATE NOT NULL,
  status     TEXT NOT NULL CHECK (status IN ('Present', 'Absent', 'Late')),
  marked_by  UUID REFERENCES teachers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, date)
);

-- Teacher Clock-in
CREATE TABLE IF NOT EXISTS teacher_clockin (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
  date       DATE NOT NULL,
  clock_in   TIMESTAMPTZ,
  clock_out  TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(teacher_id, date)
);


-- ── 4. Assignments & Exams ───────────────────────────────────

-- Assignments
CREATE TABLE IF NOT EXISTS assignments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id  UUID REFERENCES teachers(id) ON DELETE CASCADE,
  class_name  TEXT NOT NULL,
  title       TEXT NOT NULL,
  description TEXT,
  due_date    DATE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Assignment Submissions
CREATE TABLE IF NOT EXISTS assignment_submissions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
  student_id    UUID REFERENCES students(id) ON DELETE CASCADE,
  submitted_at  TIMESTAMPTZ DEFAULT NOW(),
  grade         TEXT,
  feedback      TEXT,
  file_url      TEXT,
  UNIQUE(assignment_id, student_id)
);

-- Exams
CREATE TABLE IF NOT EXISTS exams (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
  class_name TEXT NOT NULL,
  subject    TEXT NOT NULL,
  date       DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Results
CREATE TABLE IF NOT EXISTS results (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id    UUID REFERENCES exams(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  score      NUMERIC,
  grade      TEXT,
  remarks    TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(exam_id, student_id)
);


-- ── 5. Communication & Administration ────────────────────────

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id   UUID REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  body        TEXT NOT NULL,
  read        BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Announcements
CREATE TABLE IF NOT EXISTS announcements (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title      TEXT NOT NULL,
  body       TEXT NOT NULL,
  audience   TEXT NOT NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admissions
CREATE TABLE IF NOT EXISTS admissions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_name TEXT NOT NULL,
  class_applying TEXT NOT NULL,
  parent_name    TEXT NOT NULL,
  parent_email   TEXT NOT NULL,
  parent_phone   TEXT NOT NULL,
  status         TEXT DEFAULT 'Pending',
  created_at     TIMESTAMPTZ DEFAULT NOW()
);


-- ── 6. Financial ─────────────────────────────────────────────

-- Fees
CREATE TABLE IF NOT EXISTS fees (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_name TEXT NOT NULL,
  amount     NUMERIC NOT NULL,
  term       TEXT,
  year       TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  amount     NUMERIC NOT NULL,
  status     TEXT NOT NULL,
  paid_at    TIMESTAMPTZ,
  reference  TEXT,
  term       TEXT,
  year       TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- NOTE: The attendance_audit_log and payment_audit_log tables
-- were created in a previous migration (20260513_audit_logs.sql)
-- so they are excluded here.
-- ============================================================
