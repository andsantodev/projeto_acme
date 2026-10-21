#!/usr/bin/env node
/**
 * Confere o contrato da consulta RAG do PRD 7.1 contra o webhook publicado:
 * segredo obrigatorio, grounded:false sem base (sem chamar o modelo) e
 * grounded:true com fontes para pergunta coberta. Nao imprime o segredo.
 */
const url = process.env.N8N_RAG_WEBHOOK_URL;
const secret = process.env.N8N_RAG_SECRET;

const DOCUMENTS = [
  "acessos.md",
  "beneficios.md",
  "ferias.md",
  "onboarding.md",
  "sobre-a-empresa.md",
];

const ON_BASE_QUESTION = "Como peco acesso ao sistema financeiro?";
const OFF_BASE_QUESTION = "Qual e a cor do ceu em Marte?";

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

if (!url || !secret) {
  fail(
    "N8N_RAG_WEBHOOK_URL e N8N_RAG_SECRET precisam estar no .env.local",
  );
}

async function ask(question, providedSecret) {
  const startedAt = Date.now();
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(providedSecret ? { "x-acme-secret": providedSecret } : {}),
    },
    body: JSON.stringify({ question, history: [] }),
    signal: AbortSignal.timeout(60000),
  });

  const text = await response.text();
  let body = null;

  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }

  return { status: response.status, body, ms: Date.now() - startedAt };
}

function assertContract(label, body) {
  const keys = body && typeof body === "object" ? Object.keys(body).sort() : [];
  assert(
    `${label}: contrato tem answer, sources e grounded`,
    JSON.stringify(keys) === JSON.stringify(["answer", "grounded", "sources"]),
    JSON.stringify(keys),
  );
  assert(
    `${label}: answer e string`,
    typeof body.answer === "string" && body.answer.length > 10,
  );
  assert(`${label}: sources e array`, Array.isArray(body.sources));
  assert(
    `${label}: grounded e boolean`,
    typeof body.grounded === "boolean",
  );
  for (const source of body.sources) {
    assert(
      `${label}: source tem apenas document e excerpt`,
      JSON.stringify(Object.keys(source).sort()) ===
        JSON.stringify(["document", "excerpt"]),
      JSON.stringify(Object.keys(source)),
    );
  }
}

const withoutSecret = await ask(ON_BASE_QUESTION);
assert(
  "sem x-acme-secret a requisicao e recusada",
  withoutSecret.status >= 400,
  `HTTP ${withoutSecret.status}`,
);
console.log(`        (${withoutSecret.ms} ms)`);

const wrongSecret = await ask(ON_BASE_QUESTION, "segredo-errado");
assert(
  "x-acme-secret invalido e recusado",
  wrongSecret.status >= 400,
  `HTTP ${wrongSecret.status}`,
);
console.log(`        (${wrongSecret.ms} ms)`);

const offBase = await ask(OFF_BASE_QUESTION, secret);
assert("pergunta fora da base responde 2xx", offBase.status === 200);
assertContract("fora da base", offBase.body);
assert(
  "pergunta fora da base devolve grounded:false",
  offBase.body.grounded === false,
);
assert(
  "pergunta fora da base devolve sources vazio",
  offBase.body.sources.length === 0,
);
console.log(`        (${offBase.ms} ms)`);

const onBase = await ask(ON_BASE_QUESTION, secret);
assert("pergunta coberta responde 2xx", onBase.status === 200);
assertContract("coberta", onBase.body);
assert(
  "pergunta coberta devolve grounded:true",
  onBase.body.grounded === true,
);
assert(
  "pergunta coberta devolve ao menos uma fonte",
  onBase.body.sources.length >= 1,
);
assert(
  "as fontes sao documentos da base",
  onBase.body.sources.every(
    (source) =>
      DOCUMENTS.includes(source.document) &&
      typeof source.excerpt === "string" &&
      source.excerpt.length > 20,
  ),
  JSON.stringify(onBase.body.sources.map((source) => source.document)),
);
console.log(`        (${onBase.ms} ms)`);

console.log(
  `\nverify:rag passou — contrato do PRD 7.1 ok, sem base = grounded:false, coberta = ${onBase.body.sources.length} fonte(s).`,
);
console.log(
  `latencia: sem segredo ${withoutSecret.ms} ms · segredo errado ${wrongSecret.ms} ms · fora da base ${offBase.ms} ms · coberta ${onBase.ms} ms`,
);
