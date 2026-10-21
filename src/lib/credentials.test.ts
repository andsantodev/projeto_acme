import { describe, expect, it } from "vitest";

import { validateCredentials } from "./credentials";

describe("validateCredentials", () => {
  it("normalizes the email and keeps the password", () => {
    expect(validateCredentials("  ANA@Acme.Demo ", "acme@123")).toEqual({ // taste-skill-ignore
      ok: true,
      email: "ana@acme.demo",
      password: "acme@123",
    });
  });

  it("rejects an email without the shape of an address", () => {
    expect(validateCredentials("ana", "acme@123")).toEqual({
      ok: false,
      message: "Informe um e-mail válido.",
    });
  });

  it("rejects a password shorter than six characters", () => {
    expect(validateCredentials("ana@acme.demo", "123")).toEqual({
      ok: false,
      message: "A senha precisa ter ao menos 6 caracteres.",
    });
  });
});
