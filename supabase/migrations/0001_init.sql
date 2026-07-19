-- CorreCRA — Desafio CRA 2026 — schema inicial
-- Enums

create type user_role as enum ('participante', 'organizador', 'administrador');
create type participant_status as enum ('cadastro_incompleto', 'aguardando_pagamento', 'ativo', 'suspenso', 'encerrado');
create type payment_status as enum ('pendente', 'confirmado', 'isento');
create type event_status as enum ('rascunho', 'agendado', 'checkin_aberto', 'checkin_encerrado', 'concluido', 'cancelado');
create type checkin_method as enum ('qr_code', 'codigo', 'manual');
create type point_request_status as enum ('rascunho', 'enviada', 'em_analise', 'complementacao_solicitada', 'aprovada', 'parcialmente_aprovada', 'rejeitada', 'cancelada');
create type ledger_status as enum ('pendente', 'validada', 'rejeitada', 'cancelada', 'ajuste_administrativo');
create type ledger_transaction_type as enum ('checkin', 'point_request', 'ajuste_manual', 'bonus');

-- profiles

create table profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  full_name text,
  display_name text,
  avatar_url text,
  email text,
  phone text,
  birth_date date,
  city text,
  state text,
  shirt_size text,
  role user_role not null default 'participante',
  participant_status participant_status not null default 'cadastro_incompleto',
  payment_status payment_status not null default 'pendente',
  terms_accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- challenges

create table challenges (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  start_date date not null,
  end_date date not null,
  award_date date,
  registration_fee numeric(10,2) not null default 0,
  status text not null default 'inscricoes_abertas',
  ranking_frozen_at timestamptz,
  created_at timestamptz not null default now()
);

-- activity_types

create table activity_types (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references challenges(id) on delete cascade,
  name text not null,
  description text,
  default_points numeric(6,2) not null default 0,
  requires_approval boolean not null default true,
  proof_required boolean not null default false,
  active boolean not null default true,
  accumulation_group text,
  daily_limit int,
  weekly_limit int,
  monthly_limit int,
  created_at timestamptz not null default now()
);

-- events

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
  status event_status not null default 'rascunho',
  points numeric(6,2),
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

-- event_checkins

create table event_checkins (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  participant_id uuid not null references profiles(id) on delete cascade,
  checkin_method checkin_method not null,
  checked_in_at timestamptz not null default now(),
  status ledger_status not null default 'pendente',
  validated_by uuid references profiles(id),
  validation_notes text,
  created_at timestamptz not null default now(),
  unique (event_id, participant_id)
);

-- external_races

create table external_races (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  race_date date not null,
  city text,
  distance text,
  official_url text,
  notes text,
  status point_request_status not null default 'enviada',
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references profiles(id)
);

-- point_requests

create table point_requests (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references profiles(id) on delete cascade,
  external_race_id uuid references external_races(id) on delete cascade,
  activity_type_id uuid not null references activity_types(id),
  requested_points numeric(6,2) not null,
  approved_points numeric(6,2),
  status point_request_status not null default 'enviada',
  participant_notes text,
  reviewer_notes text,
  reviewed_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- attachments

create table attachments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  entity_type text not null,
  entity_id uuid not null,
  file_url text not null,
  file_name text,
  mime_type text,
  file_size int,
  created_at timestamptz not null default now()
);

-- point_ledger (fonte oficial da pontuacao)

