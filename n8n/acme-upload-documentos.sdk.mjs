// Fonte do workflow "Acme - Upload de documentos" (n8n id 25AjlQijw6Z5ky7J).
// Não é executado pela aplicação: é o artefato versionado que recria o workflow
// pelo MCP (validate_workflow -> create_workflow_from_code). O hash é SHA-256 da
// senha do formulário; a senha em texto não fica no repositório.
import {
  workflow,
  trigger,
  node,
  ifElse,
  vectorStore,
  documentLoader,
  textSplitter,
  embeddings,
  newCredential,
  expr,
} from "@n8n/workflow-sdk";

const normalizeInput = node({
  type: "n8n-nodes-base.code",
  version: 2,
  config: {
    name: "Normalizar entrada",
    parameters: {
      mode: "runOnceForAllItems",
      jsCode:
        "const first = $input.first().json;\nconst password = first.password || first['Senha do upload'] || null;\nreturn [{ json: { password } }];",
    },
    position: [220, 0],
  },
  output: [{ password: "secret" }],
});

const hashPassword = node({
  type: "n8n-nodes-base.crypto",
  version: 1,
  config: {
    name: "Calcular hash da senha",
    parameters: {
      action: "hash",
      type: "SHA256",
      value: expr("{{ $json.password }}"),
      dataPropertyName: "passwordHash",
      encoding: "hex",
    },
    position: [440, 0],
  },
  output: [{ passwordHash: "hash" }],
});

const checkPassword = node({
  type: "n8n-nodes-base.code",
  version: 2,
  config: {
    name: "Conferir senha",
    parameters: {
      mode: "runOnceForAllItems",
      jsCode:
        "const EXPECTED = 'f0ac2375c823ca62208820d93163bb1b173bef60b5fc3c71db7b9f442b46e60f';\nconst items = $('Formulário de upload').all();\nlet count = 0;\nfor (const item of items) {\n  if (Array.isArray(item.json && item.json.documents)) count += item.json.documents.length;\n  count += Object.keys(item.binary || {}).length;\n}\nconst allowed = $json.passwordHash === EXPECTED && count > 0;\nreturn [{ json: { allowed, fileCount: count } }];",
    },
    position: [660, 0],
  },
  output: [{ allowed: true, fileCount: 5 }],
});

const passwordGate = ifElse({
  version: 2.2,
  config: {
    name: "Senha correta?",
    parameters: {
      conditions: {
        options: {
          caseSensitive: true,
          leftValue: "",
          typeValidation: "strict",
          version: 2,
        },
        conditions: [
          {
            id: "allowed",
            leftValue: expr("{{ $json.allowed }}"),
            rightValue: "",
            operator: { type: "boolean", operation: "true", singleValue: true },
          },
        ],
        combinator: "and",
      },
      options: {},
    },
    position: [880, 0],
  },
});

const clearBase = node({
  type: "n8n-nodes-base.supabase",
  version: 1,
  config: {
    name: "Limpar base vetorial",
    parameters: {
      operation: "delete",
      tableId: "acme_documents_vec",
      filterType: "string",
      filterString: "=id=gte.0",
    },
    credentials: { supabaseApi: newCredential("Supabase do portal") },
    position: [1100, -140],
  },
  output: [{ id: 1 }],
});

const splitFiles = node({
  type: "n8n-nodes-base.code",
  version: 2,
  config: {
    name: "Separar arquivos",
    parameters: {
      mode: "runOnceForAllItems",
      jsCode:
        "const items = $('Formulário de upload').all();\nconst out = [];\nconst seen = {};\nfor (const item of items) {\n  const binary = item.binary || {};\n  for (const key of Object.keys(binary)) {\n    const bin = binary[key];\n    const name = bin.fileName || key;\n    if (!seen[name]) { seen[name] = true; out.push({ json: { fileName: name }, binary: { data: bin } }); }\n  }\n}\nreturn out;",
    },
    position: [1320, -140],
  },
  output: [{ fileName: "acessos.md" }],
});

const extractText = node({
  type: "n8n-nodes-base.extractFromFile",
  version: 1,
  config: {
    name: "Extrair texto",
    parameters: { operation: "text", options: {} },
    position: [1540, -140],
  },
  output: [{ fileName: "acessos.md", data: "conteudo" }],
});

const embeddingModel = embeddings({
  type: "@n8n/n8n-nodes-langchain.embeddingsOpenAi",
  version: 1,
  config: {
    name: "Embeddings OpenRouter",
    parameters: { model: "openai/text-embedding-3-small", options: {} },
    credentials: { openAiApi: newCredential("Base URL OpenRouter") },
  },
});

const splitter = textSplitter({
  type: "@n8n/n8n-nodes-langchain.textSplitterRecursiveCharacterTextSplitter",
  version: 1,
  config: {
    name: "Dividir em trechos",
    parameters: { chunkSize: 1000, chunkOverlap: 150, options: {} },
  },
});

const loader = documentLoader({
  type: "@n8n/n8n-nodes-langchain.documentDefaultDataLoader",
  version: 1,
  config: {
    name: "Carregar documento",
    parameters: {
      dataType: "json",
      jsonMode: "expressionData",
      jsonData: expr("{{ $json.data }}"),
      textSplittingMode: "custom",
      options: {
        metadata: {
          metadataValues: [
            {
              name: "source",
              value: expr("{{ $('Separar arquivos').item.json.fileName }}"),
            },
          ],
        },
      },
    },
    subnodes: { textSplitter: splitter },
  },
});

const store = vectorStore({
  type: "@n8n/n8n-nodes-langchain.vectorStoreSupabase",
  version: 1,
  config: {
    name: "Gravar na base vetorial",
    parameters: {
      mode: "insert",
      tableName: { __rl: true, mode: "list", value: "acme_documents_vec" },
      options: {},
    },
    credentials: { supabaseApi: newCredential("Supabase do portal") },
    subnodes: { embedding: embeddingModel, documentLoader: loader },
    position: [1760, -140],
  },
  output: [{ json: { ok: true } }],
});

const stop = node({
  type: "n8n-nodes-base.noOp",
  version: 1,
  config: { name: "Senha inválida - encerrar", position: [1100, 160] },
  output: [{}],
});

const uploadForm = trigger({
  type: "n8n-nodes-base.formTrigger",
  version: 2.2,
  config: {
    name: "Formulário de upload",
    parameters: {
      formTitle: "Acme - Upload de documentos",
      formDescription:
        "Envie os arquivos .md da base de conhecimento da Acme e a senha do upload.",
      formFields: {
        values: [
          {
            fieldLabel: "Senha do upload",
            fieldName: "password",
            fieldType: "password",
            required: true,
          },
          {
            fieldLabel: "Documentos (.md)",
            fieldName: "documents",
            fieldType: "file",
            required: true,
            multipleFiles: true,
            acceptFileTypes: ".md",
          },
        ],
      },
      options: { path: "acme-upload-docs" },
    },
    position: [0, 0],
  },
  output: [{ password: "secret", documents: [] }],
});

export default workflow("acme-upload-documentos", "Acme - Upload de documentos")
  .add(uploadForm)
  .to(normalizeInput)
  .to(hashPassword)
  .to(checkPassword)
  .to(
    passwordGate.onTrue(
      clearBase.to(splitFiles.to(extractText.to(store))),
    ).onFalse(stop),
  );
