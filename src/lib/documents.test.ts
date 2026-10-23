import { describe, expect, it } from "vitest";

import {
  DOCUMENT_MAX_BYTES,
  DOCUMENT_MAX_FILES,
  formatDocumentDate,
  validateDocumentFiles,
} from "./documents";

describe("validateDocumentFiles", () => {
  it("accepts a single .md file inside the limits", () => {
    expect(validateDocumentFiles([{ name: "acessos.md", size: 1024 }])).toEqual({
      ok: true,
    });
  });

  it("rejects an empty submission", () => {
    expect(validateDocumentFiles([])).toEqual({
      ok: false,
      error: "Escolha pelo menos um arquivo .md.",
    });
  });

  it("rejects more than the maximum number of files", () => {
    const files = Array.from({ length: DOCUMENT_MAX_FILES + 1 }, (_, index) => ({
      name: `documento-${index}.md`,
      size: 10,
    }));

    expect(validateDocumentFiles(files)).toEqual({
      ok: false,
      error: `Envie no máximo ${DOCUMENT_MAX_FILES} arquivos por vez.`,
    });
  });

  it("rejects a file that is not .md", () => {
    expect(validateDocumentFiles([{ name: "curriculo.pdf", size: 10 }])).toEqual({
      ok: false,
      error: '"curriculo.pdf" não é um arquivo .md.',
    });
  });

  it("rejects an empty file", () => {
    expect(validateDocumentFiles([{ name: "vazio.md", size: 0 }])).toEqual({
      ok: false,
      error: '"vazio.md" está vazio.',
    });
  });

  it("rejects a file above the size limit", () => {
    expect(
      validateDocumentFiles([
        { name: "grande.md", size: DOCUMENT_MAX_BYTES + 1 },
      ]),
    ).toEqual({
      ok: false,
      error: '"grande.md" passa de 200 KB.',
    });
  });

  it("rejects a name with characters that break the source filter", () => {
    expect(
      validateDocumentFiles([{ name: "a,b.md", size: 10 }]),
    ).toEqual({
      ok: false,
      error:
        '"a,b.md" tem caracteres não permitidos. Use letras, números, ponto, hífen ou sublinhado.',
    });
  });
});

describe("formatDocumentDate", () => {
  it("formats an ISO date in the São Paulo timezone", () => {
    expect(formatDocumentDate("2026-10-23T13:31:01.885Z")).toContain(
      "23/10/2026",
    );
  });

  it("falls back to a dash for an invalid date", () => {
    expect(formatDocumentDate("not-a-date")).toBe("—");
  });
});
