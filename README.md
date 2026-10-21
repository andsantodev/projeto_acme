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

## Contas de demonstração

Usuários fictícios, criados no Supabase Auth do projeto de demonstração. As senhas são públicas de propósito: são contas de portfólio, sem dado real.

| Perfil | E-mail | Senha | Tela inicial |
|---|---|---|---|
| Colaboradora | `ana@acme.demo` | `acme@123` | `/chat` |
| Atendente de TI | `ti@acme.demo` | `acme@456` | `/fila` |
| Atendente de RH | `rh@acme.demo` | `acme@789` | `/fila` |

## Verificação

```bash
pnpm verify      # typecheck + lint + testes (portão principal)
pnpm verify:rls  # cada usuário só lê o que pode, pela API REST do Supabase
pnpm build       # build de produção
```

`pnpm test` roda os testes uma vez e sai com código diferente de zero quando uma asserção falha. `pnpm verify:rls` precisa de `.env.local` preenchido e cria dois chamados marcados `[verify:rls]`.
