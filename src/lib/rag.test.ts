import { describe, expect, it } from "vitest";

import {
  HISTORY_MAX_CHARS,
  HISTORY_MAX_TURNS,
  QUESTION_MAX,
  parseRagResponse,
  validateHistory,
  validateQuestion,
} from "./rag";

describe("validateQuestion", () => {
  it("trims and accepts a question at the limit", () => {
    expect(validateQuestion("  Como peço acesso?  ")).toEqual({
      ok: true,
      value: "Como peço acesso?",
    });
    expect(validateQuestion("a".repeat(QUESTION_MAX))).toEqual({
      ok: true,
      value: "a".repeat(QUESTION_MAX),
    });
  });

  it("rejects empty and whitespace-only questions", () => {
    expect(validateQuestion("")).toEqual({
      ok: false,
      message: "Escreva uma pergunta antes de enviar.",
    });
    expect(validateQuestion("   ").ok).toBe(false);
  });

  it("rejects a question above 500 characters", () => {
    const result = validateQuestion("a".repeat(QUESTION_MAX + 1));

    expect(result.ok).toBe(false);
  });
});

describe("validateHistory", () => {
  const turn = { role: "user" as const, content: "pergunta" };

  it("accepts up to six turns", () => {
    const history = Array.from({ length: HISTORY_MAX_TURNS }, () => turn);

    expect(validateHistory(history)).toEqual({ ok: true, value: history });
  });

  it("rejects more than six turns", () => {
    const history = Array.from({ length: HISTORY_MAX_TURNS + 1 }, () => turn);

    expect(validateHistory(history).ok).toBe(false);
  });

  it("rejects a history above the character limit", () => {
    const history = [
      { role: "user", content: "a".repeat(HISTORY_MAX_CHARS) },
      { role: "assistant", content: "b" },
    ];

    expect(validateHistory(history).ok).toBe(false);
  });

  it("rejects an unknown role and a non-string content", () => {
    expect(validateHistory([{ role: "system", content: "x" }]).ok).toBe(false);
    expect(validateHistory([{ role: "user", content: 1 }]).ok).toBe(false);
    expect(validateHistory("nope").ok).toBe(false);
  });
});

describe("parseRagResponse", () => {
  const valid = {
    answer: "Abra um chamado de TI.",
    sources: [{ document: "acessos.md", excerpt: "trecho" }],
    grounded: true,
  };

  it("accepts the PRD 7.1 contract", () => {
    expect(parseRagResponse(valid)).toEqual({ ok: true, value: valid });
  });

  it("accepts an empty sources array with grounded false", () => {
    const response = { answer: "Não encontrei.", sources: [], grounded: false };

    expect(parseRagResponse(response).ok).toBe(true);
  });

  it("rejects a response with an extra or missing key", () => {
    expect(parseRagResponse({ ...valid, extra: 1 }).ok).toBe(false);
    expect(parseRagResponse({ answer: "x", sources: [] }).ok).toBe(false);
    expect(parseRagResponse(null).ok).toBe(false);
    expect(parseRagResponse("texto").ok).toBe(false);
  });

  it("rejects wrong types inside the contract", () => {
    expect(parseRagResponse({ ...valid, answer: "" }).ok).toBe(false);
    expect(parseRagResponse({ ...valid, grounded: "true" }).ok).toBe(false);
    expect(parseRagResponse({ ...valid, sources: {} }).ok).toBe(false);
    expect(
      parseRagResponse({ ...valid, sources: [{ document: "a.md" }] }).ok,
    ).toBe(false);
  });
});
