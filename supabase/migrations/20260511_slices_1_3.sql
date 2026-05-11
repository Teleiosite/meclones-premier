-- Canonical migration for backend slices 1-3
create extension if not exists pgcrypto;

-- roles
create type if not exists public.app_role as enum ('admin','teacher','student','parent');

-- profiles + user_roles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
as $$
  select exists (select 1 from public.user_roles ur where ur.user_id = _user_id and ur.role = _role)
$$;

grant execute on function public.has_role(uuid, public.app_role) to authenticated;

-- Slice 2
create table if not exists public.teachers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique not null references public.profiles(id) on delete cascade,
  employee_no text unique not null,
  department text,
  hire_date date,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  grade_level text not null,
  stream text,
  academic_year text not null,
  homeroom_teacher_id uuid references public.teachers(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (name, academic_year)
);
create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique references public.profiles(id),
  admission_no text unique not null,
  current_class_id uuid references public.classes(id),
  guardian_name text,
  dob date,
  gender text,
  status text not null default 'active',
  enrollment_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.class_subjects (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  teacher_id uuid not null references public.teachers(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (class_id, subject_id)
);
create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  academic_year text not null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, class_id, academic_year)
);
create table if not exists public.timetable_entries (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  subject_id uuid not null references public.subjects(id),
  teacher_id uuid not null references public.teachers(id),
  day_of_week int not null check (day_of_week between 1 and 7),
  period int not null,
  start_time time not null,
  end_time time not null,
  room text,
  academic_year text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (class_id, day_of_week, period, academic_year)
);
create table if not exists public.parent_student_links (
  id uuid primary key default gen_random_uuid(),
  parent_profile_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  relationship text not null,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (parent_profile_id, student_id)
);

-- Slice 3
create table if not exists public.attendance_policy (
  id int primary key default 1,
  earliest_sign_in time not null default '07:00',
  punctuality_limit time not null default '09:00',
  grace_threshold_mins int not null default 15,
  absence_trigger time not null default '11:00',
  half_day_boundary time not null default '13:00',
  window_authorization time not null default '16:00',
  standard_shift_end time not null default '18:00',
  updated_at timestamptz not null default now(),
  constraint one_policy_row check (id = 1)
);
insert into public.attendance_policy (id) values (1) on conflict (id) do nothing;

create table if not exists public.attendance_logs (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.teachers(id),
  log_date date not null default current_date,
  clock_in_at timestamptz,
  clock_out_at timestamptz,
  source_ip text,
  device_id text,
  user_agent text,
  outcome text not null default 'verified',
  validation text not null default 'pass',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (teacher_id, log_date)
);

create table if not exists public.attendance_anomalies (
  id uuid primary key default gen_random_uuid(),
  attendance_log_id uuid references public.attendance_logs(id) on delete cascade,
  teacher_id uuid not null references public.teachers(id),
  anomaly_type text not null,
  severity text not null,
  details jsonb,
  resolved boolean not null default false,
  resolved_by uuid references public.profiles(id),
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.student_attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  log_date date not null,
  status text not null,
  recorded_by_teacher_id uuid references public.teachers(id),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, log_date)
);

-- Basic indexes
create index if not exists idx_students_created_at on public.students (created_at desc);
create index if not exists idx_enrollments_student on public.enrollments (student_id);
create index if not exists idx_timetable_class_day on public.timetable_entries (class_id, day_of_week);
create index if not exists idx_attendance_logs_teacher_date on public.attendance_logs (teacher_id, log_date desc);
create index if not exists idx_attendance_anomalies_resolved_created on public.attendance_anomalies (resolved, created_at desc);
create index if not exists idx_student_attendance_class_date on public.student_attendance (class_id, log_date desc);
