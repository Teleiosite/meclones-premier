# Backend Slices — Implementation Reference

This doc accompanies the migrations in `supabase/migrations/`. It documents the schema, RLS, indexes, seed data, REST examples, FE integration checklist and risk notes for slices 1–3.

All tables enforce **Row Level Security**. Access is granted only via the policies described below.

---

## Slice 1 — Auth, Profiles, Roles (validated, already shipped)

### Tables
- `public.profiles` — one row per `auth.users` (id, full_name, phone, avatar_url, timestamps)
- `public.user_roles` — (user_id, role) where role ∈ `admin | teacher | student | parent`

### Trigger
- `handle_new_user()` on `auth.users` insert → creates a `profiles` row using `raw_user_meta_data`.

### Helpers
- `has_role(_user_id uuid, _role app_role) returns boolean` — SECURITY DEFINER. Used in every admin policy. **Safe to expose** to authenticated (intentional).

### Policy matrix

| Table | admin | teacher/student/parent | self |
|---|---|---|---|
| profiles | read all, update all | — | read own, update own |
| user_roles | full CRUD | — | read own |

### REST examples
```http
GET /rest/v1/profiles?id=eq.<uid>            # read own profile
GET /rest/v1/user_roles?user_id=eq.<uid>     # read own role(s)
POST /rest/v1/user_roles                      # admin only
{ "user_id": "<uid>", "role": "teacher" }
```

### Test queries (run as each role JWT)
```sql
-- student:
select * from profiles where id = auth.uid();   -- 1 row
select * from user_roles;                       -- only own roles
-- admin:
select count(*) from profiles;                  -- all
insert into user_roles(user_id, role) values ('<uid>', 'teacher');
```

---

## Slice 2 — Core Academic Schema

### Tables (all with `created_at`, `updated_at`, RLS on)
| Table | Purpose | Key fields |
|---|---|---|
| `teachers` | Staff records | `profile_id` (unique), `employee_no` (unique), `department`, `hire_date`, `status` |
| `classes` | Class/section per academic year | `name`, `grade_level`, `stream`, `academic_year`, `homeroom_teacher_id`; **unique(name, academic_year)** |
| `students` | Pupil records | `profile_id` (nullable), `admission_no` (unique), `current_class_id`, `guardian_*`, `dob`, `gender`, `status`, `enrollment_date` |
| `subjects` | Subject catalog | `code` (unique), `name` |
| `class_subjects` | Subjects taught in a class | `class_id`, `subject_id`, `teacher_id`; **unique(class_id, subject_id)** |
| `enrollments` | Student in class per year | `student_id`, `class_id`, `academic_year`, `status`; **unique(student_id, class_id, academic_year)** |
| `timetable_entries` | Weekly schedule | `class_id`, `subject_id`, `teacher_id`, `day_of_week (1–7)`, `period`, `start_time`, `end_time`, `room`, `academic_year`; **unique(class_id, day_of_week, period, academic_year)** |
| `parent_student_links` | Parent ↔ child mapping | `parent_profile_id`, `student_id`, `relationship`, `is_primary`; **unique(parent_profile_id, student_id)** |

### Indexes (and why)
- `*_created_at desc` — list views sorted by recency.
- FKs (`profile_id`, `class_id`, `student_id`, `teacher_id`, `subject_id`) — join performance for RLS predicates.
- `status`, `academic_year`, `day_of_week` — common filters on dashboards.

### Helper functions (internal — `EXECUTE` revoked from `anon`/`authenticated`)
- `current_teacher_id()` — returns the caller's `teachers.id`.
- `current_student_id()` — returns the caller's `students.id`.
- `teacher_teaches_class(_class_id uuid)` — true if caller is homeroom, teaches a subject in the class, or has a timetable entry.
- `is_parent_of_student(_student_id uuid)` — true if caller has a `parent_student_links` row.

### RLS matrix

| Table | admin | teacher | student | parent |
|---|---|---|---|---|
| teachers | full | read directory + own | read directory | read directory |
| classes | full | read taught classes | read enrolled class | read child's class |
| students | full | read students in taught classes | read own | read linked children |
| subjects | full | read all | read all | read all |
| class_subjects | full | read where teacher / taught | read own class | read child's class |
| enrollments | full | read for taught classes | read own | read child's |
| timetable_entries | full | read own + taught | read class | read child's class |
| parent_student_links | full | — | read own | read own |

> Writes on academic tables are **admin-only**. Students/teachers/parents are read-only by design (registry data).

