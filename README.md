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
- [ ] Check-in (QR Code / código / manual)
- [ ] Registro de prova externa + upload de comprovante
- [ ] Painel do organizador (validação, eventos, participantes)
- [ ] Ranking com critérios de desempate
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
