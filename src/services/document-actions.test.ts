import { beforeEach, describe, expect, it, vi } from "vitest";

const getCurrentUser = vi.hoisted(() => vi.fn());
const uploadDocuments = vi.hoisted(() => vi.fn());
const listDocuments = vi.hoisted(() => vi.fn());
const removeDocument = vi.hoisted(() => vi.fn());
const revalidatePath = vi.hoisted(() => vi.fn());

vi.mock("./current-user", () => ({ getCurrentUser }));
vi.mock("./documents", () => ({ uploadDocuments, listDocuments, removeDocument }));
vi.mock("next/cache", () => ({ revalidatePath }));

import { removeDocumentAction, uploadDocumentsAction } from "./document-actions";

const TI_USER = { id: "u1", name: "TI", role: "atendente", category: "ti" };
const TEST_PASSWORD = "senha-de-teste";

function formDataWith(fields: {
  password: string;
  files?: File[];
}): FormData {
  const data = new FormData();

  data.set("password", fields.password);

  for (const file of fields.files ?? []) {
    data.append("files", file);
  }

  return data;
}

function markdownFile(name = "acessos.md", content = "# acessos") {
  return new File([content], name, { type: "text/markdown" });
}

describe("uploadDocumentsAction", () => {
  beforeEach(() => {
    process.env.DOCS_ADMIN_PASSWORD = TEST_PASSWORD;
    getCurrentUser.mockReset();
    uploadDocuments.mockReset();
    listDocuments.mockReset();
    removeDocument.mockReset();
    revalidatePath.mockReset();
    getCurrentUser.mockResolvedValue(TI_USER);
    listDocuments.mockResolvedValue({
      ok: true,
      documents: [{ document: "acessos.md", chunks: 3, updatedAt: "2026-10-23T13:31:01.885Z" }],
    });
  });

  it("rejects a wrong password without calling n8n", async () => {
    const result = await uploadDocumentsAction(
      {},
      formDataWith({ password: "errada", files: [markdownFile()] }),
    );

    expect(result).toEqual({ fieldError: "Senha incorreta." });
    expect(uploadDocuments).not.toHaveBeenCalled();
  });

  it("rejects a caller who is not the TI attendant", async () => {
    getCurrentUser.mockResolvedValue({
      ...TI_USER,
      category: "rh",
    });

    const result = await uploadDocumentsAction(
      {},
      formDataWith({ password: TEST_PASSWORD, files: [markdownFile()] }),
    );

    expect(result).toEqual({
      error: "Você não tem acesso à base de conhecimento.",
    });
    expect(uploadDocuments).not.toHaveBeenCalled();
  });

  it("rejects a file that is not .md before calling n8n", async () => {
    const result = await uploadDocumentsAction(
      {},
      formDataWith({
        password: TEST_PASSWORD,
        files: [new File(["x"], "curriculo.pdf", { type: "application/pdf" })],
      }),
    );

    expect(result).toEqual({
      fieldError: '"curriculo.pdf" não é um arquivo .md.',
    });
    expect(uploadDocuments).not.toHaveBeenCalled();
  });

  it("sends the files to n8n and revalidates the list", async () => {
    const file = markdownFile();
    uploadDocuments.mockResolvedValue({ ok: true, documents: ["acessos.md"] });

    const result = await uploadDocumentsAction(
      {},
      formDataWith({ password: TEST_PASSWORD, files: [file] }),
    );

    expect(uploadDocuments).toHaveBeenCalledWith([file]);
    expect(revalidatePath).toHaveBeenCalledWith("/documentos");
    expect(result).toEqual({ ok: true, documents: ["acessos.md"] });
  });

  it("shows a retry message when n8n is unavailable", async () => {
    uploadDocuments.mockResolvedValue({ ok: false, error: "unavailable" });

    const result = await uploadDocumentsAction(
      {},
      formDataWith({ password: TEST_PASSWORD, files: [markdownFile()] }),
    );

    expect(result).toEqual({
      error: "Não foi possível enviar os documentos. Tente de novo.",
    });
  });
});

function removeForm(fields: {
  password: string;
  document?: string;
  confirmed?: boolean;
}): FormData {
  const data = new FormData();

  data.set("password", fields.password);
  data.set("document", fields.document ?? "acessos.md");

  if (fields.confirmed ?? true) {
    data.set("confirmed", "yes");
  }

  return data;
}

describe("removeDocumentAction", () => {
  beforeEach(() => {
    process.env.DOCS_ADMIN_PASSWORD = TEST_PASSWORD;
    getCurrentUser.mockReset();
    listDocuments.mockReset();
    removeDocument.mockReset();
    revalidatePath.mockReset();
    getCurrentUser.mockResolvedValue(TI_USER);
    listDocuments.mockResolvedValue({
      ok: true,
      documents: [
        { document: "acessos.md", chunks: 3, updatedAt: "2026-10-23T13:31:01.885Z" },
      ],
    });
  });

  it("rejects a removal without the explicit confirmation", async () => {
    const result = await removeDocumentAction(
      {},
      removeForm({ password: TEST_PASSWORD, confirmed: false }),
    );

    expect(result).toEqual({ error: "Confirme a remoção do documento." });
    expect(removeDocument).not.toHaveBeenCalled();
  });

  it("rejects a wrong password without calling n8n", async () => {
    const result = await removeDocumentAction(
      {},
      removeForm({ password: "errada" }),
    );

    expect(result).toEqual({ fieldError: "Senha incorreta." });
    expect(removeDocument).not.toHaveBeenCalled();
  });

  it("rejects a caller who is not the TI attendant", async () => {
    getCurrentUser.mockResolvedValue({ ...TI_USER, category: "rh" });

    const result = await removeDocumentAction(
      {},
      removeForm({ password: TEST_PASSWORD }),
    );

    expect(result).toEqual({
      error: "Você não tem acesso à base de conhecimento.",
    });
    expect(removeDocument).not.toHaveBeenCalled();
  });

  it("refuses a document that is not in the list", async () => {
    const result = await removeDocumentAction(
      {},
      removeForm({ password: TEST_PASSWORD, document: "outro.md" }),
    );

    expect(result).toEqual({
      error: "Documento não encontrado. Atualize a lista e tente de novo.",
    });
    expect(removeDocument).not.toHaveBeenCalled();
  });

  it("removes only the chosen document and revalidates the list", async () => {
    removeDocument.mockResolvedValue({ ok: true });

    const result = await removeDocumentAction(
      {},
      removeForm({ password: TEST_PASSWORD }),
    );

    expect(removeDocument).toHaveBeenCalledWith("acessos.md");
    expect(revalidatePath).toHaveBeenCalledWith("/documentos");
    expect(result).toEqual({ ok: true });
  });

  it("keeps the document and shows a retry message when n8n fails", async () => {
    removeDocument.mockResolvedValue({ ok: false, error: "unavailable" });

    const result = await removeDocumentAction(
      {},
      removeForm({ password: TEST_PASSWORD }),
    );

    expect(result).toEqual({
      error: "Não foi possível remover o documento. Tente de novo.",
    });
  });
});
