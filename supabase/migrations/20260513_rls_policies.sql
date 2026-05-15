-- ============================================================
-- RLS Policies: Meclones Academy — All Tables
-- Generated: May 13, 2026
--
-- Role hierarchy (stored in profiles.role):
--   admin   → full access to everything
--   teacher → read students in their classes, write own records
--   student → read/write only their own records
--   parent  → read their child's records
--
-- IMPORTANT: Run this after all tables have been created.
-- Each table section enables RLS then defines policies.
-- Safe to re-run (uses CREATE POLICY IF NOT EXISTS where supported,
-- or DROP + CREATE pattern for idempotency).
-- ============================================================

-- ── Helper: reusable role checks ─────────────────────────────
-- We use inline subqueries referencing profiles.role throughout.
-- auth.uid() is the Supabase built-in for the current user's UUID.

-- ============================================================
-- 1. profiles
-- Every user can read & update their OWN profile.
-- Admins can read all profiles (needed for user management).
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own"   ON profiles;
DROP POLICY IF EXISTS "profiles_select_admin" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own"   ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own"   ON profiles;

-- Any authenticated user can read their own profile
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT
  USING (id = auth.uid());

-- Admins can read all profiles (for user management UI)
CREATE POLICY "profiles_select_admin" ON profiles FOR SELECT
  USING ( (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' );

-- Users can update only their own profile
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  USING (id = auth.uid());

-- Auth trigger inserts profiles on signup — allow service role only
-- (service_role bypasses RLS by default; no INSERT policy needed for anon)


-- ============================================================
-- 2. students
-- Admins: full access
-- Teachers: read students in their assigned classes
-- Students: read only their own record
-- Parents: read their child's record
-- ============================================================
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "students_admin"   ON students;
DROP POLICY IF EXISTS "students_teacher" ON students;
DROP POLICY IF EXISTS "students_self"    ON students;
DROP POLICY IF EXISTS "students_parent"  ON students;
DROP POLICY IF EXISTS "students_admin_write" ON students;

-- Admin: read all
CREATE POLICY "students_admin" ON students FOR SELECT
  USING ( (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' );

-- Admin: write (insert/update/delete)
CREATE POLICY "students_admin_write" ON students FOR ALL
  USING ( (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' );

-- Teacher: read students in their classes (via timetable)
CREATE POLICY "students_teacher" ON students FOR SELECT
  USING (
    EXISTS (
      SELECT 1
        FROM teachers t
        JOIN timetable tt ON tt.teacher_id = t.id
       WHERE t.profile_id = auth.uid()
         AND tt.class_name = students.class
    )
  );

-- Student: read own record only
CREATE POLICY "students_self" ON students FOR SELECT
  USING (profile_id = auth.uid());

-- Parent: read their child's record
CREATE POLICY "students_parent" ON students FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM parents p
       WHERE p.profile_id = auth.uid()
         AND p.id = students.parent_id
    )
  );


-- ============================================================
-- 3. teachers
-- Admins: full access
-- Teachers: read own record
-- Students/Parents: read teacher info (for timetable display)
-- ============================================================
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "teachers_admin"        ON teachers;
DROP POLICY IF EXISTS "teachers_admin_write"  ON teachers;
DROP POLICY IF EXISTS "teachers_self"         ON teachers;
DROP POLICY IF EXISTS "teachers_read_auth"    ON teachers;

CREATE POLICY "teachers_admin_write" ON teachers FOR ALL
  USING ( (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' );

-- Teachers read own record
CREATE POLICY "teachers_self" ON teachers FOR SELECT
  USING (profile_id = auth.uid());

-- Any authenticated user can read teacher list (needed for timetable)
CREATE POLICY "teachers_read_auth" ON teachers FOR SELECT
  USING (auth.uid() IS NOT NULL);


-- ============================================================
-- 4. parents
-- Admins: full access
-- Parents: read own record
-- ============================================================
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "parents_admin" ON parents;
DROP POLICY IF EXISTS "parents_self"  ON parents;

CREATE POLICY "parents_admin" ON parents FOR ALL
  USING (
    ( (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' )
  );

CREATE POLICY "parents_self" ON parents FOR SELECT
  USING (profile_id = auth.uid());


-- ============================================================
-- 5. attendance
-- Admins: read all
-- Teachers: read/write attendance they marked (marked_by = teacher.id)
-- Students: read their own attendance records
-- Parents: read their child's attendance
-- ============================================================
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "attendance_admin"         ON attendance;
DROP POLICY IF EXISTS "attendance_teacher_read"  ON attendance;
DROP POLICY IF EXISTS "attendance_teacher_write" ON attendance;
DROP POLICY IF EXISTS "attendance_student"       ON attendance;
DROP POLICY IF EXISTS "attendance_parent"        ON attendance;

CREATE POLICY "attendance_admin" ON attendance FOR ALL
  USING (
    ( (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' )
  );

-- Teacher reads attendance they have marked
CREATE POLICY "attendance_teacher_read" ON attendance FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM teachers WHERE profile_id = auth.uid() AND id = attendance.marked_by
    )
  );

-- Teacher writes (insert/update) attendance they are marking
CREATE POLICY "attendance_teacher_write" ON attendance FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teachers WHERE profile_id = auth.uid() AND id = attendance.marked_by
    )
  );

CREATE POLICY "attendance_teacher_update" ON attendance FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM teachers WHERE profile_id = auth.uid() AND id = attendance.marked_by
    )
  );

-- Student reads own attendance
CREATE POLICY "attendance_student" ON attendance FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM students WHERE profile_id = auth.uid() AND id = attendance.student_id
    )
  );

-- Parent reads their child's attendance
CREATE POLICY "attendance_parent" ON attendance FOR SELECT
  USING (
    EXISTS (
      SELECT 1
        FROM students s
        JOIN parents p ON p.id = s.parent_id
       WHERE p.profile_id = auth.uid()
         AND s.id = attendance.student_id
    )
  );


-- ============================================================
-- 6. timetable
-- Admins: full access (create/edit/delete)
-- Teachers: read entries where they are assigned
-- Students/Parents: read their class's timetable
-- ============================================================
ALTER TABLE timetable ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "timetable_admin"      ON timetable;
DROP POLICY IF EXISTS "timetable_teacher"    ON timetable;
DROP POLICY IF EXISTS "timetable_student"    ON timetable;
DROP POLICY IF EXISTS "timetable_parent"     ON timetable;
DROP POLICY IF EXISTS "timetable_auth_read"  ON timetable;

CREATE POLICY "timetable_admin" ON timetable FOR ALL
  USING (
    ( (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' )
  );

-- Any authenticated user can read the timetable (needed by all dashboards)
CREATE POLICY "timetable_auth_read" ON timetable FOR SELECT
  USING (auth.uid() IS NOT NULL);


-- ============================================================
-- 7. assignments
-- Admins: full access
-- Teachers: read/write their own assignments
-- Students: read assignments for their class
-- ============================================================
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "assignments_admin"          ON assignments;
DROP POLICY IF EXISTS "assignments_teacher_read"   ON assignments;
DROP POLICY IF EXISTS "assignments_teacher_write"  ON assignments;
DROP POLICY IF EXISTS "assignments_student"        ON assignments;

CREATE POLICY "assignments_admin" ON assignments FOR ALL
  USING (
    ( (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' )
  );

CREATE POLICY "assignments_teacher_read" ON assignments FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM teachers WHERE profile_id = auth.uid() AND id = assignments.teacher_id)
  );

CREATE POLICY "assignments_teacher_write" ON assignments FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM teachers WHERE profile_id = auth.uid() AND id = assignments.teacher_id)
  );

CREATE POLICY "assignments_teacher_update" ON assignments FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM teachers WHERE profile_id = auth.uid() AND id = assignments.teacher_id)
  );

