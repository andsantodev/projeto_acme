#!/usr/bin/env node
/**
 * Prova o isolamento do RLS com os três usuários de demonstração, pela API
 * REST do Supabase. Não imprime token nem senha. Sai com código 1 na primeira
 * verificação que falhar.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const ACCOUNTS = {
  colaborador: {
    email: process.env.E2E_COLABORADOR_EMAIL,
    password: process.env.E2E_COLABORADOR_PASSWORD,
  },
  ti: { email: process.env.E2E_TI_EMAIL, password: process.env.E2E_TI_PASSWORD },
  rh: { email: process.env.E2E_RH_EMAIL, password: process.env.E2E_RH_PASSWORD },
};

function fail(message) {
  console.error(`FALHOU  ${message}`);
  process.exit(1);
}

function assert(label, condition, detail = "") {
  if (!condition) {
    fail(`${label}${detail ? ` — ${detail}` : ""}`);
  }
  console.log(`ok      ${label}`);
}

for (const [name, value] of Object.entries({
  NEXT_PUBLIC_SUPABASE_URL: url,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: anonKey,
  E2E_COLABORADOR_EMAIL: ACCOUNTS.colaborador.email,
  E2E_COLABORADOR_PASSWORD: ACCOUNTS.colaborador.password,
  E2E_TI_EMAIL: ACCOUNTS.ti.email,
  E2E_TI_PASSWORD: ACCOUNTS.ti.password,
  E2E_RH_EMAIL: ACCOUNTS.rh.email,
  E2E_RH_PASSWORD: ACCOUNTS.rh.password,
})) {
  if (!value) {
    fail(`variável de ambiente ausente: ${name}`);
  }
}

async function signIn({ email, password }) {
  const response = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: anonKey, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    fail(`login recusado para ${email} (HTTP ${response.status})`);
  }

  const body = await response.json();

  return { token: body.access_token, userId: body.user.id };
}

async function rest(token, path, init = {}) {
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: anonKey,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const text = await response.text();

  return { status: response.status, body: text ? JSON.parse(text) : null };
}

const sessions = {};
for (const [name, account] of Object.entries(ACCOUNTS)) {
  sessions[name] = await signIn(account);
}

const ana = sessions.colaborador;

let result = await rest(ana.token, "acme_profiles?select=id,role");
assert(
  "colaborador lê apenas o próprio perfil",
  Array.isArray(result.body) &&
    result.body.length === 1 &&
    result.body[0].id === ana.userId,
  JSON.stringify(result.body),
);

const stamp = new Date().toISOString();
for (const category of ["ti", "rh"]) {
  result = await rest(ana.token, "acme_tickets", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      user_id: ana.userId,
      category,
      title: `[verify:rls] ${category} ${stamp}`.slice(0, 120),
      description:
        "Chamado criado por pnpm verify:rls para provar o isolamento entre categorias.",
    }),
  });
  assert(
    `colaborador abre chamado ${category}`,
    result.status === 201,
    `HTTP ${result.status} ${JSON.stringify(result.body)}`,
  );
}

result = await rest(ana.token, "acme_tickets?select=id,user_id");
assert(
  "colaborador lê apenas os próprios chamados",
  Array.isArray(result.body) &&
    result.body.length > 0 &&
    result.body.every((ticket) => ticket.user_id === ana.userId),
  JSON.stringify(result.body),
);

result = await rest(sessions.ti.token, "acme_tickets?select=id,category");
assert(
  "atendente de TI vê apenas chamados de TI",
  Array.isArray(result.body) &&
    result.body.length > 0 &&
    result.body.every((ticket) => ticket.category === "ti"),
  JSON.stringify(result.body),
);

result = await rest(sessions.ti.token, "acme_tickets?select=id&category=eq.rh");
assert(
  "atendente de TI não lê chamados de RH, nem pedindo o filtro",
  Array.isArray(result.body) && result.body.length === 0,
  JSON.stringify(result.body),
);

result = await rest(sessions.rh.token, "acme_tickets?select=id&category=eq.ti");
assert(
  "atendente de RH não lê chamados de TI, nem pedindo o filtro",
  Array.isArray(result.body) && result.body.length === 0,
  JSON.stringify(result.body),
);

result = await rest(sessions.ti.token, "acme_profiles?select=id");
assert(
  "atendente de TI lê o perfil de quem abriu chamado na sua categoria",
  Array.isArray(result.body) &&
    result.body.some((profile) => profile.id === ana.userId),
  JSON.stringify(result.body),
);

result = await rest(sessions.rh.token, "acme_profiles?select=id");
assert(
  "atendente de RH lê o próprio perfil e o de quem abriu chamado de RH, não o do atendente de TI",
  Array.isArray(result.body) &&
    result.body.some((profile) => profile.id === sessions.rh.userId) &&
    result.body.some((profile) => profile.id === ana.userId) &&
    !result.body.some((profile) => profile.id === sessions.ti.userId),
  JSON.stringify(result.body),
);

result = await rest(null, "acme_tickets?select=id");
assert(
  "requisição anônima não lê chamados",
  result.status === 401 ||
    (Array.isArray(result.body) && result.body.length === 0),
  `HTTP ${result.status}`,
);

console.log("\nverify:rls passou — isolamento por usuário e por categoria confirmado.");
