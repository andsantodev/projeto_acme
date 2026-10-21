import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { navigationFor } from "@/lib/navigation";

import { PortalNav } from "./portal-nav";

const currentPath = vi.hoisted(() => ({ value: "/chat" }));

vi.mock("next/navigation", () => ({
  usePathname: () => currentPath.value,
}));

describe("PortalNav", () => {
  beforeEach(() => {
    currentPath.value = "/chat";
  });

  it("renders the destinations of the current role", () => {
    render(<PortalNav items={navigationFor("colaborador")} />);

    expect(screen.getByRole("link", { name: "Assistente" })).toHaveAttribute(
      "href",
      "/chat",
    );
    expect(
      screen.getByRole("link", { name: "Meus chamados" }),
    ).toHaveAttribute("href", "/meus-chamados");
    expect(screen.queryByRole("link", { name: "Fila de atendimento" })).toBeNull();
  });

  it("marks the current destination and only it", () => {
    render(<PortalNav items={navigationFor("colaborador")} />);

    expect(screen.getByRole("link", { name: "Assistente" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(
      screen.getByRole("link", { name: "Meus chamados" }),
    ).not.toHaveAttribute("aria-current");
  });

  it("marks the queue when it is the current path", () => {
    currentPath.value = "/fila";

    render(<PortalNav items={navigationFor("atendente")} />);

    expect(
      screen.getByRole("link", { name: "Fila de atendimento" }),
    ).toHaveAttribute("aria-current", "page");
  });
});
