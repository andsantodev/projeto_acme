import { describe, expect, it } from "vitest";

import { saoPauloDay } from "./chat-usage";

describe("saoPauloDay", () => {
  it("still belongs to the previous day one minute before local midnight", () => {
    // 2026-10-22T02:59:00Z = 2026-10-21 23:59 em America/Sao_Paulo (UTC-3)
    expect(saoPauloDay(new Date("2026-10-22T02:59:00Z"))).toBe("2026-10-21");
  });

  it("turns the day one minute after local midnight", () => {
    // 2026-10-22T03:01:00Z = 2026-10-22 00:01 em America/Sao_Paulo
    expect(saoPauloDay(new Date("2026-10-22T03:01:00Z"))).toBe("2026-10-22");
  });

  it("differs from the UTC day late in the local evening", () => {
    // 2026-10-22T00:30:00Z = 2026-10-21 21:30 em America/Sao_Paulo
    expect(saoPauloDay(new Date("2026-10-22T00:30:00Z"))).toBe("2026-10-21");
    expect(new Date("2026-10-22T00:30:00Z").toISOString().slice(0, 10)).toBe(
      "2026-10-22",
    );
  });

  it("keeps the same offset in a summer date (no DST since 2019)", () => {
    // 2027-01-15T02:59:00Z = 2027-01-14 23:59 em America/Sao_Paulo
    expect(saoPauloDay(new Date("2027-01-15T02:59:00Z"))).toBe("2027-01-14");
  });
});
