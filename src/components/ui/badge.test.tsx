import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Badge } from "./badge";

describe("Badge", () => {
  it("renders its text with the neutral tone by default", () => {
    render(<Badge>Aberto</Badge>);

    const badge = screen.getByText("Aberto");
    expect(badge).toHaveAttribute("data-tone", "neutral");
  });

  it("carries the requested tone", () => {
    render(<Badge tone="positive">Respondido</Badge>);

    expect(screen.getByText("Respondido")).toHaveAttribute(
      "data-tone",
      "positive",
    );
  });
});