create table point_ledger (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references challenges(id) on delete cascade,
  participant_id uuid not null references profiles(id) on delete cascade,
  activity_type_id uuid references activity_types(id),
  event_id uuid references events(id),
  point_request_id uuid references point_requests(id),
  transaction_type ledger_transaction_type not null,
  points numeric(6,2) not null,
  status ledger_status not null default 'pendente',
  description text,
  rule_snapshot jsonb,
  occurred_at timestamptz not null default now(),
  approved_at timestamptz,
  approved_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

-- ranking_snapshots

create table ranking_snapshots (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references challenges(id) on delete cascade,
  participant_id uuid not null references profiles(id) on delete cascade,
  position int not null,
  total_points numeric(8,2) not null,
  tie_break_data jsonb,
  snapshot_date date not null default current_date
);

-- notifications

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  message text,
  type text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- audit_logs

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

-- draws

create table draws (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references challenges(id) on delete cascade,
  event_id uuid references events(id),
  name text not null,
  eligibility_rule jsonb,
  status text not null default 'rascunho',
  winner_participant_id uuid references profiles(id),
  executed_by uuid references profiles(id),
  executed_at timestamptz,
  random_seed text,
  created_at timestamptz not null default now()
);

-- indexes

create index idx_point_ledger_participant on point_ledger(participant_id);
create index idx_point_ledger_challenge on point_ledger(challenge_id);
create index idx_events_challenge on events(challenge_id);
create index idx_checkins_participant on event_checkins(participant_id);
create index idx_point_requests_participant on point_requests(participant_id);
create index idx_profiles_user on profiles(user_id);

-- helper: current profile role/id (avoids RLS recursion)

create or replace function current_profile_id()
returns uuid language sql stable security definer as $$
  select id from profiles where user_id = auth.uid()
$$;

create or replace function current_profile_role()
returns user_role language sql stable security definer as $$
  select role from profiles where user_id = auth.uid()
$$;

-- RLS

alter table profiles enable row level security;
alter table challenges enable row level security;
alter table activity_types enable row level security;
alter table events enable row level security;
alter table event_checkins enable row level security;
alter table external_races enable row level security;
alter table point_requests enable row level security;
alter table attachments enable row level security;
alter table point_ledger enable row level security;
alter table ranking_snapshots enable row level security;
alter table notifications enable row level security;
alter table audit_logs enable row level security;
alter table draws enable row level security;

-- profiles: dono le/edita o proprio; staff le todos
create policy "profiles_select_own_or_staff" on profiles for select
  using (user_id = auth.uid() or current_profile_role() in ('organizador','administrador'));
create policy "profiles_update_own" on profiles for update
  using (user_id = auth.uid());
create policy "profiles_insert_own" on profiles for insert
  with check (user_id = auth.uid());

-- challenges/activity_types/events: leitura publica (autenticado), escrita so staff
create policy "challenges_select_all" on challenges for select using (auth.uid() is not null);
create policy "challenges_write_staff" on challenges for all
  using (current_profile_role() in ('organizador','administrador'))
  with check (current_profile_role() in ('organizador','administrador'));

create policy "activity_types_select_all" on activity_types for select using (auth.uid() is not null);
create policy "activity_types_write_staff" on activity_types for all
  using (current_profile_role() in ('organizador','administrador'))
  with check (current_profile_role() in ('organizador','administrador'));

create policy "events_select_all" on events for select using (auth.uid() is not null);
create policy "events_write_staff" on events for all
  using (current_profile_role() in ('organizador','administrador'))
  with check (current_profile_role() in ('organizador','administrador'));

-- event_checkins: participante ve/cria os proprios; staff ve/edita todos
create policy "checkins_select_own_or_staff" on event_checkins for select
  using (participant_id = current_profile_id() or current_profile_role() in ('organizador','administrador'));
create policy "checkins_insert_own" on event_checkins for insert
  with check (participant_id = current_profile_id());
create policy "checkins_update_staff" on event_checkins for update
  using (current_profile_role() in ('organizador','administrador'));

-- external_races / point_requests: participante ve/cria os proprios; staff ve/edita todos
create policy "races_select_own_or_staff" on external_races for select
  using (participant_id = current_profile_id() or current_profile_role() in ('organizador','administrador'));
create policy "races_insert_own" on external_races for insert
  with check (participant_id = current_profile_id());
create policy "races_update_own_or_staff" on external_races for update
  using (participant_id = current_profile_id() or current_profile_role() in ('organizador','administrador'));

create policy "point_requests_select_own_or_staff" on point_requests for select
  using (participant_id = current_profile_id() or current_profile_role() in ('organizador','administrador'));
create policy "point_requests_insert_own" on point_requests for insert
  with check (participant_id = current_profile_id());
create policy "point_requests_update_staff" on point_requests for update
  using (current_profile_role() in ('organizador','administrador'));

-- attachments: dono ou staff
create policy "attachments_select_own_or_staff" on attachments for select
  using (owner_id = current_profile_id() or current_profile_role() in ('organizador','administrador'));
create policy "attachments_insert_own" on attachments for insert
  with check (owner_id = current_profile_id());

-- point_ledger: participante le o proprio extrato; so staff/service-role escreve
create policy "ledger_select_own_or_staff" on point_ledger for select
  using (participant_id = current_profile_id() or current_profile_role() in ('organizador','administrador'));
create policy "ledger_write_staff" on point_ledger for all
  using (current_profile_role() in ('organizador','administrador'))
  with check (current_profile_role() in ('organizador','administrador'));

-- ranking_snapshots: leitura publica (autenticado)
create policy "ranking_select_all" on ranking_snapshots for select using (auth.uid() is not null);
create policy "ranking_write_staff" on ranking_snapshots for all
  using (current_profile_role() in ('organizador','administrador'))
  with check (current_profile_role() in ('organizador','administrador'));

-- notifications: dono le as proprias
create policy "notifications_select_own" on notifications for select using (user_id = auth.uid());
create policy "notifications_write_staff" on notifications for insert
  with check (current_profile_role() in ('organizador','administrador'));

-- audit_logs: so staff le; ninguem edita via client
create policy "audit_select_staff" on audit_logs for select
  using (current_profile_role() in ('organizador','administrador'));

-- draws: leitura publica (autenticado), escrita so staff
create policy "draws_select_all" on draws for select using (auth.uid() is not null);
create policy "draws_write_staff" on draws for all
  using (current_profile_role() in ('organizador','administrador'))
  with check (current_profile_role() in ('organizador','administrador'));

-- seed inicial

insert into challenges (name, description, start_date, end_date, award_date, registration_fee, status)
values ('Desafio CRA 2026', 'Desafio anual do grupo de corrida CRA', '2026-08-01', '2026-11-30', '2026-12-15', 20.00, 'inscricoes_abertas');

insert into activity_types (challenge_id, name, default_points, requires_approval, proof_required, accumulation_group)
select id, 'Inscricao em prova como equipe CRA', 5, true, true, 'prova' from challenges where name = 'Desafio CRA 2026';

insert into activity_types (challenge_id, name, default_points, requires_approval, proof_required, accumulation_group)
select id, 'Prova com camisa CRA', 3, true, true, 'prova' from challenges where name = 'Desafio CRA 2026';

insert into activity_types (challenge_id, name, default_points, requires_approval, proof_required, accumulation_group, daily_limit)
select id, 'Corre semanal', 2, false, false, 'corre', 1 from challenges where name = 'Desafio CRA 2026';

insert into activity_types (challenge_id, name, default_points, requires_approval, proof_required, accumulation_group, monthly_limit)
select id, 'Treinao mensal', 2, false, false, 'treinao', 1 from challenges where name = 'Desafio CRA 2026';
