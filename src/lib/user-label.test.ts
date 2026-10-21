import { describe, expect, it } from "vitest";

import { roleLabel } from "./user-label";

describe("roleLabel", () => {
  it("names the colaborador", () => {
    expect(
      roleLabel({
        id: "1",
        name: "Ana",
        role: "colaborador",
        category: null,
      }),
    ).toBe("Colaborador");
  });

  it("names the attendant by the category it answers", () => {
    expect(
      roleLabel({ id: "2", name: "Bia", role: "atendente", category: "ti" }),
    ).toBe("Atendente de TI");
    expect(
      roleLabel({ id: "3", name: "Caio", role: "atendente", category: "rh" }),
    ).toBe("Atendente de RH");
  });

  it("falls back to the plain role when the category is missing", () => {
    expect(
      roleLabel({ id: "4", name: "Dani", role: "atendente", category: null }),
    ).toBe("Atendente");
  });
});
