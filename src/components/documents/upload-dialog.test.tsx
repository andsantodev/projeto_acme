import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const uploadDocumentsAction = vi.hoisted(() => vi.fn());

vi.mock("@/services/document-actions", () => ({ uploadDocumentsAction }));

import { UploadDialog } from "./upload-dialog";

function chooseFile(name: string, content = "# documento") {
  const input = screen.getByLabelText("Arquivos .md") as HTMLInputElement;
  const file = new File([content], name, { type: "text/markdown" });

  fireEvent.change(input, { target: { files: [file] } });

  return input;
}

describe("UploadDialog", () => {
  beforeEach(() => {
    uploadDocumentsAction.mockReset();
  });

  it("renders the password, the file field and the submit button", () => {
    render(<UploadDialog onClose={() => {}} />);

    expect(screen.getByLabelText("Senha")).toBeInTheDocument();
    expect(screen.getByLabelText("Arquivos .md")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Enviar" })).toBeInTheDocument();
  });

  it("rejects a file that is not .md before calling the server", async () => {
    render(<UploadDialog onClose={() => {}} />);

    const input = screen.getByLabelText("Arquivos .md");

    fireEvent.change(input, {
      target: {
        files: [new File(["x"], "curriculo.pdf", { type: "application/pdf" })],
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Enviar" }));

    expect(
      await screen.findByText('"curriculo.pdf" não é um arquivo .md.'),
    ).toBeInTheDocument();
    expect(uploadDocumentsAction).not.toHaveBeenCalled();
  });

  it("keeps the chosen file when the password is wrong", async () => {
    uploadDocumentsAction.mockResolvedValue({ fieldError: "Senha incorreta." });

    render(<UploadDialog onClose={() => {}} />);
    const input = chooseFile("acessos.md");
    fireEvent.click(screen.getByRole("button", { name: "Enviar" }));

    expect(await screen.findByText("Senha incorreta.")).toBeInTheDocument();
    expect(input.files).toHaveLength(1);
    expect(input.files?.[0]?.name).toBe("acessos.md");
  });

  it("closes the dialog after a successful upload", async () => {
    const onClose = vi.fn();

    uploadDocumentsAction.mockResolvedValue({
      ok: true,
      documents: ["acessos.md"],
    });

    render(<UploadDialog onClose={onClose} />);
    chooseFile("acessos.md");
    fireEvent.click(screen.getByRole("button", { name: "Enviar" }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });
});
