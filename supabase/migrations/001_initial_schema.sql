create extension if not exists pgcrypto;

create type public.academic_level as enum (
  'high_school',
  'undergraduate',
  'postgraduate',
  'competitive_exam',
  'other'
);

create type public.focus_session_status as enum (
  'active',
  'paused',
  'completed',
  'abandoned'
);

create type public.focus_session_type as enum (
  'assessment',
  'quick'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 80),
  study_goal text not null check (char_length(trim(study_goal)) between 1 and 160),
  academic_level public.academic_level not null default 'undergraduate',
  daily_target_minutes integer not null default 120 check (daily_target_minutes between 15 and 720),
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.protocols (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  problem_statement text check (
    problem_statement is null or char_length(trim(problem_statement)) between 1 and 500
  ),
  symptom_keys text[] not null default '{}',
  title text not null check (char_length(trim(title)) between 1 and 160),
  coach_message text not null check (char_length(trim(coach_message)) between 1 and 1000),
  steps jsonb not null,
  sprint_minutes integer not null default 25 check (sprint_minutes between 5 and 60),
  break_minutes integer not null default 5 check (break_minutes between 1 and 30),
  protocol_version text not null default 'v1' check (char_length(trim(protocol_version)) between 1 and 20),
  provider text not null default 'rule_based' check (char_length(trim(provider)) between 1 and 40),
  provider_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint protocols_steps_array check (jsonb_typeof(steps) = 'array'),
  constraint protocols_provider_metadata_object check (jsonb_typeof(provider_metadata) = 'object')
);

create unique index protocols_id_user_id_idx on public.protocols(id, user_id);

create table public.focus_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  protocol_id uuid references public.protocols(id) on delete set null,
  session_type public.focus_session_type not null,
  subject text not null check (char_length(trim(subject)) between 1 and 100),
  status public.focus_session_status not null default 'active',
  started_at timestamptz not null default now(),
  paused_at timestamptz,
  ended_at timestamptz,
  accumulated_seconds integer not null default 0 check (accumulated_seconds >= 0),
  focus_rating integer check (focus_rating between 1 and 5),
  goal_completed boolean,
  reflection_note text check (
    reflection_note is null or char_length(trim(reflection_note)) between 1 and 1000
  ),
  created_at timestamptz not null default now(),
  constraint completed_sessions_have_reflection check (
    status <> 'completed' or (focus_rating is not null and goal_completed is not null and ended_at is not null)
  ),
  constraint focus_sessions_protocol_user_fk foreign key (protocol_id, user_id)
    references public.protocols(id, user_id)
    on delete restrict
);

create index profiles_updated_at_idx on public.profiles(updated_at desc);
create index protocols_user_created_idx on public.protocols(user_id, created_at desc);
create index protocols_user_provider_version_idx on public.protocols(user_id, provider, protocol_version);
create index sessions_user_started_idx on public.focus_sessions(user_id, started_at desc);
create index sessions_user_type_started_idx on public.focus_sessions(user_id, session_type, started_at desc);
create index sessions_user_status_idx on public.focus_sessions(user_id, status);
create index sessions_user_subject_started_idx on public.focus_sessions(user_id, subject, started_at desc);

alter table public.profiles enable row level security;
alter table public.protocols enable row level security;
alter table public.focus_sessions enable row level security;

create policy "profiles are owned by user"
on public.profiles
for all
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "protocols are owned by user"
on public.protocols
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "sessions are owned by user"
on public.focus_sessions
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

-- Protocol rows are append-only. Application code must create a new row for every
-- generated protocol version instead of mutating historical protocol snapshots.
create or replace function public.prevent_protocol_updates()
returns trigger
language plpgsql
as $$
begin
  raise exception 'protocol records are immutable and cannot be updated';
end;
$$;

create trigger protocols_prevent_updates
before update on public.protocols
for each row
execute function public.prevent_protocol_updates();

create or replace function public.prevent_protocol_deletes()
returns trigger
language plpgsql
as $$
begin
  raise exception 'protocol records are immutable and cannot be deleted';
end;
$$;

create trigger protocols_prevent_deletes
before delete on public.protocols
for each row
execute function public.prevent_protocol_deletes();

create or replace function public.create_protocol_with_session(
  p_user_id uuid,
  p_problem_statement text,
  p_symptom_keys text[],
  p_title text,
  p_coach_message text,
  p_steps jsonb,
  p_sprint_minutes integer,
  p_break_minutes integer,
  p_protocol_version text,
  p_provider text,
  p_provider_metadata jsonb,
  p_subject text,
  p_session_type public.focus_session_type,
  p_started_at timestamptz default now()
)
returns table (
  protocol_id uuid,
  session_id uuid
)
language plpgsql
security invoker
as $$
declare
  v_protocol_id uuid;
  v_session_id uuid;
begin
  if auth.uid() <> p_user_id then
    raise exception 'cannot create protocol for another user';
  end if;

  insert into public.protocols (
    user_id,
    problem_statement,
    symptom_keys,
    title,
    coach_message,
    steps,
    sprint_minutes,
    break_minutes,
    protocol_version,
    provider,
    provider_metadata
  )
  values (
    p_user_id,
    p_problem_statement,
    p_symptom_keys,
    p_title,
    p_coach_message,
    p_steps,
    p_sprint_minutes,
    p_break_minutes,
    p_protocol_version,
    p_provider,
    p_provider_metadata
  )
  returning id into v_protocol_id;

  insert into public.focus_sessions (
    user_id,
    protocol_id,
    session_type,
    subject,
    status,
    started_at
  )
  values (
    p_user_id,
    v_protocol_id,
    p_session_type,
    p_subject,
    'active',
    p_started_at
  )
  returning id into v_session_id;

  return query select v_protocol_id, v_session_id;
end;
$$;
