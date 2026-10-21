# PRD: Portal Acme (portal de chamados + assistente de onboarding com RAG)

Nome provisório. Projeto de portfólio em Next.js com autenticação, permissões, integração com automações e IA em uma aplicação full-stack.

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
- Envio real de e-mail. A notificação é simulada (ver RF-16).
- Upload de documentos da base RAG pelo painel. Os documentos entram por um workflow de ingestão.
- Histórico do chat salvo entre sessões.
- Cadastro livre de usuários.
- Multiempresa (multi-tenant).

## 5. Usuários e jornada

**Perfis**
- **Colaborador** (exemplo: Ana, nova colaboradora da Acme): consulta o assistente e abre chamados.
- **Atendente de TI** e **atendente de RH**: respondem os chamados da sua categoria.
- **Avaliador da demo** (recrutador ou entrevistador): acessa com usuários de demonstração.

**Jornada principal**
1. A colaboradora faz login e cai na tela do assistente.
2. Pergunta algo ("como peço acesso ao sistema financeiro?"). A pergunta vai do Next, pelo servidor, ao n8n, que consulta os documentos da Acme e responde citando a fonte.
3. Se a resposta não resolve, ou o assistente não encontra base nos documentos, aparece o botão "Abrir chamado", com a pergunta já preenchida.
4. A colaboradora confirma e o chamado entra na fila da categoria escolhida (TI ou RH).
5. O atendente da categoria vê a fila, abre o chamado e responde.
6. O status do chamado muda para Respondido. A colaboradora vê a resposta do atendente no detalhe do chamado, com um aviso de que a resposta também seria enviada por e-mail (simulação).

## 6. Requisitos funcionais

**Autenticação e perfis**
- RF-01: Login com e-mail e senha via Supabase Auth, usando usuários pré-criados (uma colaboradora, um atendente de TI, um atendente de RH). Logout disponível.
- RF-02: Sessão em cookies HttpOnly. Rotas protegidas por middleware. Sessão expirada redireciona para o login.
- RF-03: Dois perfis (colaborador e atendente), sendo o atendente vinculado a uma categoria (TI ou RH). As permissões são aplicadas no servidor e no banco.

**Assistente (chat com RAG)**
- RF-04: Tela do assistente para o colaborador logado: envia pergunta e exibe a resposta.
- RF-05: A pergunta segue do Next ao webhook do n8n por código de servidor, com segredo em header. O segredo nunca chega ao cliente.
- RF-06: Cada resposta cita o(s) documento(s) de onde veio a informação.
- RF-07: Se os documentos não cobrem a pergunta, o assistente diz que não encontrou e oferece abrir chamado. Ele não inventa resposta.
- RF-08: O chat trata os quatro estados de interface: carregando, erro (n8n indisponível ou timeout), vazio e sucesso. No erro, oferece "Abrir chamado".
- RF-09: O botão "Abrir chamado" abre o formulário de chamado com a pergunta pré-preenchida.
- RF-10: Limite de perguntas por usuário para controlar custo. Valor do limite: até 10 perguntas.

**Chamados**
- RF-11: O colaborador cria um chamado com categoria (TI ou RH), título e descrição. Sem anexos.
- RF-12: Tela "Meus chamados" lista os chamados do colaborador com o status de cada um. Ele só vê os seus.
- RF-13: Tela de detalhe do chamado mostra os dados e, quando respondido, a resposta do atendente.
- RF-14: O atendente vê a fila de chamados da sua categoria, e somente dela.
- RF-15: O atendente abre um chamado e responde. O status muda para Respondido.
- RF-16: Ao responder, o Next aciona um webhook do n8n que registra a notificação (sem enviar e-mail real). A interface exibe ao colaborador o aviso: "Simulação: em um cenário real, esta resposta também seria enviada por e-mail".
- RF-17: As listas e telas de chamados tratam os quatro estados de interface (carregando, erro, vazio, sucesso).

**Base de conhecimento (RAG)**
- RF-18: Os documentos da Acme são arquivos Markdown (`.md`) fictícios, versionados no repositório.
- RF-19: Um workflow de ingestão no n8n lê os arquivos, divide em trechos, gera embeddings e grava no Supabase (pgvector). É executado sob demanda, não pelo painel.
- RF-20: Um workflow de consulta no n8n recebe a pergunta por webhook, usa um agente de IA com a base vetorial como ferramenta e devolve a resposta com as fontes. O workflow usa como referência os fluxos existentes do autor ("fluxo de referencia do autor" para o vector store no Supabase e "fluxo de referencia do autor" para o padrão de agente), sem alterá-los. O projeto trabalha em cópias.

