import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const answerTicketAction = vi.hoisted(() => vi.fn());

vi.mock("@/services/ticket-actions", () => ({ answerTicketAction }));

import { AnswerForm } from "./answer-form";

const TICKET_ID = "0f7f7cab-5ccd-465f-95f9-22aef4cffa58";

describe("AnswerForm", () => {
  beforeEach(() => {
    answerTicketAction.mockReset();
  });

  it("renders a labelled answer field and the submit button", () => {
    render(<AnswerForm ticketId={TICKET_ID} />);

    expect(screen.getByLabelText("Resposta")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Responder" })).toBeInTheDocument();
  });

  it("shows the field error returned by the server", async () => {
    answerTicketAction.mockResolvedValue({
      fieldError: "Escreva uma resposta antes de enviar.",
    });

    render(<AnswerForm ticketId={TICKET_ID} />);
    fireEvent.click(screen.getByRole("button", { name: "Responder" }));

    expect(
      await screen.findByText("Escreva uma resposta antes de enviar."),
    ).toBeInTheDocument();
  });

  it("shows the message when the ticket was already answered", async () => {
    answerTicketAction.mockResolvedValue({
      error: "Este chamado já foi respondido ou não está disponível para você.",
    });

    render(<AnswerForm ticketId={TICKET_ID} />);
    fireEvent.click(screen.getByRole("button", { name: "Responder" }));

    expect(
      await screen.findByText(
        "Este chamado já foi respondido ou não está disponível para você.",
      ),
    ).toBeInTheDocument();
  });
});
