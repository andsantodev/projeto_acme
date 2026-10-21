import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const createTicketAction = vi.hoisted(() => vi.fn());

vi.mock("./actions", () => ({ createTicketAction }));

import { NewTicketForm } from "./new-ticket-form";

const QUESTION = "Como peço acesso ao sistema financeiro?";

function submit() {
  fireEvent.click(screen.getByRole("button", { name: "Abrir chamado" }));
}

describe("NewTicketForm", () => {
  beforeEach(() => {
    createTicketAction.mockReset();
  });

  it("renders the labels, the categories and the prefilled question", () => {
    render(
      <NewTicketForm
        initialDescription={QUESTION}
        initialTitle={QUESTION.slice(0, 120)}
      />,
    );

    expect(screen.getByRole("radio", { name: /TI/ })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /RH/ })).toBeInTheDocument();
    expect(screen.getByLabelText("Título")).toHaveValue(QUESTION);
    expect(screen.getByLabelText("Descrição")).toHaveValue(QUESTION);
  });

  it("shows the per-field errors returned by the server action", async () => {
    createTicketAction.mockResolvedValue({
      errors: {
        category: "Escolha TI ou RH.",
        title: "O título precisa ter ao menos 5 caracteres.",
        description: "A descrição precisa ter ao menos 10 caracteres.",
      },
      values: { category: "", title: "abc", description: "curta" },
    });

    render(<NewTicketForm initialDescription="" initialTitle="" />);
    submit();

    expect(
      await screen.findByText("Escolha TI ou RH."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("O título precisa ter ao menos 5 caracteres."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("A descrição precisa ter ao menos 10 caracteres."),
    ).toBeInTheDocument();
  });

  it("shows a form-level error when the insert fails", async () => {
    createTicketAction.mockResolvedValue({
      formError: "Não foi possível abrir o chamado agora. Tente de novo.",
      values: { category: "ti", title: "Acesso ao FinAcme", description: "Preciso de acesso." },
    });

    render(<NewTicketForm initialDescription="" initialTitle="" />);
    submit();

    expect(
      await screen.findByText(
        "Não foi possível abrir o chamado agora. Tente de novo.",
      ),
    ).toBeInTheDocument();
  });
});