### Seed (dev)
Run as the service role (or in SQL editor):
```sql
-- 1. After creating auth users via signup, grant roles
insert into user_roles (user_id, role) values
  ('<admin_uid>',   'admin'),
  ('<teacher_uid>', 'teacher'),
  ('<student_uid>', 'student'),
  ('<parent_uid>',  'parent');

-- 2. Subjects
insert into subjects (code, name) values
  ('MATH','Mathematics'),
  ('ENG','English'),
  ('SCI','Science');

-- 3. Teacher
insert into teachers (profile_id, employee_no, department, hire_date)
values ('<teacher_uid>', 'EMP-001', 'Sciences', '2023-09-01');

-- 4. Class
insert into classes (name, grade_level, stream, academic_year, homeroom_teacher_id)
values ('JSS1-A', 'JSS1', 'A', '2025/2026',
        (select id from teachers where employee_no = 'EMP-001'));

-- 5. Class subjects
insert into class_subjects (class_id, subject_id, teacher_id)
select c.id, s.id, t.id
from classes c, subjects s, teachers t
where c.name='JSS1-A' and s.code='MATH' and t.employee_no='EMP-001';

-- 6. Student + enrollment + parent link
insert into students (profile_id, admission_no, current_class_id, guardian_name)
values ('<student_uid>', 'ADM-0001',
        (select id from classes where name='JSS1-A'), 'Mr. Doe');

insert into enrollments (student_id, class_id, academic_year)
select s.id, c.id, '2025/2026'
from students s, classes c
where s.admission_no='ADM-0001' and c.name='JSS1-A';

insert into parent_student_links (parent_profile_id, student_id, relationship, is_primary)
select '<parent_uid>', id, 'parent', true
from students where admission_no='ADM-0001';

-- 7. Timetable
insert into timetable_entries (class_id, subject_id, teacher_id, day_of_week, period, start_time, end_time, room, academic_year)
select c.id, s.id, t.id, 1, 1, '08:00', '08:45', 'Room 1', '2025/2026'
from classes c, subjects s, teachers t
where c.name='JSS1-A' and s.code='MATH' and t.employee_no='EMP-001';
```

### REST examples (PostgREST)
```http
# List students in my taught classes (teacher JWT)
GET /rest/v1/students?select=id,admission_no,profile_id,current_class_id&order=created_at.desc&limit=50

# My timetable (student JWT)
GET /rest/v1/timetable_entries?select=*,subjects(name,code),teachers(profile_id),classes(name)&order=day_of_week.asc,period.asc

# Admin: create class
POST /rest/v1/classes
{ "name":"JSS2-B","grade_level":"JSS2","stream":"B","academic_year":"2025/2026" }
```
Sample response:
```json
[{ "id":"...", "name":"JSS2-B", "grade_level":"JSS2", "academic_year":"2025/2026", "created_at":"..." }]
```

### FE integration checklist
| Page | Tables to query |
|---|---|
| Admin → Students | `students` (+ join `classes`, `profiles`) |
| Admin → Teachers | `teachers` (+ join `profiles`) |
| Admin → Academics | `classes`, `subjects`, `class_subjects` |
| Admin → Timetable | `timetable_entries` |
| Teacher → Classes | `classes` (RLS auto-filters), `class_subjects` |
| Teacher → Students | `students` via `enrollments` |
| Teacher → Timetable | `timetable_entries` (RLS auto-filters) |
| Student → Courses / Timetable | `class_subjects`, `timetable_entries` |
| Parent → Children | `parent_student_links` → `students` |
| Parent → child → Reports | `enrollments`, `timetable_entries` |

---

## Slice 3 — Attendance + Clock-in/out

### Tables
| Table | Purpose | Key fields |
|---|---|---|
| `attendance_policy` | Single school-wide policy (id=1) | `earliest_sign_in`, `punctuality_limit`, `grace_threshold_mins`, `absence_trigger`, `half_day_boundary`, `window_authorization`, `standard_shift_end` |
| `attendance_logs` | Teacher daily clock-in/out | `teacher_id`, `log_date`, `clock_in_at`, `clock_out_at`, `source_ip`, `device_id`, `user_agent`, `outcome`, `validation`, `notes`; **unique(teacher_id, log_date)** |
| `attendance_anomalies` | Flagged events | `attendance_log_id`, `teacher_id`, `anomaly_type`, `severity`, `details jsonb`, `resolved`, `resolved_by`, `resolved_at` |
| `student_attendance` | Per-student daily status | `student_id`, `class_id`, `log_date`, `status`, `recorded_by_teacher_id`, `notes`; **unique(student_id, log_date)** |

### Indexes (and why)
- `(teacher_id)`, `(log_date desc)`, `(outcome)` on logs — admin surveillance queries with date/teacher filters.
- `(resolved)` + `(created_at desc)` on anomalies — dashboard "open anomalies" lists.
- `(student_id)`, `(class_id)`, `(log_date desc)`, `(status)` on student_attendance — student/parent rollups + class roster views.

