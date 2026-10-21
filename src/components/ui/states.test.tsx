import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EmptyState, ErrorState } from "./states";

describe("EmptyState", () => {
  it("renders the message and the optional action", () => {
    render(
      <EmptyState
        action={<a href="/chat">Ir para o assistente</a>}
        message="Você ainda não abriu nenhum chamado."
      />,
    );

    expect(
      screen.getByText("Você ainda não abriu nenhum chamado."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Ir para o assistente" }),
    ).toHaveAttribute("href", "/chat");
  });

  it("works without an action", () => {
    render(<EmptyState message="Nenhum chamado aguardando." />);

    expect(screen.getByText("Nenhum chamado aguardando.")).toBeInTheDocument();
    expect(screen.queryByRole("link")).toBeNull();
  });
});

describe("ErrorState", () => {
  it("announces the failure and keeps the retry action", () => {
    render(
      <ErrorState
        action={<button type="button">Tentar de novo</button>}
        message="Não foi possível carregar os chamados."
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Não foi possível carregar os chamados.",
    );
    expect(
      screen.getByRole("button", { name: "Tentar de novo" }),
    ).toBeInTheDocument();
  });
});
