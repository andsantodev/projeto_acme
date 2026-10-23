#!/usr/bin/env node
/**
 * Confere a gestão de documentos do PRD 7.2 contra o ambiente real:
 * o atendente de TI lista a base, o webhook sobe um documento de teste, ele
 * aparece na listagem, um segredo errado é recusado e o atendente de RH não
 * pode listar. O documento de teste é substituído por um reenvio e depois
 * removido pelo webhook de remoção. Não imprime segredos.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const uploadUrl = process.env.N8N_UPLOAD_WEBHOOK_URL;
const removeUrl = process.env.N8N_REMOVE_WEBHOOK_URL;
const secret = process.env.N8N_RAG_SECRET;
const tiEmail = process.env.E2E_TI_EMAIL;
const tiPassword = process.env.E2E_TI_PASSWORD;
const rhEmail = process.env.E2E_RH_EMAIL;
const rhPassword = process.env.E2E_RH_PASSWORD;

const TEST_DOCUMENT = "zz-verify-documents.md";
const TEST_CONTENT = `# Documento de verificacao\n\nCriado por pnpm verify:documents em ${new Date().toISOString()}.\n`;

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

if (!supabaseUrl || !anonKey) {
  fail(
    "NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY precisam estar no .env.local",
  );
}

if (!uploadUrl || !removeUrl || !secret) {
  fail(
    "N8N_UPLOAD_WEBHOOK_URL, N8N_REMOVE_WEBHOOK_URL e N8N_RAG_SECRET precisam estar no .env.local",
  );
}

if (!tiEmail || !tiPassword || !rhEmail || !rhPassword) {
  fail(
    "E2E_TI_EMAIL, E2E_TI_PASSWORD, E2E_RH_EMAIL e E2E_RH_PASSWORD precisam estar no .env.local",
  );
}

async function signIn(email, password) {
  const response = await fetch(
    `${supabaseUrl}/auth/v1/token?grant_type=password`,
    {
      method: "POST",
      headers: { apikey: anonKey, "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    },
  );

  if (!response.ok) {
    fail(`login de ${email} (HTTP ${response.status})`);
  }

  const body = await response.json();

  return body.access_token;
}

async function listDocuments(token) {
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/acme_list_documents`, {
    method: "POST",
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: "{}",
  });

  return { status: response.status, body: await response.json().catch(() => null) };
}

async function uploadDocument(providedSecret, content = TEST_CONTENT) {
  const body = new FormData();

  body.append(
    "files",
    new File([content], TEST_DOCUMENT, { type: "text/markdown" }),
  );

  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: { "x-acme-secret": providedSecret },
    body,
  });

  return { status: response.status, body: await response.json().catch(() => null) };
}

async function removeDocument(providedSecret, document = TEST_DOCUMENT) {
  const response = await fetch(removeUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-acme-secret": providedSecret,
    },
    body: JSON.stringify({ document }),
  });

  return { status: response.status, body: await response.json().catch(() => null) };
}

const tiToken = await signIn(tiEmail, tiPassword);
const rhToken = await signIn(rhEmail, rhPassword);

const before = await listDocuments(tiToken);
assert("atendente de TI lista a base", before.status === 200, `HTTP ${before.status}`);
assert(
  "a listagem é uma lista de documentos",
  Array.isArray(before.body),
  JSON.stringify(before.body)?.slice(0, 120),
);

const rhAttempt = await listDocuments(rhToken);
assert(
  "atendente de RH não lista a base",
  rhAttempt.status >= 400,
  `HTTP ${rhAttempt.status}`,
);

const rejected = await uploadDocument("segredo-errado");
assert(
  "webhook recusa segredo errado",
  rejected.status === 401,
  `HTTP ${rejected.status}`,
);

const uploaded = await uploadDocument(secret);
assert(
  "webhook aceita o envio com o segredo",
  uploaded.status === 200 && uploaded.body?.ok === true,
  `HTTP ${uploaded.status}`,
);
assert(
  "o webhook devolve o nome enviado",
  Array.isArray(uploaded.body?.documents) &&
    uploaded.body.documents.includes(TEST_DOCUMENT),
  JSON.stringify(uploaded.body)?.slice(0, 160),
);

const afterUpload = await listDocuments(tiToken);
const uploadedRow = Array.isArray(afterUpload.body)
  ? afterUpload.body.find((row) => row.document === TEST_DOCUMENT)
  : null;

assert(
  "o documento enviado aparece na listagem",
  Boolean(uploadedRow),
  "documento não apareceu",
);
assert(
  "o documento aparece com trechos",
  Number(uploadedRow?.chunks) >= 1,
  `chunks=${uploadedRow?.chunks}`,
);

const replacedContent = `${TEST_CONTENT}\n${"Paragrafo extra do documento de teste. ".repeat(80)}\n`;
const replaced = await uploadDocument(secret, replacedContent);

assert(
  "reenviar o mesmo nome substitui o documento",
  replaced.status === 200 && replaced.body?.ok === true,
  `HTTP ${replaced.status}`,
);

const afterReplace = await listDocuments(tiToken);
const replacedRows = Array.isArray(afterReplace.body)
  ? afterReplace.body.filter((row) => row.document === TEST_DOCUMENT)
  : [];

assert(
  "o documento continua com uma unica versao na base",
  replacedRows.length === 1,
  `${replacedRows.length} linhas`,
);
assert(
  "a contagem de trechos reflete o novo arquivo",
  Number(replacedRows[0]?.chunks) >= 2,
  `chunks=${replacedRows[0]?.chunks}`,
);

const removeRejected = await removeDocument("segredo-errado");
assert(
  "webhook de remoção recusa segredo errado",
  removeRejected.status === 401,
  `HTTP ${removeRejected.status}`,
);

const removedByPortal = await removeDocument(secret);
assert(
  "webhook de remoção apaga o documento",
  removedByPortal.status === 200 && removedByPortal.body?.ok === true,
  `HTTP ${removedByPortal.status}`,
);

const afterRemoval = await listDocuments(tiToken);
const removed = Array.isArray(afterRemoval.body)
  ? afterRemoval.body.some((row) => row.document === TEST_DOCUMENT)
  : true;

assert("o documento de teste saiu da base", !removed);

console.log("\nverify:documents concluído");
