# PRD: Portal Acme (portal de chamados + assistente de onboarding com RAG)

Projeto de portfólio em Next.js com autenticação, permissões, integração com automações e IA em uma aplicação full-stack.

## 1. Resumo executivo

O Portal Acme é um portal interno de uma empresa fictícia, a Acme. Um assistente de onboarding responde dúvidas dos colaboradores com base em documentos da empresa (RAG). Quando o assistente não resolve, o colaborador abre um chamado para o atendente de TI ou de RH. O projeto existe para provar, com código publicado, domínio de Next.js, Supabase, integração com n8n e segurança de aplicação.

## 2. Problema e motivação

Colaboradores novos fazem as mesmas perguntas (acessos, benefícios, férias) e dependem de pessoas para respondê-las. Quando a dúvida não está documentada ou exige uma pessoa, falta um canal registrado para resolvê-la.

Motivação do projeto: é um projeto de portfólio, sem intenção comercial.

## 3. Objetivos (Goals)

- Entregar um fluxo completo: assistente (chat) resolve o que a base documental cobre, e o chamado cobre o resto.
- Mostrar autenticação com sessão em cookies HttpOnly, rotas protegidas e perfis com permissões diferentes.
- Aplicar permissões também no banco (RLS), e não só na interface.
- Integrar o Next ao n8n sempre pelo servidor, com webhook protegido por segredo.
- Controlar o custo do chat de IA.
- Ter testes automatizados (unitários, de componentes e E2E) nos fluxos críticos.
- Publicar o código no GitHub com README que explique arquitetura e decisões.

## 4. Não-objetivos (Non-goals)

- Anexos ou upload de PDF nos chamados.
- Envio real de e-mail. A notificação é apenas um aviso de simulação na interface (ver RF-16).
- Registro de notificações como entidade própria no banco (ver RF-16).
- Histórico do chat salvo entre sessões ou entre recarregamentos de página.
- Cadastro livre de usuários.
- Multiempresa (multi-tenant).
- Troca de mensagens dentro do mesmo chamado (uma resposta do atendente por chamado).
- Edição do texto do documento pelo portal: o TI envia o arquivo `.md` inteiro.
- Versionamento, histórico ou rastreio de quem alterou cada documento da base.
- Ambiente local de banco (Docker/Supabase local). Desenvolvimento e demo usam o projeto Supabase hospedado.

## 5. Usuários e jornada

**Perfis** — três usuários de demonstração, cada um com sua própria visualização:

| Perfil | Papel (`role`) | Categoria (`category`) | Tela inicial | Acesso |
|---|---|---|---|---|
| Ana, colaboradora nova | `colaborador` | — | `/chat` | Chat, "Meus chamados" e detalhe dos próprios chamados |
| Atendente de TI | `atendente` | `ti` | `/fila` | Fila de TI, detalhe/resposta dos chamados de TI e base de conhecimento (`/documentos`) |
| Atendente de RH | `atendente` | `rh` | `/fila` | Fila de RH e detalhe/resposta dos chamados de RH (sem acesso à base de conhecimento) |
| Avaliador da demo | — | — | `/login` | Entra com um dos usuários acima e alterna saindo/entrando |

Um atendente que tente acessar `/chat` ou `/meus-chamados` é redirecionado para `/fila`. Apenas o atendente de TI acessa `/documentos`; o atendente de RH recebe não encontrado.

**Jornada principal**
1. A colaboradora faz login e cai na tela do assistente.
2. Pergunta algo ("como peço acesso ao sistema financeiro?"). A conversa tem contexto dentro da sessão do navegador: a pergunta e o histórico recente vão do Next, pelo servidor, ao n8n, que busca os trechos relevantes nos documentos da Acme e responde citando a fonte.
3. Se a resposta não resolve, ou o assistente não encontra base nos documentos, aparece o botão "Abrir chamado", com a pergunta já preenchida.
4. A colaboradora confirma e o chamado entra na fila da categoria escolhida (TI ou RH), com status `aberto`.
5. O atendente da categoria vê a fila, abre o chamado, clica em "Assumir" (status `em_andamento`) e responde.
6. O status muda para `respondido`. A colaboradora vê a resposta no detalhe do chamado, com o aviso de que a resposta também seria enviada por e-mail (simulação), e pode fechar o chamado (status `fechado`).

