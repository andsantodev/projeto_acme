import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const askAssistant = vi.hoisted(() => vi.fn());

vi.mock("@/services/rag-actions", () => ({ askAssistant }));

import { ChatPanel } from "./chat-panel";

const ANSWER = "Abra um chamado de TI no Portal Acme.";

function typeQuestion(value: string) {
  fireEvent.change(screen.getByLabelText("Pergunta"), {
    target: { value },
  });
}

function submit() {
  fireEvent.click(screen.getByRole("button", { name: "Perguntar" }));
}

describe("ChatPanel", () => {
  beforeEach(() => {
    askAssistant.mockReset();
  });

  it("starts with an empty state and a disabled submit", () => {
    render(<ChatPanel />);

    expect(
      screen.getByText(/Pergunte sobre acessos, benefícios, férias ou onboarding/),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Perguntar" })).toBeDisabled();
  });

  it("shows the loading state and disables the submit while waiting", async () => {
    let resolveAnswer: (value: unknown) => void = () => {};
    askAssistant.mockReturnValue(
      new Promise((resolve) => {
        resolveAnswer = resolve;
      }),
    );

    render(<ChatPanel />);
    typeQuestion("Como peço acesso?");
    submit();

    expect(
      await screen.findByText("Consultando os documentos…"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Perguntar/ })).toBeDisabled();

    resolveAnswer({
      ok: true,
      answer: ANSWER,
      sources: [{ document: "acessos.md", excerpt: "trecho" }],
      grounded: true,
    });

    expect(await screen.findByText(ANSWER)).toBeInTheDocument();
  });

  it("renders the answer with the cited documents", async () => {
    askAssistant.mockResolvedValue({
      ok: true,
      answer: ANSWER,
      sources: [
        { document: "acessos.md", excerpt: "trecho 1" },
        { document: "ferias.md", excerpt: "trecho 2" },
      ],
      grounded: true,
    });

    render(<ChatPanel />);
    typeQuestion("Como peço acesso?");
    submit();

    expect(await screen.findByText(ANSWER)).toBeInTheDocument();
    expect(screen.getByText("Fontes: acessos.md, ferias.md")).toBeInTheDocument();
    expect(askAssistant).toHaveBeenCalledWith({
      question: "Como peço acesso?",
      history: [],
    });
  });

  it("offers a ticket when the answer is not grounded", async () => {
    askAssistant.mockResolvedValue({
      ok: true,
      answer: "Não encontrei essa informação.",
      sources: [],
      grounded: false,
    });

    render(<ChatPanel />);
    typeQuestion("Qual a cor do céu em Marte?");
    submit();

    expect(
      await screen.findByText("Não encontrei essa informação."),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Abrir chamado" })).toHaveAttribute(
      "href",
      "/chamados/novo?pergunta=Qual%20a%20cor%20do%20c%C3%A9u%20em%20Marte%3F",
    );
  });

  it("shows the error state with retry and a ticket link", async () => {
    askAssistant.mockResolvedValue({
      ok: false,
      error: "Não foi possível consultar o assistente agora.",
    });

    render(<ChatPanel />);
    typeQuestion("Como peço acesso?");
    submit();

    expect(
      await screen.findByText(
        "Não foi possível consultar o assistente agora.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Abrir chamado" })).toHaveAttribute(
      "href",
      "/chamados/novo?pergunta=Como%20pe%C3%A7o%20acesso%3F",
    );

    askAssistant.mockResolvedValue({
      ok: true,
      answer: ANSWER,
      sources: [],
      grounded: true,
    });
    fireEvent.click(screen.getByRole("button", { name: "Tentar de novo" }));

    expect(await screen.findByText(ANSWER)).toBeInTheDocument();
    expect(askAssistant).toHaveBeenCalledTimes(2);
  });

  it("does not call the server for empty or above-limit questions", () => {
    render(<ChatPanel />);

    expect(screen.getByRole("button", { name: "Perguntar" })).toBeDisabled();

    typeQuestion("a".repeat(501));
    expect(screen.getByRole("button", { name: "Perguntar" })).toBeDisabled();

    submit();
    expect(askAssistant).not.toHaveBeenCalled();
  });

  it("sends the previous exchange as history", async () => {
    askAssistant.mockResolvedValueOnce({
      ok: true,
      answer: "Primeira resposta",
      sources: [],
      grounded: true,
    });

    render(<ChatPanel />);
    typeQuestion("Primeira pergunta");
    submit();
    await screen.findByText("Primeira resposta");

    askAssistant.mockResolvedValueOnce({
      ok: true,
      answer: "Segunda resposta",
      sources: [],
      grounded: true,
    });
    typeQuestion("Segunda pergunta");
    submit();
    await screen.findByText("Segunda resposta");

    await waitFor(() => expect(askAssistant).toHaveBeenCalledTimes(2));

    expect(askAssistant.mock.calls[1][0].history).toEqual([
      { role: "user", content: "Primeira pergunta" },
      { role: "assistant", content: "Primeira resposta" },
    ]);
  });
});