### RLS matrix

| Table | admin | teacher | student | parent |
|---|---|---|---|---|
| attendance_policy | read + update | read | read | read |
| attendance_logs | full | insert/read/update OWN (update only same day) | — | — |
| attendance_anomalies | full | read own | — | — |
| student_attendance | full | insert/update/read for taught classes | read own | read child's |

### REST examples

**Teacher clock-in** (`POST`)
```http
POST /rest/v1/attendance_logs
Authorization: Bearer <teacher_jwt>
Prefer: return=representation
Content-Type: application/json

{
  "teacher_id": "<teachers.id>",
  "log_date": "2026-05-11",
  "clock_in_at": "2026-05-11T07:42:00Z",
  "source_ip": "102.89.xx.xx",
  "device_id": "web-abc",
  "user_agent": "Mozilla/5.0 ..."
}
```
Response:
```json
[{ "id":"...", "teacher_id":"...", "log_date":"2026-05-11", "clock_in_at":"2026-05-11T07:42:00Z", "outcome":"verified", "validation":"pass", "created_at":"..." }]
```

**Teacher clock-out** (`PATCH` same row)
```http
PATCH /rest/v1/attendance_logs?teacher_id=eq.<id>&log_date=eq.2026-05-11
{ "clock_out_at": "2026-05-11T16:05:00Z" }
```

**Teacher attendance history**
```http
GET /rest/v1/attendance_logs?teacher_id=eq.<id>&order=log_date.desc&limit=30
```

**Admin surveillance (paginated)**
```http
GET /rest/v1/attendance_logs?select=*,teachers(employee_no,profiles(full_name))&order=log_date.desc&limit=50&offset=0
```

**Admin anomaly list**
```http
GET /rest/v1/attendance_anomalies?resolved=is.false&order=created_at.desc&limit=50
```

**Admin policy update**
```http
PATCH /rest/v1/attendance_policy?id=eq.1
{ "punctuality_limit":"09:15", "grace_threshold_mins":10 }
```

**Teacher records student attendance**
```http
POST /rest/v1/student_attendance
{ "student_id":"...", "class_id":"...", "log_date":"2026-05-11", "status":"present", "recorded_by_teacher_id":"..." }
```

### FE integration checklist
| Page | Tables |
|---|---|
| Teacher → Clockin-Clockout | `attendance_logs` (insert + patch own); `attendance_policy` (read window banner) |
| Teacher → Attendance | `student_attendance`, `enrollments` |
| Admin → Attendance / Surveillance | `attendance_logs` (join teachers/profiles) |
| Admin → Attendance / Anomalies | `attendance_anomalies` |
| Admin → Attendance / Policy | `attendance_policy` |
| Student → Attendance | `student_attendance` (RLS = own only) |
| Parent → Attendance | `student_attendance` (filter by linked student id) |

---

## Risk checks (across slices)

**Security**
- All tables RLS-on. Helper functions `current_*`, `teacher_teaches_class`, `is_parent_of_student` have `EXECUTE` revoked from `anon`/`authenticated` — they remain callable inside RLS predicates (definer rights).
- `has_role` is intentionally exposed (standard Supabase pattern).
- Parent access only flows via `parent_student_links`, which is admin-managed.
- Teachers cannot edit other teachers' attendance; cannot edit their own past-day rows.

**Performance**
- Hot lists (`attendance_logs`, `student_attendance`, `enrollments`) are indexed on date + FK. Always paginate (`limit` ≤ 50).
- RLS predicates that walk multiple tables (e.g., student/parent reads on `classes`) are bounded by indexed FK lookups.
- For very large schools, consider a materialized "teacher_class_assignments" cache later — not needed at MVP scale.

**Cost**
- No realtime subscriptions enabled by default. Add only on `attendance_logs` if the surveillance dashboard needs live updates — note: realtime is the most expensive cloud item.
- All payloads filtered + paginated to stay inside the $25/mo Cloud free balance.
- Avoid `select=*,table(*)` deep joins on list endpoints; prefer `select=col1,col2,fk(name)`.

## Rollback notes

Reverse-order DROPs (run in SQL editor if needed):
```sql
-- Slice 3
drop table if exists public.student_attendance, public.attendance_anomalies,
                     public.attendance_logs, public.attendance_policy cascade;

-- Slice 2
drop table if exists public.parent_student_links, public.timetable_entries,
                     public.enrollments, public.class_subjects, public.subjects,
                     public.students, public.classes, public.teachers cascade;
drop function if exists public.current_teacher_id, public.current_student_id,
                        public.teacher_teaches_class(uuid), public.is_parent_of_student(uuid);
```