## 6. Requisitos funcionais

**Autenticação e perfis**
- RF-01: Login com e-mail e senha via Supabase Auth, usando três usuários pré-criados (colaboradora, atendente de TI, atendente de RH). Logout disponível. Após o login, cada perfil vai para a sua tela inicial conforme a tabela da seção 5.
- RF-02: Sessão em cookies HttpOnly, gerenciada com `@supabase/ssr`. Rotas protegidas por middleware. Sessão expirada ou ausente redireciona para `/login`.
- RF-03: Papel (`colaborador` | `atendente`) e categoria (`ti` | `rh` | nula) ficam na tabela `acme_profiles`. As permissões são aplicadas no servidor (antes de cada consulta) e no banco (RLS), nunca só na interface.

**Assistente (chat com RAG)**
- RF-04: Tela do assistente disponível apenas para o colaborador logado: envia pergunta e exibe a resposta.
- RF-05: A pergunta segue do Next ao webhook do n8n por código de servidor, com segredo em header. O segredo nunca chega ao cliente.
- RF-06: Cada resposta cita o(s) documento(s) de onde veio a informação, e a UI mostra os nomes dos arquivos citados.
- RF-07: Se os documentos não cobrem a pergunta, o assistente responde que não encontrou (`grounded: false`) e oferece abrir chamado. Ele não inventa resposta.
- RF-08: O chat trata os quatro estados de interface: carregando, erro (n8n indisponível ou timeout de 30s), vazio e sucesso. No erro, oferece "Abrir chamado".
- RF-09: O botão "Abrir chamado" abre o formulário com a pergunta preenchida: descrição recebe a pergunta inteira e o título é pré-preenchido com a pergunta truncada em 120 caracteres, editável.
- RF-10: Limite de 10 perguntas por usuário por dia (virada à meia-noite de America/Sao_Paulo). Todas as tentativas contam, inclusive as que resultarem em erro ou timeout. O contador é incrementado no servidor antes de chamar o n8n, e a UI exibe quantas perguntas restam no dia.

**Chamados**
- RF-11: O colaborador cria um chamado com categoria (TI ou RH), título (5–120 caracteres) e descrição (10–4000 caracteres). Sem anexos. As entradas são validadas no servidor.
- RF-12: Tela "Meus chamados" lista os chamados do colaborador com o status de cada um. Ele só vê os seus.
- RF-13: Tela de detalhe do chamado mostra os dados e, quando respondido, a resposta do atendente e o aviso de simulação de e-mail.
- RF-14: O atendente vê a fila de chamados da sua categoria, e somente dela.
- RF-15: O atendente pode "Assumir" um chamado `aberto` (status `em_andamento`) e responder. Ao responder, o status vira `respondido` e a data da resposta é gravada. O colaborador pode fechar um chamado `respondido` (status `fechado`); nenhum outro perfil ou estado permite essa transição.
- RF-16: Não há entidade de notificação nem chamada ao n8n ao responder. A interface exibe ao colaborador o aviso: "Simulação: em um cenário real, esta resposta também seria enviada por e-mail", sempre que o chamado está `respondido` ou `fechado` e possui resposta.
- RF-17: As listas e telas de chamados tratam os quatro estados de interface (carregando, erro, vazio, sucesso).

