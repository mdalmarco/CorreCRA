-- CorreCRA — funcoes de negocio (SECURITY DEFINER, chamadas via Server Actions/API Routes)
-- Garante: sem duplicidade, sem auto-aprovacao, toda escrita em point_ledger passa por aqui.

-- Registra check-in com validacao de janela/duplicidade e credita pontos (regra 2,3,4,9)
create or replace function fn_do_checkin(
  p_event_id uuid,
  p_participant_id uuid,
  p_method checkin_method
) returns event_checkins as $$
declare
  v_event events;
  v_checkin event_checkins;
begin
  select * into v_event from events where id = p_event_id for update;

  if v_event is null or v_event.status not in ('checkin_open') then
    raise exception 'Check-in nao esta aberto para este evento';
  end if;

  if now() < v_event.checkin_start_at or (v_event.checkin_end_at is not null and now() > v_event.checkin_end_at) then
    raise exception 'Fora da janela de check-in';
  end if;

  insert into event_checkins (event_id, participant_id, checkin_method, status)
  values (p_event_id, p_participant_id, p_method, 'valid')
  on conflict (event_id, participant_id) do nothing
  returning * into v_checkin;

  if v_checkin is null then
    raise exception 'Check-in ja realizado para este evento';
  end if;

  insert into point_ledger (
    challenge_id, participant_id, activity_type_id, event_id, transaction_type,
    points, status, description, rule_snapshot, approved_at
  ) values (
    v_event.challenge_id, p_participant_id, v_event.activity_type_id, v_event.id, 'checkin',
    v_event.points, 'validated', 'Check-in: ' || v_event.name,
    jsonb_build_object('points', v_event.points, 'event_id', v_event.id), now()
  );

  return v_checkin;
end;
$$ language plpgsql security definer;

-- Aprova/rejeita solicitacao de pontos (regra 18: organizador nao aprova a propria; regra 8 itens separados)
create or replace function fn_review_point_request(
  p_request_id uuid,
  p_reviewer_id uuid,
  p_new_status request_status,
  p_approved_points integer,
  p_reviewer_notes text
) returns point_requests as $$
declare
  v_req point_requests;
  v_reviewer profiles;
begin
  select * into v_req from point_requests where id = p_request_id for update;
  select * into v_reviewer from profiles where id = p_reviewer_id;

  if v_req is null then
    raise exception 'Solicitacao nao encontrada';
  end if;

  if v_reviewer.role not in ('organizer','admin') then
    raise exception 'Sem permissao para revisar solicitacoes';
  end if;

  if v_req.participant_id = p_reviewer_id then
    raise exception 'Organizador nao pode aprovar a propria solicitacao';
  end if;

  update point_requests set
    status = p_new_status,
    approved_points = p_approved_points,
    reviewer_notes = p_reviewer_notes,
    reviewed_by = p_reviewer_id,
    reviewed_at = now()
  where id = p_request_id
  returning * into v_req;

  if p_new_status in ('approved','partially_approved') then
    insert into point_ledger (
      challenge_id, participant_id, activity_type_id, point_request_id, transaction_type,
      points, status, description, rule_snapshot, approved_at, approved_by
    )
    select c.id, v_req.participant_id, v_req.activity_type_id, v_req.id, 'point_request',
      coalesce(p_approved_points, v_req.requested_points), 'validated',
      'Solicitacao de pontos aprovada', jsonb_build_object('approved_points', p_approved_points),
      now(), p_reviewer_id
    from challenges c order by c.created_at desc limit 1;
  end if;

  insert into audit_logs (actor_id, action, entity_type, entity_id, old_data, new_data, reason)
  values (p_reviewer_id, 'review_point_request', 'point_requests', p_request_id,
    to_jsonb(v_req), jsonb_build_object('status', p_new_status, 'approved_points', p_approved_points),
    p_reviewer_notes);

  return v_req;
end;
$$ language plpgsql security definer;

-- Ajuste manual de pontos, exige justificativa e gera auditoria (regra 11)
create or replace function fn_manual_point_adjustment(
  p_participant_id uuid,
  p_challenge_id uuid,
  p_points integer,
  p_reason text,
  p_actor_id uuid
) returns point_ledger as $$
declare
  v_entry point_ledger;
  v_actor profiles;
begin
  select * into v_actor from profiles where id = p_actor_id;
  if v_actor.role not in ('organizer','admin') then
    raise exception 'Sem permissao para ajustar pontos';
  end if;
  if p_reason is null or length(trim(p_reason)) < 5 then
    raise exception 'Justificativa obrigatoria para ajuste manual';
  end if;

  insert into point_ledger (
    challenge_id, participant_id, transaction_type, points, status,
    description, approved_at, approved_by
  ) values (
    p_challenge_id, p_participant_id, 'manual_adjustment', p_points, 'admin_adjustment',
    p_reason, now(), p_actor_id
  ) returning * into v_entry;

  insert into audit_logs (actor_id, action, entity_type, entity_id, new_data, reason)
  values (p_actor_id, 'manual_point_adjustment', 'point_ledger', v_entry.id, to_jsonb(v_entry), p_reason);

  return v_entry;
end;
$$ language plpgsql security definer;
