
-- =========================================================
-- SLICE 2: Core Academic Schema
-- =========================================================

-- Helper: updated_at trigger reuses public.set_updated_at()

-- ---------- TEACHERS ----------
create table public.teachers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  employee_no text unique not null,
  department text,
  hire_date date,
  status text not null default 'active' check (status in ('active','inactive','suspended','terminated')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_teachers_profile on public.teachers(profile_id);
create index idx_teachers_status on public.teachers(status);
create index idx_teachers_created_at on public.teachers(created_at desc);

-- ---------- CLASSES ----------
create table public.classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  grade_level text not null,
  stream text,
  academic_year text not null,
  homeroom_teacher_id uuid references public.teachers(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (name, academic_year)
);
create index idx_classes_year on public.classes(academic_year);
create index idx_classes_homeroom on public.classes(homeroom_teacher_id);
create index idx_classes_created_at on public.classes(created_at desc);

-- ---------- STUDENTS ----------
create table public.students (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique references public.profiles(id) on delete set null,
  admission_no text unique not null,
  current_class_id uuid references public.classes(id) on delete set null,
  guardian_name text,
  guardian_phone text,
  date_of_birth date,
  gender text check (gender in ('male','female','other')),
  status text not null default 'active' check (status in ('active','graduated','withdrawn','suspended')),
  enrollment_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_students_profile on public.students(profile_id);
create index idx_students_class on public.students(current_class_id);
create index idx_students_status on public.students(status);
create index idx_students_created_at on public.students(created_at desc);

-- ---------- SUBJECTS ----------
create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_subjects_code on public.subjects(code);

-- ---------- CLASS_SUBJECTS (link with teacher assignment) ----------
create table public.class_subjects (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  teacher_id uuid references public.teachers(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (class_id, subject_id)
);
create index idx_class_subjects_class on public.class_subjects(class_id);
create index idx_class_subjects_subject on public.class_subjects(subject_id);
create index idx_class_subjects_teacher on public.class_subjects(teacher_id);

-- ---------- ENROLLMENTS ----------
create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  academic_year text not null,
  status text not null default 'active' check (status in ('active','completed','withdrawn','transferred')),
  enrolled_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, class_id, academic_year)
);
create index idx_enrollments_student on public.enrollments(student_id);
create index idx_enrollments_class on public.enrollments(class_id);
create index idx_enrollments_year on public.enrollments(academic_year);
create index idx_enrollments_status on public.enrollments(status);

-- ---------- TIMETABLE ENTRIES ----------
create table public.timetable_entries (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  teacher_id uuid references public.teachers(id) on delete set null,
  day_of_week smallint not null check (day_of_week between 1 and 7),
  period smallint not null check (period >= 1),
  start_time time not null,
  end_time time not null,
  room text,
  academic_year text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (class_id, day_of_week, period, academic_year),
  check (end_time > start_time)
);
create index idx_timetable_class on public.timetable_entries(class_id);
create index idx_timetable_teacher on public.timetable_entries(teacher_id);
create index idx_timetable_day on public.timetable_entries(day_of_week);

-- ---------- PARENT STUDENT LINKS ----------
create table public.parent_student_links (
  id uuid primary key default gen_random_uuid(),
  parent_profile_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  relationship text not null default 'parent' check (relationship in ('parent','guardian','other')),
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  unique (parent_profile_id, student_id)
);
create index idx_psl_parent on public.parent_student_links(parent_profile_id);
create index idx_psl_student on public.parent_student_links(student_id);

-- ---------- TRIGGERS for updated_at ----------
create trigger trg_teachers_updated before update on public.teachers
  for each row execute function public.set_updated_at();
create trigger trg_classes_updated before update on public.classes
  for each row execute function public.set_updated_at();
create trigger trg_students_updated before update on public.students
  for each row execute function public.set_updated_at();
create trigger trg_subjects_updated before update on public.subjects
  for each row execute function public.set_updated_at();
create trigger trg_class_subjects_updated before update on public.class_subjects
  for each row execute function public.set_updated_at();
create trigger trg_enrollments_updated before update on public.enrollments
  for each row execute function public.set_updated_at();
create trigger trg_timetable_updated before update on public.timetable_entries
  for each row execute function public.set_updated_at();

-- ---------- HELPER security definer functions ----------

-- Resolve current user's teacher.id
create or replace function public.current_teacher_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.teachers where profile_id = auth.uid() limit 1;
$$;

-- Resolve current user's student.id
create or replace function public.current_student_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.students where profile_id = auth.uid() limit 1;
$$;

-- Does current teacher teach this class? (homeroom OR class_subjects OR timetable)
create or replace function public.teacher_teaches_class(_class_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.teachers t
    where t.profile_id = auth.uid()
      and (
        exists (select 1 from public.classes c where c.id = _class_id and c.homeroom_teacher_id = t.id)
        or exists (select 1 from public.class_subjects cs where cs.class_id = _class_id and cs.teacher_id = t.id)
        or exists (select 1 from public.timetable_entries te where te.class_id = _class_id and te.teacher_id = t.id)
      )
  );
$$;

-- Is _student_id a child of current parent?
create or replace function public.is_parent_of_student(_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.parent_student_links
    where parent_profile_id = auth.uid() and student_id = _student_id
  );
$$;

-- =========================================================
-- ENABLE RLS
-- =========================================================
alter table public.teachers enable row level security;
alter table public.classes enable row level security;
alter table public.students enable row level security;
alter table public.subjects enable row level security;
alter table public.class_subjects enable row level security;
alter table public.enrollments enable row level security;
alter table public.timetable_entries enable row level security;
alter table public.parent_student_links enable row level security;

-- =========================================================
-- POLICIES
-- =========================================================

-- ---------- TEACHERS ----------
create policy "Admins manage teachers" on public.teachers
  for all to authenticated
  using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));

