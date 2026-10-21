import { describe, expect, it } from "vitest";

import {
  TICKET_DESCRIPTION_MAX,
  TICKET_DESCRIPTION_MIN,
  TICKET_TITLE_MAX,
  TICKET_TITLE_MIN,
  titleFromQuestion,
  validateTicketInput,
} from "./ticket";

describe("validateTicketInput", () => {
  const valid = {
    category: "ti",
    title: "Acesso ao FinAcme",
    description: "Preciso de acesso ao sistema financeiro para fechar o mês.",
  };

  it("accepts a valid ticket and trims the text fields", () => {
    expect(
      validateTicketInput({
        ...valid,
        title: `  ${valid.title}  `,
        description: `  ${valid.description}  `,
      }),
    ).toEqual({ ok: true, value: valid });
  });

  it("accepts the exact boundaries", () => {
    const title = "a".repeat(TICKET_TITLE_MAX);
    const description = "b".repeat(TICKET_DESCRIPTION_MAX);

    expect(validateTicketInput({ ...valid, title, description }).ok).toBe(true);

    const minTitle = "a".repeat(TICKET_TITLE_MIN);
    const minDescription = "b".repeat(TICKET_DESCRIPTION_MIN);

    expect(
      validateTicketInput({
        ...valid,
        title: minTitle,
        description: minDescription,
      }).ok,
    ).toBe(true);
  });

  it("rejects a title below 5 or above 120", () => {
    const short = validateTicketInput({
      ...valid,
      title: "a".repeat(TICKET_TITLE_MIN - 1),
    });
    const long = validateTicketInput({
      ...valid,
      title: "a".repeat(TICKET_TITLE_MAX + 1),
    });

    expect(short.ok).toBe(false);
    expect(!short.ok && short.errors.title).toContain("ao menos 5");
    expect(long.ok).toBe(false);
    expect(!long.ok && long.errors.title).toContain("no máximo 120");
  });

  it("rejects a description below 10 or above 4000", () => {
    const short = validateTicketInput({
      ...valid,
      description: "b".repeat(TICKET_DESCRIPTION_MIN - 1),
    });
    const long = validateTicketInput({
      ...valid,
      description: "b".repeat(TICKET_DESCRIPTION_MAX + 1),
    });

    expect(short.ok).toBe(false);
    expect(!short.ok && short.errors.description).toContain("ao menos 10");
    expect(long.ok).toBe(false);
    expect(!long.ok && long.errors.description).toContain("no máximo 4000");
  });

  it("rejects a missing or unknown category", () => {
    for (const category of ["", "financeiro", "TI"]) {
      const result = validateTicketInput({ ...valid, category });

      expect(result.ok).toBe(false);
      expect(!result.ok && result.errors.category).toBe("Escolha TI ou RH.");
    }
  });
});

describe("titleFromQuestion", () => {
  it("truncates the question to 120 characters", () => {
    const question = "a".repeat(TICKET_TITLE_MAX + 30);

    expect(titleFromQuestion(question)).toHaveLength(TICKET_TITLE_MAX);
  });

  it("keeps a short question and trims the edges", () => {
    expect(titleFromQuestion("  Como peço acesso?  ")).toBe("Como peço acesso?");
    expect(titleFromQuestion("")).toBe("");
  });
});