**Base de conhecimento (RAG)**
- RF-18: Os documentos da Acme são cinco arquivos Markdown (`.md`) fictícios, versionados no repositório em `content/knowledge/`: acessos, benefícios, férias, onboarding e sobre a empresa. O repositório é apenas o local de armazenamento dos originais; nada em produção lê o GitHub.
- RF-19: A base é atualizada por dois workflows com o mesmo pipeline: `Acme - Upload de documentos` (formulário com vários `.md` + senha, fallback manual) e `Acme - Upload de documentos (portal)` (webhook autenticado por `x-acme-secret`, usado pela página `/documentos`). O Form Trigger do n8n não aceita `Respond to Webhook` no mesmo fluxo, por isso o webhook tem workflow próprio. Antes de inserir, ele apaga apenas os trechos cujas fontes (`metadata.source`) estão no envio, então um documento novo é adicionado sem reenviar os demais e um arquivo com o mesmo nome é substituído. O texto é dividido em trechos, os embeddings são gerados e a gravação usa a credencial Supabase do portal. A tabela nunca é truncada. O workflow `Acme - Remover documento` também aceita formulário e webhook: pelo portal remove-se apenas um documento, pelo nome; a limpeza da base inteira continua disponível somente no formulário.
- RF-20: Um workflow do n8n hospedado (`Acme - Consulta RAG`) recebe a pergunta por webhook (segredo em header), faz busca vetorial (`topK` 4) na base e usa o modelo `deepseek/deepseek-v4.1-flash` para responder apenas com base nos trechos recuperados, devolvendo o contrato JSON da seção 7.1. Sem trecho relevante, devolve `grounded: false` sem chamar o modelo. Os workflows de RAG derivam dos fluxos de referência do autor, que não devem ser alterados.

**Base de conhecimento — gestão pelo portal**
- RF-21: Apenas o atendente de TI acessa `/documentos` ("Base de conhecimento"), com item próprio no menu. A página lista os documentos existentes (nome, número de trechos e data da última atualização), a partir de `acme_list_documents()`, e tem o botão "Adicionar/atualizar documento", que aceita até 10 arquivos `.md` de até 200 KB cada e exige a senha `DOCS_ADMIN_PASSWORD`. Enviar um arquivo com nome já existente substitui somente aquele documento; um nome novo cria um documento novo. A página trata os quatro estados de interface.
- RF-22: A página permite remover um documento pelo nome, exigindo a mesma senha e confirmação explícita. A remoção apaga somente os trechos daquele documento e a lista é atualizada em seguida.

## 7. Requisitos não-funcionais

### 7.1 Contrato Next ↔ n8n (consulta)

Request (POST, `Content-Type: application/json`, header `x-acme-secret`):

```json
{
  "question": "string, 1-500 caracteres",
  "history": [{ "role": "user | assistant", "content": "string" }]
}
```

`history` traz no máximo os últimos 6 turnos e 1500 caracteres no total, enviados pelo cliente e validados/truncados no servidor. Nada é persistido.

Response (2xx):

```json
{
  "answer": "string",
  "sources": [{ "document": "acessos.md", "excerpt": "string" }],
  "grounded": true
}
```

Timeouts, `5xx` e respostas fora desse formato são tratados como estado de erro (RF-08). O segredo é conferido no workflow; requisição sem header válido é rejeitada.

### 7.2 Contrato Next ↔ n8n (documentos)

Todas as chamadas partem do servidor do Next com o header `x-acme-secret`. A senha `DOCS_ADMIN_PASSWORD` é conferida no Next e **nunca** é enviada ao n8n.

**Adicionar/atualizar** — `POST` `multipart/form-data` em `N8N_UPLOAD_WEBHOOK_URL` (`/webhook/acme-docs-upload`), com um ou mais arquivos no campo `files`:

```
200 → { "ok": true, "documents": ["acessos.md", "ferias.md"] }
```

Cada arquivo é tratado como um documento; o nome do arquivo é a chave (`metadata.source`).

**Remover** — `POST application/json` em `N8N_REMOVE_WEBHOOK_URL` (`/webhook/acme-docs-remove`):

```json
{ "document": "acessos.md" }
```

```
200 → { "ok": true }
```

Requisição sem header válido retorna `401`. Timeout de 30s, resposta não-2xx ou corpo fora do formato são tratados como erro na interface, com a lista preservada e opção de tentar de novo.

Os formulários do n8n continuam disponíveis como fallback manual. A consulta lê a tabela vetorial diretamente, sem cache: um documento enviado ou removido já vale na pergunta seguinte.

