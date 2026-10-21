# Portal Acme

Portal interno da Acme: o assistente de onboarding responde dúvidas a partir dos documentos da empresa (RAG) e o que não for resolvido vira um chamado para TI ou RH.

O contexto de produto está em `docs/PRD.md`; o estado do trabalho, em `docs/progress.md`.

## Stack

- Next.js 16 (App Router) e React 19, TypeScript estrito
- Tailwind CSS 4
- Supabase (Auth, Postgres com RLS, pgvector) e n8n para o fluxo de RAG
- Vitest + React Testing Library

## Como rodar

```bash
pnpm install
cp .env.example .env.local   # preencha as variáveis
pnpm dev                     # http://localhost:3000
```

## Verificação

```bash
pnpm verify   # typecheck + lint + testes (portão principal)
pnpm build    # build de produção
```

`pnpm test` roda os testes uma vez e sai com código diferente de zero quando uma asserção falha.