## 7. Requisitos não-funcionais

**Segurança**
- Segredos (chave do webhook, chaves do Supabase com privilégio alto, chave do provedor de IA) ficam só no servidor, isolados com `server-only`. A chave `service_role` nunca vai ao front-end.
- RLS ativado em todas as tabelas do portal. O colaborador acessa apenas os seus chamados, e o atendente apenas os da sua categoria.
- O webhook do n8n exige segredo em header, validado no n8n, e só é chamado pelo servidor do Next. Sem credencial, a chamada é rejeitada.
- Entradas validadas no servidor. Saída renderizada pelo JSX, sem HTML injetado, para prevenir XSS.
- O assistente é instruído a responder só sobre os documentos da Acme. Ele só tem a ferramenta de consulta à base, sem outras ações, para reduzir o risco de injeção de prompt.
- Nenhum segredo, chave ou dado de outros projetos no repositório. Os usuários de demonstração usam credenciais próprias da demo.

**Custo**
- O chat exige login.
- Limite de perguntas por usuário (RF-10).
- Modelo de linguagem e de embeddings econômicos, seguindo a configuração dos workflows de referência.

**Isolamento de dados**
- As tabelas do portal ficam em schema ou prefixo próprio no projeto Supabase "Supabase do portal" (nome: "acme_"). As migrações do portal só alteram esse schema.
- O workflow do portal usa uma credencial do Supabase própria, separada das credenciais de outros projetos.

**Qualidade e testes**
- TypeScript com checagem estrita.
- Testes unitários e de componentes com Vitest e React Testing Library (validações, lógica de permissão, componentes de cliente, tratamento de erro do chat).
- Testes E2E com Playwright para três fluxos: login, colaboradora abre chamado, atendente responde e o status atualiza. Componentes de servidor assíncronos são cobertos por E2E, não por teste unitário.

**Acessibilidade**
- Formulários com rótulos, navegação por teclado e contraste adequado nas telas principais.

## 8. Referências de design

- Referência de design indicada: `design-taste-frontend`.

## 9. Métricas de sucesso

- Os três fluxos E2E passam.
- Toda resposta do assistente traz fonte ou a mensagem de "não encontrei" (nenhuma resposta sem base), verificado com um conjunto de perguntas de teste.
- Nenhum segredo no repositório nem no código enviado ao navegador.
- Um colaborador não consegue ler chamado de outro, e um atendente não consegue ler chamado de outra categoria, nem por chamada direta ao banco.
- Repositório público com README que descreve problema, arquitetura, como rodar e decisões.

## 10. Riscos e premissas

**Riscos**
- **n8n próprio fora do ar:** a demo depende de um n8n hospedado pelo autor. Se ele estiver offline durante uma avaliação, o assistente falha. Mitigação: estado de erro tratado (RF-08) e botão "Abrir chamado" funcional sem o n8n.
- **Custo do provedor de IA:** uso indevido da demo pode consumir crédito. Mitigação: login obrigatório e limite por usuário.
- **Banco compartilhado:** o projeto Supabase usado pode conter tabelas de outros projetos do autor até serem movidas. Mitigação: schema próprio, RLS e credencial própria.
- **Código gerado por IA:** risco de falhas de segurança e de estrutura. Mitigação: revisão do autor de cada feature, com testes e verificação antes de marcar como concluída.
- **Escopo:** acrescentar recursos (anexos, e-mail real, histórico) atrasa a entrega. Eles estão fora do escopo.
- **Credenciais da demo públicas:** podem ser abusadas. Mitigação: permissões mínimas e limite do chat.

**Premissas**
- Os documentos da base são fictícios e escritos em Markdown.
- A hospedagem do portal é a Vercel.
- O desenvolvimento usa o OpenCode, sem plugin global instalado.
- Comandos de build, teste e lint são definidos do zero no projeto.
- O projeto parte de um repositório novo (greenfield).
- Cada chamado recebe uma resposta do atendente. Troca de mensagens no mesmo chamado não faz parte da primeira versão.

## 11. Perguntas em aberto

- Lista de status do chamado além de Aberto e Respondido.
- Quantidade e temas dos documentos fictícios da Acme.
- Onde as credenciais de demonstração ficam visíveis ao avaliador (README, tela de login ou outro).