**Segurança**
- Segredos (segredo do webhook, chave `service_role` do Supabase, chave do provedor de IA) ficam só no servidor, isolados com `server-only`. A chave `service_role` nunca vai ao front-end nem em variável `NEXT_PUBLIC_*`.
- RLS ativado em todas as tabelas do portal, com políticas explícitas. O colaborador acessa apenas os seus chamados, e o atendente apenas os da sua categoria. `acme_chat_usage` e `acme_documents_vec` não têm policy para `anon`/`authenticated`: são acessadas só por função `security definer` e por `service_role`. A listagem de documentos usa `acme_list_documents()`, que exige atendente de categoria `ti`.
- A senha de publicação dos documentos é `DOCS_ADMIN_PASSWORD`: variável de servidor, distinta de `N8N_RAG_SECRET`, conferida no Next antes de qualquer chamada ao n8n. Ela nunca vai ao cliente nem ao n8n.
- Os webhooks de consulta e de documentos do n8n exigem segredo em header, validado no workflow, e só são chamados pelo servidor do Next.
- Entradas validadas no servidor (limites de tamanho, categoria, status). Saída renderizada pelo JSX, sem HTML injetado.
- O assistente é instruído a responder só sobre os documentos da Acme, sem executar ações. As fontes exibidas vêm do workflow, não do texto livre do modelo.
- Nenhum segredo, chave ou dado de outros projetos no repositório. O banco é compartilhado com outros projetos do autor: o portal só pode criar e alterar objetos com o prefixo `acme_`.

**Custo**
- O chat exige login.
- Limite de 10 perguntas por usuário por dia (RF-10).
- Modelo de chat `deepseek/deepseek-v4.1-flash` e embeddings `openai/text-embedding-3-small`, ambos via OpenRouter, escolhidos por custo.

**Isolamento de dados**
- Todas as tabelas do portal usam o prefixo `acme_` no schema `public` do projeto Supabase compartilhado. As migrações do portal só alteram objetos `acme_`.
- A função de busca vetorial chama-se `acme_match_documents` (o padrão `match_documents` colidiria com outros projetos no mesmo banco).
- Os workflows do portal usam a credencial Supabase do portal no n8n, e a credencial OpenRouter `Base URL OpenRouter`.

**Qualidade e testes**
- TypeScript com checagem estrita e `no-explicit-any` como erro de lint.
- Testes unitários e de componentes com Vitest e React Testing Library (validações, lógica de permissão, componentes de cliente, tratamento de erro do chat).
- Testes E2E com Playwright para três fluxos: login, colaboradora abre chamado, atendente responde e o status atualiza. Componentes de servidor assíncronos são cobertos por E2E, não por teste unitário.
- Os E2E rodam contra o servidor local do Next apontando para o Supabase hospedado, sem banco local. Os dados criados são marcados com `[e2e]` e timestamp no título e não são apagados automaticamente.
- Verificações de contrato: `pnpm verify:knowledge` confirma os 5 documentos na base vetorial; `pnpm verify:rag` confirma o contrato JSON, o `grounded: false` para pergunta fora da base e a presença de fontes; `pnpm verify:rls` confirma que cada usuário só lê o que pode; `pnpm verify:documents` sobe um documento de teste, confere que ele aparece na listagem e o remove em seguida.
- A gestão de documentos é coberta por testes de componente (lista, formulário de envio, confirmação de remoção) e por `pnpm verify:documents`, que exercita os webhooks reais do n8n.

**Acessibilidade**
- Formulários com rótulos, navegação por teclado e contraste adequado nas telas principais.

## 8. Referências de design

- Direção de arte: skill `design-taste-frontend`.
- Estilização: Tailwind CSS.

## 9. Métricas de sucesso

- Os três fluxos E2E passam.
- Toda resposta do assistente traz fonte ou a mensagem de "não encontrei" (nenhuma resposta sem base), verificado com um conjunto de perguntas de teste.
- Nenhum segredo no repositório nem no código enviado ao navegador.
- Um colaborador não consegue ler chamado de outro, e um atendente não consegue ler chamado de outra categoria — verificado por requisição direta à API REST do Supabase com o JWT de cada usuário.
- A 11ª pergunta do dia é recusada no servidor, sem chamar o n8n.
- Enviar um documento com nome já existente não duplica trechos: o documento continua com uma única versão na base.
- Um documento removido pelo portal deixa de ser citado nas respostas do assistente.
- O atendente de RH não consegue abrir `/documentos` nem chamar `acme_list_documents()`.
- Repositório público com README que descreve problema, arquitetura, como rodar e decisões.

## 10. Riscos e premissas

