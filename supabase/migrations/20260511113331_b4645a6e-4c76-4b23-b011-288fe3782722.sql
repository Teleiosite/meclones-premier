
-- =========================================================
-- HARDEN: revoke direct execute on internal helpers
-- (still callable internally by RLS; not exposed to API)
-- =========================================================
revoke execute on function public.current_teacher_id() from public, anon, authenticated;
revoke execute on function public.current_student_id() from public, anon, authenticated;
revoke execute on function public.teacher_teaches_class(uuid) from public, anon, authenticated;
revoke execute on function public.is_parent_of_student(uuid) from public, anon, authenticated;

-- =========================================================
-- SLICE 3: Attendance
-- =========================================================

-- ---------- ATTENDANCE POLICY (single row id=1) ----------
create table public.attendance_policy (
  id smallint primary key default 1 check (id = 1),
  earliest_sign_in time not null default '07:00',
  punctuality_limit time not null default '09:00',
  grace_threshold_mins int not null default 15,
  absence_trigger time not null default '11:00',
  half_day_boundary time not null default '13:00',
  window_authorization time not null default '16:00',
  standard_shift_end time not null default '18:00',
  updated_at timestamptz not null default now()
);
insert into public.attendance_policy (id) values (1);

-- ---------- TEACHER ATTENDANCE LOGS ----------
create table public.attendance_logs (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.teachers(id) on delete cascade,
  log_date date not null default current_date,
  clock_in_at timestamptz,
  clock_out_at timestamptz,
  source_ip text,
  device_id text,
  user_agent text,
  outcome text not null default 'verified' check (outcome in ('verified','failed','review')),
  validation text not null default 'pass' check (validation in ('pass','review','blocked')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (teacher_id, log_date)
);
create index idx_attendance_teacher on public.attendance_logs(teacher_id);
create index idx_attendance_date on public.attendance_logs(log_date desc);
create index idx_attendance_created_at on public.attendance_logs(created_at desc);
create index idx_attendance_outcome on public.attendance_logs(outcome);

create trigger trg_attendance_updated before update on public.attendance_logs
  for each row execute function public.set_updated_at();

-- ---------- ATTENDANCE ANOMALIES ----------
create table public.attendance_anomalies (
  id uuid primary key default gen_random_uuid(),
  attendance_log_id uuid references public.attendance_logs(id) on delete cascade,
  teacher_id uuid not null references public.teachers(id) on delete cascade,
  anomaly_type text not null check (anomaly_type in ('late','missing_clock_out','ip_mismatch','duplicate','out_of_window','other')),
  severity text not null default 'low' check (severity in ('low','medium','high')),
  details jsonb,
  resolved boolean not null default false,
  resolved_by uuid references public.profiles(id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);
create index idx_anomaly_teacher on public.attendance_anomalies(teacher_id);
create index idx_anomaly_log on public.attendance_anomalies(attendance_log_id);
create index idx_anomaly_resolved on public.attendance_anomalies(resolved);
create index idx_anomaly_created_at on public.attendance_anomalies(created_at desc);

-- ---------- STUDENT ATTENDANCE ----------
create table public.student_attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  log_date date not null default current_date,
  status text not null default 'present' check (status in ('present','absent','late','excused')),
  recorded_by_teacher_id uuid references public.teachers(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, log_date)
);
create index idx_sa_student on public.student_attendance(student_id);
create index idx_sa_class on public.student_attendance(class_id);
create index idx_sa_date on public.student_attendance(log_date desc);
create index idx_sa_status on public.student_attendance(status);

create trigger trg_sa_updated before update on public.student_attendance
  for each row execute function public.set_updated_at();

-- ---------- ENABLE RLS ----------
alter table public.attendance_policy enable row level security;
alter table public.attendance_logs enable row level security;
alter table public.attendance_anomalies enable row level security;
alter table public.student_attendance enable row level security;

-- =========================================================
-- POLICIES
-- =========================================================

-- ---------- attendance_policy ----------
create policy "All authenticated read policy" on public.attendance_policy
  for select to authenticated using (true);
create policy "Admins update policy" on public.attendance_policy
  for update to authenticated
  using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));

-- ---------- attendance_logs ----------
create policy "Admins manage attendance" on public.attendance_logs
  for all to authenticated
  using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));

create policy "Teacher reads own attendance" on public.attendance_logs
  for select to authenticated
  using (teacher_id = public.current_teacher_id());

create policy "Teacher inserts own attendance" on public.attendance_logs
  for insert to authenticated
  with check (teacher_id = public.current_teacher_id());

create policy "Teacher updates own attendance same day" on public.attendance_logs
  for update to authenticated
  using (teacher_id = public.current_teacher_id() and log_date = current_date)
  with check (teacher_id = public.current_teacher_id() and log_date = current_date);

-- ---------- attendance_anomalies ----------
create policy "Admins manage anomalies" on public.attendance_anomalies
  for all to authenticated
  using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));

create policy "Teacher reads own anomalies" on public.attendance_anomalies
  for select to authenticated
  using (teacher_id = public.current_teacher_id());

-- ---------- student_attendance ----------
create policy "Admins manage student attendance" on public.student_attendance
  for all to authenticated
  using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));

create policy "Teachers record student attendance for taught classes" on public.student_attendance
  for insert to authenticated
  with check (public.teacher_teaches_class(class_id));

create policy "Teachers update student attendance for taught classes" on public.student_attendance
  for update to authenticated
  using (public.teacher_teaches_class(class_id))
  with check (public.teacher_teaches_class(class_id));

create policy "Teachers view student attendance for taught classes" on public.student_attendance
  for select to authenticated
  using (public.teacher_teaches_class(class_id));

create policy "Student reads own attendance" on public.student_attendance
  for select to authenticated
  using (student_id = public.current_student_id());

create policy "Parent reads child attendance" on public.student_attendance
  for select to authenticated
  using (public.is_parent_of_student(student_id));
