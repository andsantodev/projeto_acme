#!/usr/bin/env node
/**
 * Confere que a base vetorial tem os cinco documentos da Acme, usando a
 * service role (a tabela não tem grant para anon/authenticated). Não imprime a
 * chave. Sai com código 1 quando falta documento ou aparece fonte desconhecida.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const EXPECTED_SOURCES = [
  "acessos.md",
  "beneficios.md",
  "ferias.md",
  "onboarding.md",
  "sobre-a-empresa.md",
];

if (!url || !serviceKey) {
  console.error(
    "FALHOU  NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY precisam estar no .env.local",
  );
  process.exit(1);
}

const response = await fetch(
  `${url}/rest/v1/acme_documents_vec?select=metadata`,
  {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
  },
);

if (!response.ok) {
  console.error(`FALHOU  leitura da acme_documents_vec (HTTP ${response.status})`);
  process.exit(1);
}

const rows = await response.json();

if (!Array.isArray(rows) || rows.length === 0) {
  console.error("FALHOU  acme_documents_vec está vazia");
  process.exit(1);
}

const chunksBySource = new Map();

for (const row of rows) {
  const source = row.metadata?.source;

  if (typeof source !== "string") {
    console.error("FALHOU  há trecho sem metadata.source");
    process.exit(1);
  }

  chunksBySource.set(source, (chunksBySource.get(source) ?? 0) + 1);
}

for (const source of EXPECTED_SOURCES) {
  const chunks = chunksBySource.get(source);

  if (!chunks) {
    console.error(`FALHOU  documento ausente na base vetorial: ${source}`);
    process.exit(1);
  }

  console.log(`ok      ${source} (${chunks} trechos)`);
}

const unknown = [...chunksBySource.keys()].filter(
  (source) => !EXPECTED_SOURCES.includes(source),
);

if (unknown.length > 0) {
  console.error(`FALHOU  fontes não previstas: ${unknown.join(", ")}`);
  process.exit(1);
}

console.log(
  `\nverify:knowledge passou — ${rows.length} trechos, 5 documentos distintos.`,
);
