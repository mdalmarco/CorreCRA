# CorreCRA — Desafio CRA 2026

Sistema de gestao do Desafio CRA 2026, do grupo de corrida CRA (Indaial/Blumenau).

## Stack
Next.js (App Router) · TypeScript · Tailwind · shadcn/ui · Supabase (Auth + Postgres + Storage)

## Status atual (Etapa 2 concluida — Etapa 3 em andamento)

Banco de dados **provisionado e populado** no Supabase (projeto `CorreCRA`, id `yatkvqeykzxtlelogfez`, regiao `sa-east-1`):
- Schema completo (profiles, challenges, activity_types, events, event_checkins, external_races, point_requests, attachments, point_ledger, ranking_snapshots, notifications, audit_logs, draws)
- RLS habilitado em todas as tabelas, com policies por papel (participant/organizer/admin)
- Funcoes de negocio server-side (`fn_do_checkin`, `fn_review_point_request`, `fn_manual_point_adjustment`) que garantem: sem check-in duplicado, sem auto-aprovacao pelo organizador, ajuste manual sempre com justificativa e log de auditoria
- Dados iniciais: Desafio CRA 2026 (01/08 a 30/11/2026), 4 tipos de atividade, 3 eventos de exemplo

Telas implementadas: login, cadastro, dashboard do participante, ranking, check-in por codigo.

## Ainda faltam (proximas etapas)
- Etapa 3 completa: extrato de pontuacao, registrar prova (formulario em 4 etapas), eventos, perfil, notificacoes
- Etapa 4: painel do organizador (eventos, validacoes, participantes, configuracao de pontuacao, comunicados, sorteios)
- QR Code (geracao e leitura) — check-in por codigo ja funciona
- Upload de comprovantes via Supabase Storage
- Job de recalculo de ranking com criterios de desempate

## Configuracao local

1. Copie `.env.example` para `.env.local` e preencha `NEXT_PUBLIC_SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY` (Supabase Dashboard → Project Settings → API).
2. `npm install`
3. `npm run dev`

## Deploy
Conectar o repositorio ao Vercel e configurar as mesmas variaveis de ambiente do `.env.example`.
