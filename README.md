# CorreCRA — Desafio CRA 2026

Sistema de gestão do Desafio CRA 2026 (grupo de corrida CRA). MVP mobile-first
com autenticação, check-in, validação de pontos por organizadores e ranking.

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS
- Supabase (Auth, Postgres, Storage) — projeto `CorreCRA` (`yatkvqeykzxtlelogfez`)

## Status

- [x] Schema do banco + RLS aplicados (`supabase/migrations/0001_init.sql`)
- [x] Dados iniciais do Desafio CRA 2026 semeados
- [x] Auth por magic link
- [x] Dashboard do participante (pontuação real via `point_ledger`)
- [x] Check-in por código de evento (QR Code entra na v1.1)
- [x] Registro de prova externa + upload de comprovante (bucket `comprovantes`)
- [ ] Painel do organizador (validação, eventos, participantes)
- [x] Ranking (soma do point_ledger validado — desempate ainda não implementado)
- [ ] Auditoria e ajustes manuais de pontuação

## Setup local

```bash
npm install
cp .env.example .env.local  # preencher com as chaves do projeto Supabase
npm run dev
```

## Regras de pontuação (v1)

| Atividade | Pontos | Aprovação |
|---|---|---|
| Inscrição em prova como equipe CRA | 5 | Manual |
| Prova com camisa CRA | 3 | Manual |
| Corre semanal | 2 | Automática (check-in) |
| Treinão mensal | 2 | Automática (check-in) |

Regras completas e critérios de desempate: ver `supabase/migrations/0001_init.sql`.

## Nota sobre o schema

O schema do Supabase (enums, tabelas, RLS) já estava criado neste projeto
antes desta sessão — provavelmente por outra sessão/agente trabalhando no
mesmo prompt em paralelo. Os enums usam valores em inglês
(`active`, `checkin_open`, `validated`, `organizer`/`admin` etc.),
não os que a migration `0001_init.sql` deste repo propunha. O código em
`src/` foi escrito para o schema real (o que está em produção no Supabase),
não para `0001_init.sql`. Antes de rodar `0001_init.sql` em outro ambiente,
confirme se o schema alvo já não está mais avançado.
