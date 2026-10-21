import { describe, expect, it } from "vitest";

import { canAccess } from "./route-access";

describe("canAccess", () => {
  it("gives the colaborador the assistant and its own tickets", () => {
    expect(canAccess("colaborador", "assistant")).toBe(true);
    expect(canAccess("colaborador", "my-tickets")).toBe(true);
  });

  it("keeps the colaborador out of the queue", () => {
    expect(canAccess("colaborador", "queue")).toBe(false);
  });

  it("gives the atendente only the queue", () => {
    expect(canAccess("atendente", "queue")).toBe(true);
    expect(canAccess("atendente", "assistant")).toBe(false);
    expect(canAccess("atendente", "my-tickets")).toBe(false);
  });
});
