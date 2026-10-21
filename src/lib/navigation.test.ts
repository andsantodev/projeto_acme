import { describe, expect, it } from "vitest";

import { homeRouteFor, navigationFor } from "./navigation";

describe("navigationFor", () => {
  it("gives the colaborador the assistant and its own tickets", () => {
    expect(navigationFor("colaborador").map((item) => item.href)).toEqual([
      "/chat",
      "/meus-chamados",
    ]);
  });

  it("gives the atendente only the queue", () => {
    expect(navigationFor("atendente").map((item) => item.href)).toEqual([
      "/fila",
    ]);
  });
});

describe("homeRouteFor", () => {
  it("sends each role to its own home route", () => {
    expect(homeRouteFor("colaborador")).toBe("/chat");
    expect(homeRouteFor("atendente")).toBe("/fila");
  });
});