-- Students read assignments for their class
CREATE POLICY "assignments_student" ON assignments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM students WHERE profile_id = auth.uid() AND class = assignments.class_name
    )
  );


-- ============================================================
-- 8. assignment_submissions
-- Students: insert/read own submissions
-- Teachers: read submissions for their assignments
-- Admins: full access
-- ============================================================
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "submissions_admin"          ON assignment_submissions;
DROP POLICY IF EXISTS "submissions_student_read"   ON assignment_submissions;
DROP POLICY IF EXISTS "submissions_student_insert" ON assignment_submissions;
DROP POLICY IF EXISTS "submissions_teacher"        ON assignment_submissions;

CREATE POLICY "submissions_admin" ON assignment_submissions FOR ALL
  USING (
    ( (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' )
  );

CREATE POLICY "submissions_student_read" ON assignment_submissions FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM students WHERE profile_id = auth.uid() AND id = assignment_submissions.student_id)
  );

CREATE POLICY "submissions_student_insert" ON assignment_submissions FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM students WHERE profile_id = auth.uid() AND id = assignment_submissions.student_id)
  );

-- Teacher reads submissions for their assignments
CREATE POLICY "submissions_teacher" ON assignment_submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1
        FROM teachers t
        JOIN assignments a ON a.teacher_id = t.id
       WHERE t.profile_id = auth.uid()
         AND a.id = assignment_submissions.assignment_id
    )
  );


