-- Core profile table extending auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null check (role in ('admin','teacher','student','parent')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Admissions submitted from the public form
create table if not exists public.admissions (
  id uuid primary key default gen_random_uuid(),
  parent_name text not null,
  phone text not null,
  email text not null,
  child_name text not null,
  class_applying_for text not null,
  notes text,
  status text not null default 'submitted' check (status in ('submitted','reviewing','accepted','rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Teacher clock-in / clock-out history
create table if not exists public.attendance_logs (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  log_date date not null default current_date,
  clock_in_at timestamptz,
  clock_out_at timestamptz,
  source_ip text,
  outcome text not null default 'verified' check (outcome in ('verified','failed','review')),
  validation text not null default 'pass' check (validation in ('pass','review','blocked')),
  created_at timestamptz not null default now()
);

-- Optional policy storage for admin attendance policy tab
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

insert into public.attendance_policy (id)
values (1)
on conflict (id) do nothing;

-- RLS
alter table public.profiles enable row level security;
alter table public.admissions enable row level security;
alter table public.attendance_logs enable row level security;
alter table public.attendance_policy enable row level security;

-- Profiles policies
create policy if not exists "profiles read own"
on public.profiles
for select
using (auth.uid() = id);

create policy if not exists "admin read profiles"
on public.profiles
for select
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Admissions policies
create policy if not exists "public can insert admissions"
on public.admissions
for insert
to anon, authenticated
with check (true);

create policy if not exists "admin read admissions"
on public.admissions
for select
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy if not exists "admin update admissions"
on public.admissions
for update
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Attendance policies
create policy if not exists "teacher manage own attendance"
on public.attendance_logs
for all
using (teacher_id = auth.uid())
with check (teacher_id = auth.uid());

create policy if not exists "admin read attendance"
on public.attendance_logs
for select
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Policy table policies
create policy if not exists "admin read policy"
on public.attendance_policy
for select
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy if not exists "admin update policy"
on public.attendance_policy
for update
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
