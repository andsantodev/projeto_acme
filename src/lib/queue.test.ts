import { describe, expect, it } from "vitest";

import { formatAge, sortQueue } from "./queue";

const base = {
  id: "1",
  title: "Chamado",
  category: "ti" as const,
  requesterName: "Ana",
};

describe("sortQueue", () => {
  it("puts aberto before em_andamento and newest first inside each group", () => {
    const tickets = [
      { ...base, id: "a-antigo", status: "aberto" as const, createdAt: "2026-10-01T10:00:00Z" },
      { ...base, id: "e-novo", status: "em_andamento" as const, createdAt: "2026-10-03T10:00:00Z" },
      { ...base, id: "a-novo", status: "aberto" as const, createdAt: "2026-10-02T10:00:00Z" },
      { ...base, id: "e-antigo", status: "em_andamento" as const, createdAt: "2026-10-01T10:00:00Z" },
    ];

    expect(sortQueue(tickets).map((ticket) => ticket.id)).toEqual([
      "a-novo",
      "a-antigo",
      "e-novo",
      "e-antigo",
    ]);
  });

  it("does not mutate the input array", () => {
    const tickets = [
      { ...base, id: "e", status: "em_andamento" as const, createdAt: "2026-10-03T10:00:00Z" },
      { ...base, id: "a", status: "aberto" as const, createdAt: "2026-10-01T10:00:00Z" },
    ];

    sortQueue(tickets);

    expect(tickets.map((ticket) => ticket.id)).toEqual(["e", "a"]);
  });
});

describe("formatAge", () => {
  const now = new Date("2026-10-21T12:00:00Z");

  it("shows 'agora' under a minute", () => {
    expect(formatAge("2026-10-21T11:59:30Z", now)).toBe("agora");
  });

  it("shows minutes, hours and days", () => {
    expect(formatAge("2026-10-21T11:30:00Z", now)).toBe("há 30 min");
    expect(formatAge("2026-10-21T09:00:00Z", now)).toBe("há 3 h");
    expect(formatAge("2026-10-20T12:00:00Z", now)).toBe("há 1 dia");
    expect(formatAge("2026-10-18T12:00:00Z", now)).toBe("há 3 dias");
  });
});
