import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const removeDocumentAction = vi.hoisted(() => vi.fn());

vi.mock("@/services/document-actions", () => ({ removeDocumentAction }));

import { RemoveDocumentDialog } from "./remove-document-dialog";

describe("RemoveDocumentDialog", () => {
  beforeEach(() => {
    removeDocumentAction.mockReset();
  });

  it("shows the document name, the password and the confirmation", () => {
    render(<RemoveDocumentDialog document="acessos.md" onClose={() => {}} />);

    expect(screen.getByText("acessos.md")).toBeInTheDocument();
    expect(screen.getByLabelText("Senha")).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", { name: /Confirmo a remoção de acessos\.md/ }),
    ).toBeInTheDocument();
  });

  it("rejects a removal without the confirmation before calling the server", async () => {
    render(<RemoveDocumentDialog document="acessos.md" onClose={() => {}} />);

    fireEvent.click(screen.getByRole("button", { name: "Remover" }));

    expect(
      await screen.findByText("Confirme a remoção do documento."),
    ).toBeInTheDocument();
    expect(removeDocumentAction).not.toHaveBeenCalled();
  });

  it("shows the field error when the password is wrong", async () => {
    removeDocumentAction.mockResolvedValue({ fieldError: "Senha incorreta." });

    render(<RemoveDocumentDialog document="acessos.md" onClose={() => {}} />);
    fireEvent.click(
      screen.getByRole("checkbox", { name: /Confirmo a remoção/ }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Remover" }));

    expect(await screen.findByText("Senha incorreta.")).toBeInTheDocument();
  });

  it("closes the dialog after a successful removal", async () => {
    const onClose = vi.fn();

    removeDocumentAction.mockResolvedValue({ ok: true });

    render(<RemoveDocumentDialog document="acessos.md" onClose={onClose} />);
    fireEvent.click(
      screen.getByRole("checkbox", { name: /Confirmo a remoção/ }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Remover" }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });
});