create policy "Teacher reads own record" on public.teachers
  for select to authenticated
  using (profile_id = auth.uid());

create policy "All authenticated can view teacher directory" on public.teachers
  for select to authenticated
  using (true);

-- ---------- CLASSES ----------
create policy "Admins manage classes" on public.classes
  for all to authenticated
  using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));

create policy "Teachers view classes they teach" on public.classes
  for select to authenticated
  using (public.teacher_teaches_class(id));

create policy "Students view their enrolled classes" on public.classes
  for select to authenticated
  using (
    exists (select 1 from public.enrollments e
            where e.class_id = classes.id
              and e.student_id = public.current_student_id())
  );

create policy "Parents view their children's classes" on public.classes
  for select to authenticated
  using (
    exists (select 1 from public.enrollments e
            join public.parent_student_links psl on psl.student_id = e.student_id
            where e.class_id = classes.id
              and psl.parent_profile_id = auth.uid())
  );

-- ---------- STUDENTS ----------
create policy "Admins manage students" on public.students
  for all to authenticated
  using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));

create policy "Student reads own record" on public.students
  for select to authenticated
  using (profile_id = auth.uid());

create policy "Teachers view students in their classes" on public.students
  for select to authenticated
  using (
    exists (select 1 from public.enrollments e
            where e.student_id = students.id
              and public.teacher_teaches_class(e.class_id))
  );

create policy "Parents view their linked students" on public.students
  for select to authenticated
  using (public.is_parent_of_student(id));

-- ---------- SUBJECTS ----------
create policy "Admins manage subjects" on public.subjects
  for all to authenticated
  using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));

create policy "All authenticated read subjects" on public.subjects
  for select to authenticated
  using (true);

-- ---------- CLASS_SUBJECTS ----------
create policy "Admins manage class_subjects" on public.class_subjects
  for all to authenticated
  using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));

create policy "Teachers view their class_subjects" on public.class_subjects
  for select to authenticated
  using (teacher_id = public.current_teacher_id() or public.teacher_teaches_class(class_id));

create policy "Students view class_subjects of their class" on public.class_subjects
  for select to authenticated
  using (
    exists (select 1 from public.enrollments e
            where e.class_id = class_subjects.class_id
              and e.student_id = public.current_student_id())
  );

create policy "Parents view class_subjects of children's class" on public.class_subjects
  for select to authenticated
  using (
    exists (select 1 from public.enrollments e
            join public.parent_student_links psl on psl.student_id = e.student_id
            where e.class_id = class_subjects.class_id
              and psl.parent_profile_id = auth.uid())
  );

-- ---------- ENROLLMENTS ----------
create policy "Admins manage enrollments" on public.enrollments
  for all to authenticated
  using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));

create policy "Student reads own enrollments" on public.enrollments
  for select to authenticated
  using (student_id = public.current_student_id());

create policy "Teacher reads enrollments of taught classes" on public.enrollments
  for select to authenticated
  using (public.teacher_teaches_class(class_id));

create policy "Parent reads child enrollments" on public.enrollments
  for select to authenticated
  using (public.is_parent_of_student(student_id));

-- ---------- TIMETABLE ----------
create policy "Admins manage timetable" on public.timetable_entries
  for all to authenticated
  using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));

create policy "Teacher reads own timetable" on public.timetable_entries
  for select to authenticated
  using (teacher_id = public.current_teacher_id() or public.teacher_teaches_class(class_id));

create policy "Student reads class timetable" on public.timetable_entries
  for select to authenticated
  using (
    exists (select 1 from public.enrollments e
            where e.class_id = timetable_entries.class_id
              and e.student_id = public.current_student_id())
  );

create policy "Parent reads child class timetable" on public.timetable_entries
  for select to authenticated
  using (
    exists (select 1 from public.enrollments e
            join public.parent_student_links psl on psl.student_id = e.student_id
            where e.class_id = timetable_entries.class_id
              and psl.parent_profile_id = auth.uid())
  );

-- ---------- PARENT_STUDENT_LINKS ----------
create policy "Admins manage parent links" on public.parent_student_links
  for all to authenticated
  using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));

create policy "Parent reads own links" on public.parent_student_links
  for select to authenticated
  using (parent_profile_id = auth.uid());

create policy "Student reads own parent links" on public.parent_student_links
  for select to authenticated
  using (student_id = public.current_student_id());
