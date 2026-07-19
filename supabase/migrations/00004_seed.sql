-- CorreCRA — dados iniciais (item 16 da spec)

insert into challenges (name, description, start_date, end_date, award_date, registration_fee, status)
values (
  'Desafio CRA 2026',
  'Desafio de pontuacao do grupo de corrida CRA — corres semanais, treinoes e provas.',
  '2026-08-01', '2026-11-30', '2026-12-15', 20.00, 'inscricoes_abertas'
);

insert into activity_types (challenge_id, name, description, default_points, requires_approval, proof_required, accumulation_group)
select id, 'Inscricao em prova como equipe CRA', 'Comprovante de inscricao usando a equipe CRA', 5, true, true, 'prova_externa'
from challenges where name = 'Desafio CRA 2026'
union all
select id, 'Prova com camisa CRA', 'Comprovante de participacao usando a camisa oficial', 3, true, true, 'prova_externa'
from challenges where name = 'Desafio CRA 2026'
union all
select id, 'Corre semanal', 'Corre semanal em Blumenau ou Indaial', 2, false, false, 'corre_semanal'
from challenges where name = 'Desafio CRA 2026'
union all
select id, 'Treinao mensal', 'Treinao mensal do CRA', 2, false, false, 'treinao_mensal'
from challenges where name = 'Desafio CRA 2026';

-- Eventos recorrentes de exemplo — marcados is_sample para facilitar edicao posterior
insert into events (challenge_id, activity_type_id, name, city, start_at, status, points, is_sample)
select c.id, at.id, 'Corre CRA Indaial (exemplo)', 'Indaial', now() + interval '7 days', 'draft', 2, true
from challenges c join activity_types at on at.challenge_id = c.id and at.name = 'Corre semanal'
where c.name = 'Desafio CRA 2026'
union all
select c.id, at.id, 'Corre CRA Blumenau (exemplo)', 'Blumenau', now() + interval '8 days', 'draft', 2, true
from challenges c join activity_types at on at.challenge_id = c.id and at.name = 'Corre semanal'
where c.name = 'Desafio CRA 2026'
union all
select c.id, at.id, 'Treinao Mensal CRA (exemplo)', 'Indaial', now() + interval '14 days', 'draft', 2, true
from challenges c join activity_types at on at.challenge_id = c.id and at.name = 'Treinao mensal'
where c.name = 'Desafio CRA 2026';