-- ============================================================
-- 9. exams
-- Admins: full access
-- Teachers: read/write their own exams
-- Students: read exams for their class
-- ============================================================
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "exams_admin"         ON exams;
DROP POLICY IF EXISTS "exams_teacher_read"  ON exams;
DROP POLICY IF EXISTS "exams_teacher_write" ON exams;
DROP POLICY IF EXISTS "exams_student"       ON exams;

CREATE POLICY "exams_admin" ON exams FOR ALL
  USING (
    ( (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' )
  );

CREATE POLICY "exams_teacher_read" ON exams FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM teachers WHERE profile_id = auth.uid() AND id = exams.teacher_id)
  );

CREATE POLICY "exams_teacher_write" ON exams FOR ALL
  USING (
    EXISTS (SELECT 1 FROM teachers WHERE profile_id = auth.uid() AND id = exams.teacher_id)
  );

CREATE POLICY "exams_student" ON exams FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM students WHERE profile_id = auth.uid() AND class = exams.class_name
    )
  );


-- ============================================================
-- 10. results
-- Admins: full access
-- Teachers: read/write results for their exams
-- Students: read own results
-- Parents: read their child's results
-- ============================================================
ALTER TABLE results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "results_admin"          ON results;
DROP POLICY IF EXISTS "results_teacher_read"   ON results;
DROP POLICY IF EXISTS "results_teacher_write"  ON results;
DROP POLICY IF EXISTS "results_student"        ON results;
DROP POLICY IF EXISTS "results_parent"         ON results;

CREATE POLICY "results_admin" ON results FOR ALL
  USING (
    ( (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' )
  );

CREATE POLICY "results_teacher_read" ON results FOR SELECT
  USING (
    EXISTS (
      SELECT 1
        FROM teachers t
        JOIN exams e ON e.teacher_id = t.id
       WHERE t.profile_id = auth.uid()
         AND e.id = results.exam_id
    )
  );

CREATE POLICY "results_teacher_write" ON results FOR ALL
  USING (
    EXISTS (
      SELECT 1
        FROM teachers t
        JOIN exams e ON e.teacher_id = t.id
       WHERE t.profile_id = auth.uid()
         AND e.id = results.exam_id
    )
  );

CREATE POLICY "results_student" ON results FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM students WHERE profile_id = auth.uid() AND id = results.student_id)
  );

CREATE POLICY "results_parent" ON results FOR SELECT
  USING (
    EXISTS (
      SELECT 1
        FROM students s
        JOIN parents p ON p.id = s.parent_id
       WHERE p.profile_id = auth.uid()
         AND s.id = results.student_id
    )
  );


-- ============================================================
-- 11. messages
-- Users can read messages sent TO them or BY them
-- Users can insert messages (as sender)
-- Users can update read-status on messages sent TO them
-- ============================================================
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "messages_read"   ON messages;
DROP POLICY IF EXISTS "messages_insert" ON messages;
DROP POLICY IF EXISTS "messages_update" ON messages;
DROP POLICY IF EXISTS "messages_admin"  ON messages;

