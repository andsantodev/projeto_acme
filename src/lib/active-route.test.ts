import { describe, expect, it } from "vitest";

import { isActivePath } from "./active-route";

describe("isActivePath", () => {
  it("matches the exact route", () => {
    expect(isActivePath("/chat", "/chat")).toBe(true);
  });

  it("matches child routes of the same section", () => {
    expect(isActivePath("/meus-chamados", "/meus-chamados/abc")).toBe(true);
  });

  it("does not match a different route that shares a prefix", () => {
    expect(isActivePath("/fila", "/fila-arquivo")).toBe(false);
  });

  it("does not match a route that only contains the href", () => {
    expect(isActivePath("/chat", "/meus-chamados")).toBe(false);
  });
});
