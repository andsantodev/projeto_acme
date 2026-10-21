import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/services/ticket-actions", () => ({
  assumeTicketAction: vi.fn(),
}));

import type { QueueItem } from "@/lib/queue";

import { QueueList } from "./queue-list";

const now = new Date("2026-10-21T12:00:00Z");

const open: QueueItem = {
  id: "11111111-1111-4111-8111-111111111111",
  title: "Acesso ao FinAcme",
  category: "ti",
  status: "aberto",
  createdAt: "2026-10-21T09:00:00Z",
  requesterName: "Ana Souza",
};

const inProgress: QueueItem = {
  id: "22222222-2222-4222-8222-222222222222",
  title: "Troca de notebook",
  category: "ti",
  status: "em_andamento",
  createdAt: "2026-10-20T12:00:00Z",
  requesterName: "Bruno Lima",
};

describe("QueueList", () => {
  it("renders title, requester, category, age and status", () => {
    render(<QueueList now={now} tickets={[open]} />);

    expect(screen.getByText("Acesso ao FinAcme")).toBeInTheDocument();
    expect(screen.getByText("Ana Souza · TI · há 3 h")).toBeInTheDocument();
    expect(screen.getByText("Aberto")).toHaveAttribute("data-tone", "warning");
    expect(
      screen.getByRole("link", { name: /Acesso ao FinAcme/ }),
    ).toHaveAttribute("href", "/chamados/11111111-1111-4111-8111-111111111111");
  });

  it("offers Assumir only on aberto tickets", () => {
    render(<QueueList now={now} tickets={[open, inProgress]} />);

    expect(
      screen.getAllByRole("button", { name: "Assumir" }),
    ).toHaveLength(1);
  });

  it("keeps the order it receives", () => {
    render(<QueueList now={now} tickets={[open, inProgress]} />);

    const links = screen.getAllByRole("link");

    expect(links[0]).toHaveTextContent("Acesso ao FinAcme");
    expect(links[1]).toHaveTextContent("Troca de notebook");
  });
});
