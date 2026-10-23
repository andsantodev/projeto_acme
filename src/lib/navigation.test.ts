import { describe, expect, it } from "vitest";

import { homeRouteFor, navigationFor } from "./navigation";

describe("navigationFor", () => {
  it("gives the colaborador the assistant, a new ticket and its own tickets", () => {
    expect(
      navigationFor({ role: "colaborador", category: null }).map(
        (item) => item.href,
      ),
    ).toEqual(["/chat", "/chamados/novo", "/meus-chamados"]);
  });

  it("gives the RH attendant only the queue", () => {
    expect(
      navigationFor({ role: "atendente", category: "rh" }).map(
        (item) => item.href,
      ),
    ).toEqual(["/fila"]);
  });

  it("gives the TI attendant the queue and the knowledge base", () => {
    expect(
      navigationFor({ role: "atendente", category: "ti" }).map(
        (item) => item.href,
      ),
    ).toEqual(["/fila", "/documentos"]);
  });
});

describe("homeRouteFor", () => {
  it("sends each role to its own home route", () => {
    expect(homeRouteFor("colaborador")).toBe("/chat");
    expect(homeRouteFor("atendente")).toBe("/fila");
  });
});
