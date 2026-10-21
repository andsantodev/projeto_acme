import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { TicketSummary } from "@/types/ticket";

import { TicketList } from "./ticket-list";

const ticket: TicketSummary = {
  id: "8f3a2c1e-0000-4000-8000-000000000001",
  title: "Acesso ao FinAcme",
  category: "ti",
  status: "aberto",
  createdAt: "2026-10-21T21:36:14.215647+00:00",
};

describe("TicketList", () => {
  it("renders title, category, date and status badge", () => {
    render(<TicketList tickets={[ticket]} />);

    expect(screen.getByText("Acesso ao FinAcme")).toBeInTheDocument();
    expect(screen.getByText("TI · 21/10/2026")).toBeInTheDocument();
    expect(screen.getByText("Aberto")).toHaveAttribute("data-tone", "warning");
  });

  it("links each ticket to its detail page", () => {
    render(<TicketList tickets={[ticket]} />);

    expect(
      screen.getByRole("link", { name: /Acesso ao FinAcme/ }),
    ).toHaveAttribute("href", "/chamados/8f3a2c1e-0000-4000-8000-000000000001");
  });

  it("keeps the newest ticket first", () => {
    const older: TicketSummary = {
      ...ticket,
      id: "8f3a2c1e-0000-4000-8000-000000000002",
      title: "Pedido antigo",
      category: "rh",
      status: "fechado",
      createdAt: "2026-09-01T12:00:00+00:00",
    };

    render(<TicketList tickets={[ticket, older]} />);

    const links = screen.getAllByRole("link");

    expect(links[0]).toHaveTextContent("Acesso ao FinAcme");
    expect(links[1]).toHaveTextContent("Pedido antigo");
    expect(screen.getByText("RH · 01/09/2026")).toBeInTheDocument();
  });
});
