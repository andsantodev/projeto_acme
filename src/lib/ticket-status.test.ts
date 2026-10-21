import { describe, expect, it } from "vitest";

import {
  canCloseTicket,
  formatTicketDate,
  showsAnswer,
  SIMULATION_NOTICE,
  TICKET_CATEGORY_LABELS,
  TICKET_STATUS_LABELS,
  TICKET_STATUS_TONES,
} from "./ticket-status";

describe("ticket status presentation", () => {
  it("labels the four statuses in Portuguese", () => {
    expect(TICKET_STATUS_LABELS).toEqual({
      aberto: "Aberto",
      em_andamento: "Em andamento",
      respondido: "Respondido",
      fechado: "Fechado",
    });
  });

  it("gives aberto the only warning tone and respondido the positive one", () => {
    expect(TICKET_STATUS_TONES.aberto).toBe("warning");
    expect(TICKET_STATUS_TONES.respondido).toBe("positive");
    expect(TICKET_STATUS_TONES.em_andamento).toBe("neutral");
    expect(TICKET_STATUS_TONES.fechado).toBe("neutral");
  });

  it("labels the categories", () => {
    expect(TICKET_CATEGORY_LABELS).toEqual({ ti: "TI", rh: "RH" });
  });
});

describe("formatTicketDate", () => {
  it("formats the date in São Paulo time", () => {
    // 2026-10-21T21:36:14Z = 2026-10-21 18:36 em America/Sao_Paulo
    expect(formatTicketDate("2026-10-21T21:36:14.215647+00:00")).toBe(
      "21/10/2026",
    );
  });

  it("moves to the next local day when UTC has already crossed midnight", () => {
    // 2026-10-22T02:30:00Z = 2026-10-21 23:30 em America/Sao_Paulo
    expect(formatTicketDate("2026-10-22T02:30:00Z")).toBe("21/10/2026");
  });
});

describe("answer and close rules", () => {
  it("shows the answer only for respondido and fechado", () => {
    expect(showsAnswer("aberto")).toBe(false);
    expect(showsAnswer("em_andamento")).toBe(false);
    expect(showsAnswer("respondido")).toBe(true);
    expect(showsAnswer("fechado")).toBe(true);
  });

  it("lets only the owner close a respondido ticket", () => {
    expect(canCloseTicket({ owner: true, status: "respondido" })).toBe(true);
    expect(canCloseTicket({ owner: false, status: "respondido" })).toBe(false);
    expect(canCloseTicket({ owner: true, status: "aberto" })).toBe(false);
    expect(canCloseTicket({ owner: true, status: "fechado" })).toBe(false);
  });

  it("keeps the exact simulation sentence", () => {
    expect(SIMULATION_NOTICE).toBe(
      "Simulação: em um cenário real, esta resposta também seria enviada por e-mail",
    );
  });
});
