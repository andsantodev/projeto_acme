import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("./upload-dialog", () => ({
  UploadDialog: () => <div>diálogo de envio</div>,
}));

vi.mock("./remove-document-dialog", () => ({
  RemoveDocumentDialog: ({ document }: { document: string }) => (
    <div>diálogo de remoção de {document}</div>
  ),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: () => {} }),
}));

import { DocumentsPanel } from "./documents-panel";

const DOCUMENTS = [
  {
    document: "acessos.md",
    chunks: 3,
    updatedAt: "2026-10-23T13:31:01.885Z",
  },
  {
    document: "ferias.md",
    chunks: 5,
    updatedAt: "2026-10-22T10:00:00.000Z",
  },
];

describe("DocumentsPanel", () => {
  it("lists each document with its chunk count and update date", () => {
    render(<DocumentsPanel documents={DOCUMENTS} />);

    expect(
      screen.getByRole("rowheader", { name: "acessos.md" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("rowheader", { name: "ferias.md" }),
    ).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getAllByText(/23\/10\/2026/).length).toBeGreaterThan(0);
  });

  it("shows the empty state and opens the dialog from it", () => {
    render(<DocumentsPanel documents={[]} />);

    expect(
      screen.getByText(
        "A base ainda não tem documentos. Envie o primeiro arquivo .md.",
      ),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Adicionar documento" }),
    );

    expect(screen.getByText("diálogo de envio")).toBeInTheDocument();
  });

  it("opens the removal dialog for the chosen document", () => {
    render(<DocumentsPanel documents={DOCUMENTS} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Remover acessos.md" }),
    );

    expect(
      screen.getByText("diálogo de remoção de acessos.md"),
    ).toBeInTheDocument();
  });

  it("shows the error state with a retry action when the list fails", () => {
    render(<DocumentsPanel documents={[]} listFailed />);

    expect(
      screen.getByText("Não foi possível carregar os documentos agora."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Tentar de novo" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("table")).toBeNull();
  });
});
