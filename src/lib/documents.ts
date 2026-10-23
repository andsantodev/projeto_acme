export const DOCUMENT_MAX_FILES = 10;
export const DOCUMENT_MAX_BYTES = 200 * 1024;

export type DocumentFile = {
  name: string;
  size: number;
};

export type DocumentFilesCheck = { ok: true } | { ok: false; error: string };

const DOCUMENT_NAME = /^[a-zA-Z0-9._-]+$/;

export function isValidDocumentName(name: string): boolean {
  return name.toLowerCase().endsWith(".md") && DOCUMENT_NAME.test(name);
}

/**
 * The same rules run on the client (as a convenience) and on the server
 * (as the boundary). The server never trusts the client check.
 */
export function validateDocumentFiles(
  files: readonly DocumentFile[],
): DocumentFilesCheck {
  if (files.length === 0) {
    return { ok: false, error: "Escolha pelo menos um arquivo .md." };
  }

  if (files.length > DOCUMENT_MAX_FILES) {
    return {
      ok: false,
      error: `Envie no máximo ${DOCUMENT_MAX_FILES} arquivos por vez.`,
    };
  }

  for (const file of files) {
    if (!file.name.toLowerCase().endsWith(".md")) {
      return { ok: false, error: `"${file.name}" não é um arquivo .md.` };
    }

    if (!DOCUMENT_NAME.test(file.name)) {
      return {
        ok: false,
        error: `"${file.name}" tem caracteres não permitidos. Use letras, números, ponto, hífen ou sublinhado.`,
      };
    }

    if (file.size === 0) {
      return { ok: false, error: `"${file.name}" está vazio.` };
    }

    if (file.size > DOCUMENT_MAX_BYTES) {
      return { ok: false, error: `"${file.name}" passa de 200 KB.` };
    }
  }

  return { ok: true };
}

export function formatDocumentDate(isoDate: string): string {
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(date);
}
