-- CorreCRA — Row Level Security
-- Principio: nenhuma pontuacao oficial e criada/alterada diretamente pelo cliente.
-- point_ledger e ranking_snapshots so sao escritos por funcoes SECURITY DEFINER (service role).

create or replace function current_profile_role()
returns user_role as $$
  select role from profiles where user_id = auth.uid();
$$ language sql stable security definer;

create or replace function current_profile_id()
returns uuid as $$
  select id from profiles where user_id = auth.uid();
$$ language sql stable security definer;

create or replace function is_staff()
returns boolean as $$
  select current_profile_role() in ('organizer', 'admin');
$$ language sql stable security definer;

create or replace function is_admin()
returns boolean as $$
  select current_profile_role() = 'admin';
$$ language sql stable security definer;

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

-- profiles
create policy "profiles_select_own_or_staff" on profiles for select
  using (user_id = auth.uid() or is_staff());
create policy "profiles_update_own" on profiles for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "profiles_update_staff" on profiles for update
  using (is_staff());
create policy "profiles_insert_own" on profiles for insert
  with check (user_id = auth.uid());

-- challenges / activity_types (publicos para leitura, staff escreve)
create policy "challenges_select_all" on challenges for select using (true);
create policy "challenges_write_admin" on challenges for all
  using (is_admin()) with check (is_admin());

create policy "activity_types_select_all" on activity_types for select using (true);
create policy "activity_types_write_admin" on activity_types for all
  using (is_admin()) with check (is_admin());

-- events
create policy "events_select_all" on events for select using (true);
create policy "events_write_staff" on events for all
  using (is_staff()) with check (is_staff());

-- event_checkins: participante ve os proprios, staff ve tudo
create policy "checkins_select_own_or_staff" on event_checkins for select
  using (participant_id = current_profile_id() or is_staff());
create policy "checkins_insert_own" on event_checkins for insert
  with check (participant_id = current_profile_id());
create policy "checkins_update_staff" on event_checkins for update
  using (is_staff());

-- external_races
create policy "races_select_own_or_staff" on external_races for select
  using (participant_id = current_profile_id() or is_staff());
create policy "races_insert_own" on external_races for insert
  with check (participant_id = current_profile_id());
create policy "races_update_own_draft_or_staff" on external_races for update
  using (
    (participant_id = current_profile_id() and status = 'draft')
    or is_staff()
  );

-- point_requests
create policy "point_requests_select_own_or_staff" on point_requests for select
  using (participant_id = current_profile_id() or is_staff());
create policy "point_requests_insert_own" on point_requests for insert
  with check (participant_id = current_profile_id());
create policy "point_requests_update_staff" on point_requests for update
  using (is_staff());

-- attachments
create policy "attachments_select_own_or_staff" on attachments for select
  using (owner_id = current_profile_id() or is_staff());
create policy "attachments_insert_own" on attachments for insert
  with check (owner_id = current_profile_id());

-- point_ledger: leitura ampla, escrita SOMENTE via service role (sem policy de insert/update para authenticated)
create policy "ledger_select_own_or_staff" on point_ledger for select
  using (participant_id = current_profile_id() or is_staff());

-- ranking_snapshots: leitura publica (para ranking), escrita so via service role
create policy "ranking_select_all" on ranking_snapshots for select using (true);

-- notifications
create policy "notifications_select_own" on notifications for select
  using (user_id = auth.uid());
create policy "notifications_update_own" on notifications for update
  using (user_id = auth.uid());
create policy "notifications_insert_staff" on notifications for insert
  with check (is_staff());

-- audit_logs: leitura apenas admin, escrita so via service role
create policy "audit_logs_select_admin" on audit_logs for select
  using (is_admin());

-- draws
create policy "draws_select_all" on draws for select using (true);
create policy "draws_write_staff" on draws for all
  using (is_staff()) with check (is_staff());
