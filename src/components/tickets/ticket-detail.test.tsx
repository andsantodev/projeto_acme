import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/services/ticket-actions", () => ({
  answerTicketAction: vi.fn(),
  closeTicketAction: vi.fn(),
}));

import { SIMULATION_NOTICE } from "@/lib/ticket-status";
import type { TicketDetail } from "@/types/ticket";

import { TicketDetailView } from "./ticket-detail";

const ticket: TicketDetail = {
  id: "0f7f7cab-5ccd-465f-95f9-22aef4cffa58",
  userId: "4e3279fb-b99d-4208-879f-334bab7c9c29",
  title: "Acesso ao FinAcme",
  description: "Preciso de acesso ao sistema financeiro para fechar o mês.",
  category: "ti",
  status: "respondido",
  answer: "Abra o chamado no sistema de acessos com o gestor como aprovador.",
  answeredAt: "2026-10-21T15:00:00Z",
  createdAt: "2026-10-21T12:00:00Z",
};

function renderDetail(
  overrides: Partial<TicketDetail> = {},
  owner = true,
  canAnswer = false,
) {
  return render(
    <TicketDetailView
      backHref="/meus-chamados"
      backLabel="Voltar para meus chamados"
      canAnswer={canAnswer}
      owner={owner}
      ticket={{ ...ticket, ...overrides }}
    />,
  );
}

describe("TicketDetailView", () => {
  it("shows the description, the answer and the simulation notice", () => {
    renderDetail();

    expect(
      screen.getByRole("heading", { name: "Acesso ao FinAcme" }),
    ).toBeInTheDocument();
    expect(screen.getByText(ticket.description)).toBeInTheDocument();
    expect(screen.getByText(ticket.answer as string)).toBeInTheDocument();
    expect(screen.getByText(SIMULATION_NOTICE)).toBeInTheDocument();
    expect(screen.getByText("TI · Aberto em 21/10/2026")).toBeInTheDocument();
  });

  it("offers the close action only to the owner on a respondido ticket", () => {
    renderDetail();
    expect(
      screen.getByRole("button", { name: "Fechar chamado" }),
    ).toBeInTheDocument();

    renderDetail({}, false);
    expect(
      screen.queryAllByRole("button", { name: "Fechar chamado" }),
    ).toHaveLength(1);
  });

  it("hides the answer, the notice and the close action while the ticket is open", () => {
    renderDetail({ status: "aberto", answer: null, answeredAt: null });

    expect(screen.queryByText(SIMULATION_NOTICE)).toBeNull();
    expect(
      screen.queryByRole("button", { name: "Fechar chamado" }),
    ).toBeNull();
  });

  it("keeps the answer after the ticket is closed but removes the close action", () => {
    renderDetail({ status: "fechado" });

    expect(screen.getByText(ticket.answer as string)).toBeInTheDocument();
    expect(screen.getByText(SIMULATION_NOTICE)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Fechar chamado" }),
    ).toBeNull();
  });

  it("links back to the list", () => {
    renderDetail();

    expect(
      screen.getByRole("link", { name: "Voltar para meus chamados" }),
    ).toHaveAttribute("href", "/meus-chamados");
  });

  it("shows the answer form only when the attendant can answer", () => {
    renderDetail({ status: "em_andamento", answer: null, answeredAt: null }, false, true);

    expect(
      screen.getByRole("heading", { name: "Responder ao colaborador" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Responder" }),
    ).toBeInTheDocument();
  });

  it("hides the answer form when the ticket is already answered", () => {
    renderDetail({ status: "respondido" }, false, false);

    expect(
      screen.queryByRole("heading", { name: "Responder ao colaborador" }),
    ).toBeNull();
    expect(
      screen.queryByRole("button", { name: "Responder" }),
    ).toBeNull();
  });
});
