-- CorreCRA — Desafio CRA 2026 — schema inicial
-- Etapa 2: estrutura tecnica (ver openspec/ para specs detalhadas)

create extension if not exists "pgcrypto";

-- ============ ENUMS ============

create type user_role as enum ('participant', 'organizer', 'admin');
create type participant_status as enum ('incomplete', 'awaiting_payment', 'active', 'suspended', 'closed');
create type payment_status as enum ('pending', 'confirmed', 'refunded');
create type event_status as enum ('draft', 'scheduled', 'checkin_open', 'checkin_closed', 'completed', 'cancelled');
create type checkin_method as enum ('qr_code', 'event_code', 'manual');
create type checkin_status as enum ('valid', 'pending', 'rejected');
create type point_status as enum ('pending', 'validated', 'rejected', 'cancelled', 'admin_adjustment');
create type request_status as enum ('draft', 'submitted', 'in_review', 'complement_requested', 'approved', 'partially_approved', 'rejected', 'cancelled');
create type ledger_transaction_type as enum ('checkin', 'point_request', 'manual_adjustment', 'badge');
create type draw_status as enum ('draft', 'scheduled', 'completed', 'cancelled');

-- ============ CORE TABLES ============

create table profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  full_name text not null,
  display_name text,
  avatar_url text,
  email text not null,
  phone text,
  birth_date date,
  city text,
  state text,
  shirt_size text,
  role user_role not null default 'participant',
  participant_status participant_status not null default 'incomplete',
  payment_status payment_status not null default 'pending',
  terms_accepted_at timestamptz,
  terms_version text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_profiles_role on profiles(role);
create index idx_profiles_status on profiles(participant_status);

create table challenges (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  start_date date not null,
  end_date date not null,
  award_date date,
  registration_fee numeric(10,2) not null default 0,
  status text not null default 'draft',
  ranking_frozen_at timestamptz,
  tie_break_rules jsonb not null default '["cra_registrations","cra_shirt_races","weekly_runs","monthly_trainings","achieved_at"]'::jsonb,
  created_at timestamptz not null default now()
);

create table activity_types (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references challenges(id) on delete cascade,
  name text not null,
  description text,
  default_points integer not null default 0,
  requires_approval boolean not null default false,
  proof_required boolean not null default false,
  active boolean not null default true,
  accumulation_group text,
  daily_limit integer,
  weekly_limit integer,
  monthly_limit integer,
  created_at timestamptz not null default now()
);

create table events (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references challenges(id) on delete cascade,
  activity_type_id uuid references activity_types(id),
  name text not null,
  description text,
  city text,
  location text,
  latitude numeric(9,6),
  longitude numeric(9,6),
  start_at timestamptz not null,
  end_at timestamptz,
  checkin_start_at timestamptz,
  checkin_end_at timestamptz,
  checkin_code text,
  qr_token text,
  qr_token_expires_at timestamptz,
  status event_status not null default 'draft',
  points integer not null default 0,
  is_sample boolean not null default false,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);
create index idx_events_status on events(status);
create index idx_events_challenge on events(challenge_id);

create table event_checkins (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  participant_id uuid not null references profiles(id) on delete cascade,
  checkin_method checkin_method not null,
  checked_in_at timestamptz not null default now(),
  status checkin_status not null default 'pending',
  validated_by uuid references profiles(id),
  validation_notes text,
  created_at timestamptz not null default now(),
  unique (event_id, participant_id)
);

create table external_races (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  race_date date not null,
  city text,
  distance text,
  official_url text,
  used_cra_registration boolean not null default false,
  used_cra_shirt boolean not null default false,
  notes text,
  status request_status not null default 'draft',
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table point_requests (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references profiles(id) on delete cascade,
  external_race_id uuid references external_races(id) on delete cascade,
  activity_type_id uuid not null references activity_types(id),
  requested_points integer not null default 0,
  approved_points integer,
  status request_status not null default 'submitted',
  participant_notes text,
  reviewer_notes text,
  reviewed_by uuid references profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_point_requests_status on point_requests(status);
create index idx_point_requests_participant on point_requests(participant_id);

create table attachments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  entity_type text not null,
  entity_id uuid not null,
  file_url text not null,
  file_name text not null,
  mime_type text not null,
  file_size integer not null,
  created_at timestamptz not null default now()
);
create index idx_attachments_entity on attachments(entity_type, entity_id);

-- point_ledger e a fonte oficial da pontuacao
create table point_ledger (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references challenges(id),
  participant_id uuid not null references profiles(id) on delete cascade,
  activity_type_id uuid references activity_types(id),
  event_id uuid references events(id),
  point_request_id uuid references point_requests(id),
  transaction_type ledger_transaction_type not null,
  points integer not null,
  status point_status not null default 'pending',
  description text,
  rule_snapshot jsonb,
  occurred_at timestamptz not null default now(),
  approved_at timestamptz,
  approved_by uuid references profiles(id),
  created_at timestamptz not null default now()
);
create index idx_point_ledger_participant on point_ledger(participant_id, status);
create index idx_point_ledger_challenge on point_ledger(challenge_id);

create table ranking_snapshots (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references challenges(id) on delete cascade,
  participant_id uuid not null references profiles(id) on delete cascade,
  position integer not null,
  total_points integer not null,
  tie_break_data jsonb,
  snapshot_date date not null default current_date,
  created_at timestamptz not null default now()
);
create index idx_ranking_snapshots_challenge on ranking_snapshots(challenge_id, snapshot_date);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null default 'info',
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index idx_notifications_user on notifications(user_id, read_at);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  old_data jsonb,
  new_data jsonb,
  reason text,
  ip_address text,
  created_at timestamptz not null default now()
);
create index idx_audit_logs_entity on audit_logs(entity_type, entity_id);

create table draws (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references challenges(id) on delete cascade,
  event_id uuid references events(id),
  name text not null,
  eligibility_rule jsonb,
  status draw_status not null default 'draft',
  winner_participant_id uuid references profiles(id),
  executed_by uuid references profiles(id),
  executed_at timestamptz,
  random_seed text,
  created_at timestamptz not null default now()
);

-- ============ updated_at trigger ============
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_profiles_updated_at before update on profiles
  for each row execute function set_updated_at();
create trigger trg_point_requests_updated_at before update on point_requests
  for each row execute function set_updated_at();
