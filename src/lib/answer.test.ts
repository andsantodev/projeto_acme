import { describe, expect, it } from "vitest";

import { ANSWER_MAX, validateAnswer } from "./answer";

describe("validateAnswer", () => {
  it("trims and accepts a normal answer", () => {
    expect(validateAnswer("  Abra o chamado no sistema.  ")).toEqual({
      ok: true,
      value: "Abra o chamado no sistema.",
    });
  });

  it("accepts exactly 4000 characters", () => {
    const answer = "a".repeat(ANSWER_MAX);

    expect(validateAnswer(answer)).toEqual({ ok: true, value: answer });
  });

  it("rejects an empty or whitespace-only answer", () => {
    expect(validateAnswer("")).toEqual({
      ok: false,
      message: "Escreva uma resposta antes de enviar.",
    });
    expect(validateAnswer("   ").ok).toBe(false);
  });

  it("rejects an answer above 4000 characters", () => {
    const result = validateAnswer("a".repeat(ANSWER_MAX + 1));

    expect(result.ok).toBe(false);
    expect(!result.ok && result.message).toContain("no máximo 4000");
  });
});
