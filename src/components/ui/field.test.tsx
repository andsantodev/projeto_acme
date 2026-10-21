import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Field } from "./field";
import { Input } from "./input";
import { Textarea } from "./textarea";

function describedByIds(element: HTMLElement): string[] {
  return element.getAttribute("aria-describedby")?.split(" ") ?? [];
}

describe("Field", () => {
  it("associates the control with its label, hint and error", () => {
    render(
      <Field
        error="Informe o e-mail corporativo"
        hint="Ex.: nome@empresa.com"
        label="E-mail"
      >
        <Input />
      </Field>,
    );

    const input = screen.getByLabelText("E-mail");
    const ids = describedByIds(input);

    expect(ids).toContain(screen.getByText("Ex.: nome@empresa.com").id);
    expect(ids).toContain(
      screen.getByText("Informe o e-mail corporativo").id,
    );
    expect(input).toBeInvalid();
  });

  it("keeps the control valid when there is no error", () => {
    render(
      <Field hint="Mínimo de 10 caracteres" label="Descrição">
        <Textarea />
      </Field>,
    );

    const textarea = screen.getByLabelText("Descrição");
    const ids = describedByIds(textarea);

    expect(ids).toContain(
      screen.getByText("Mínimo de 10 caracteres").id,
    );
    expect(ids).toHaveLength(1);
    expect(textarea).not.toBeInvalid();
  });
});