**Riscos**
- **n8n próprio fora do ar:** a demo depende de um n8n hospedado pelo autor. Queda afeta apenas o assistente; abrir chamado, responder e fechar continuam funcionando. Mitigação: estado de erro tratado (RF-08) e botão "Abrir chamado" funcional sem o n8n.
- **Modelo com raciocínio:** `deepseek-v4.1-flash` pode adicionar latência. Mitigação: `reasoning_effort: low`, `temperature: 0.2`, timeout de 30s e validação de latência na execução de teste do workflow.
- **Embeddings no OpenRouter:** o ID do modelo precisa do prefixo do provedor (`openai/text-embedding-3-small`). Se a chamada falhar, o plano B é uma chave OpenAI dedicada apenas para embeddings, registrada como decisão no PRD.
- **Custo do provedor de IA:** uso indevido da demo pode consumir crédito. Mitigação: login obrigatório e limite diário por usuário.
- **Banco compartilhado:** o projeto Supabase contém tabelas de outros projetos do autor. Mitigação: prefixo `acme_`, RLS, credencial Supabase do portal e RPC com nome próprio.
- **Código gerado por IA:** risco de falhas de segurança e de estrutura. Mitigação: revisão do autor de cada feature, com testes e verificação antes de marcar como concluída.
- **Escopo:** acrescentar recursos (anexos, e-mail real, histórico) atrasa a entrega. Eles estão fora do escopo.
- **Credenciais da demo públicas:** podem ser abusadas. Mitigação: permissões mínimas e limite diário do chat.
- **Substituição de documento é apagar-e-inserir:** se a inserção falhar depois do delete, o documento fica ausente até o reenvio. Mitigação: a interface mostra o erro, mantém a lista e permite tentar de novo; o nome do documento é a chave, então o reenvio é seguro.
- **Senha de publicação única:** quem a obtiver com uma sessão de TI válida altera a base. Mitigação: senha separada do segredo do webhook, conferida no servidor, e acesso à página restrito ao atendente de TI.

**Premissas**
- Os documentos da base são fictícios, escritos em Markdown e versionados em `content/knowledge/`.
- A hospedagem do portal é a Vercel.
- O desenvolvimento usa o OpenCode, sem plugin global instalado.
- Gerenciador de pacotes pnpm; Node 26. Comandos de build, teste e lint definidos no início do projeto (F001).
- O projeto parte de um repositório novo (greenfield), criado com `create-next-app`.
- Não há ambiente local de banco; o desenvolvimento usa o Supabase hospedado.
- Cada chamado recebe uma resposta do atendente. Troca de mensagens não faz parte da primeira versão.

## 11. Decisões fechadas

Revisões de 20 e 23 de outubro de 2026.

| Tema | Decisão |
|---|---|
| Status do chamado | `aberto` → `em_andamento` (atendente assume) → `respondido` (atendente responde) → `fechado` (colaborador fecha) |
| Notificação | Sem entidade e sem n8n; apenas o aviso de simulação derivado do status |
| Papéis | Tabela `acme_profiles` com `role` e `category`; três perfis com telas iniciais distintas |
| Limite do chat | 10/dia por usuário, America/Sao_Paulo, tentativas com erro contam |
| Ingestão | Upload por formulário e por webhook do portal, upsert por documento via `metadata.source`; a base nunca é truncada |
| Gestão de documentos | Página `/documentos` só para atendente TI, com lista via `acme_list_documents()`, envio e remoção protegidos por `DOCS_ADMIN_PASSWORD` |
| Consulta | Busca vetorial (topK 4) + LLM, contrato JSON com `sources` e `grounded` |
| Banco | Projeto Supabase compartilhado, prefixo `acme_` em `public`, pgvector já instalado |
| Modelos | Chat `deepseek/deepseek-v4.1-flash`; embeddings `openai/text-embedding-3-small` |
| Testes E2E | Contra o Supabase hospedado, sem Docker, dados marcados `[e2e]` |
| Estilo | Tailwind + skill `design-taste-frontend` |

## 12. Perguntas em aberto

Nenhuma. As três questões anteriores (status, documentos fictícios e visibilidade das credenciais de demo) foram resolvidas: 4 status, 5 documentos e credenciais no README e na tela de login.