CREATE POLICY "messages_admin" ON messages FOR ALL
  USING (
    ( (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' )
  );

-- Users read messages they sent or received
CREATE POLICY "messages_read" ON messages FOR SELECT
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());

-- Any authenticated user can send a message
CREATE POLICY "messages_insert" ON messages FOR INSERT
  WITH CHECK (sender_id = auth.uid());

-- Users can update (mark read) messages sent to them
CREATE POLICY "messages_update" ON messages FOR UPDATE
  USING (receiver_id = auth.uid());


-- ============================================================
-- 12. payments
-- Admins: full access
-- Parents: read their child's payments
-- Students: read own payments
-- ============================================================
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "payments_admin"   ON payments;
DROP POLICY IF EXISTS "payments_parent"  ON payments;
DROP POLICY IF EXISTS "payments_student" ON payments;

CREATE POLICY "payments_admin" ON payments FOR ALL
  USING (
    ( (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' )
  );

CREATE POLICY "payments_parent" ON payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1
        FROM students s
        JOIN parents p ON p.id = s.parent_id
       WHERE p.profile_id = auth.uid()
         AND s.id = payments.student_id
    )
  );

CREATE POLICY "payments_student" ON payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM students WHERE profile_id = auth.uid() AND id = payments.student_id
    )
  );


-- ============================================================
-- 13. fees
-- Admins: full access
-- Authenticated users: read fees (needed for payment flow)
-- ============================================================
ALTER TABLE fees ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "fees_admin"     ON fees;
DROP POLICY IF EXISTS "fees_auth_read" ON fees;

CREATE POLICY "fees_admin" ON fees FOR ALL
  USING (
    ( (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' )
  );

CREATE POLICY "fees_auth_read" ON fees FOR SELECT
  USING (auth.uid() IS NOT NULL);


-- ============================================================
-- 14. teacher_clockin
-- Admins: read all
-- Teachers: read/write their own records
-- ============================================================
ALTER TABLE teacher_clockin ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "clockin_admin"         ON teacher_clockin;
DROP POLICY IF EXISTS "clockin_teacher_read"  ON teacher_clockin;
DROP POLICY IF EXISTS "clockin_teacher_write" ON teacher_clockin;

CREATE POLICY "clockin_admin" ON teacher_clockin FOR ALL
  USING (
    ( (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' )
  );

CREATE POLICY "clockin_teacher_read" ON teacher_clockin FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM teachers WHERE profile_id = auth.uid() AND id = teacher_clockin.teacher_id)
  );

CREATE POLICY "clockin_teacher_write" ON teacher_clockin FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM teachers WHERE profile_id = auth.uid() AND id = teacher_clockin.teacher_id)
  );

CREATE POLICY "clockin_teacher_update" ON teacher_clockin FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM teachers WHERE profile_id = auth.uid() AND id = teacher_clockin.teacher_id)
  );


-- ============================================================
-- 15. announcements
-- Admins: full access
-- Authenticated users: read all announcements
-- ============================================================
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "announcements_admin"     ON announcements;
DROP POLICY IF EXISTS "announcements_auth_read" ON announcements;

CREATE POLICY "announcements_admin" ON announcements FOR ALL
  USING (
    ( (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' )
  );

CREATE POLICY "announcements_auth_read" ON announcements FOR SELECT
  USING (auth.uid() IS NOT NULL);


-- ============================================================
-- 16. admissions
-- Admins: full access
-- Public: can INSERT (application form on public site)
-- ============================================================
ALTER TABLE admissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admissions_admin"        ON admissions;
DROP POLICY IF EXISTS "admissions_public_apply" ON admissions;

CREATE POLICY "admissions_admin" ON admissions FOR ALL
  USING (
    ( (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' )
  );

-- Allow anyone (even unauthenticated) to submit an application
CREATE POLICY "admissions_public_apply" ON admissions FOR INSERT
  WITH CHECK (TRUE);


-- ============================================================
-- 17. classes
-- Admins: full access
-- Authenticated users: read
-- ============================================================
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "classes_admin"     ON classes;
DROP POLICY IF EXISTS "classes_auth_read" ON classes;

CREATE POLICY "classes_admin" ON classes FOR ALL
  USING (
    ( (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' )
  );

CREATE POLICY "classes_auth_read" ON classes FOR SELECT
  USING (auth.uid() IS NOT NULL);


-- ============================================================
-- 18. attendance_audit_log  (already has RLS from migration)
-- 19. payment_audit_log     (already has RLS from migration)
-- No changes needed.
-- ============================================================

-- Done. All 17 application tables now have RLS enabled
-- with role-appropriate policies.
