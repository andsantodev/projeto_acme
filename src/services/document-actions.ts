"use server";

import { timingSafeEqual } from "node:crypto";

import { revalidatePath } from "next/cache";

import { isValidDocumentName, validateDocumentFiles } from "@/lib/documents";

import { getCurrentUser } from "./current-user";
import { listDocuments, removeDocument, uploadDocuments } from "./documents";

export type UploadDocumentsState = {
  fieldError?: string;
  error?: string;
  ok?: boolean;
  documents?: string[];
};

function passwordsMatch(received: string, expected: string): boolean {
  const left = Buffer.from(received);
  const right = Buffer.from(expected);

  if (left.length !== right.length) {
    return false;
  }

  return timingSafeEqual(left, right);
}

function filesFrom(formData: FormData): File[] {
  return formData
    .getAll("files")
    .filter((entry): entry is File => entry instanceof File && entry.name !== "");
}

export async function uploadDocumentsAction(
  _previousState: UploadDocumentsState,
  formData: FormData,
): Promise<UploadDocumentsState> {
  const user = await getCurrentUser();

  if (!user) {
    return { error: "Sua sessão expirou. Entre novamente." };
  }

  if (user.role !== "atendente" || user.category !== "ti") {
    return { error: "Você não tem acesso à base de conhecimento." };
  }

  const expected = process.env.DOCS_ADMIN_PASSWORD;
  const password = String(formData.get("password") ?? "");

  if (!expected || !passwordsMatch(password, expected)) {
    return { fieldError: "Senha incorreta." };
  }

  const files = filesFrom(formData);
  const check = validateDocumentFiles(files);

  if (!check.ok) {
    return { fieldError: check.error };
  }

  const result = await uploadDocuments(files);

  if (!result.ok) {
    const message =
      result.error === "timeout"
        ? "O envio demorou demais. Tente de novo com menos arquivos."
        : "Não foi possível enviar os documentos. Tente de novo.";

    return { error: message };
  }

  revalidatePath("/documentos");

  return { ok: true, documents: result.documents };
}

export type RemoveDocumentState = {
  fieldError?: string;
  error?: string;
  ok?: boolean;
};

export async function removeDocumentAction(
  _previousState: RemoveDocumentState,
  formData: FormData,
): Promise<RemoveDocumentState> {
  const user = await getCurrentUser();

  if (!user) {
    return { error: "Sua sessão expirou. Entre novamente." };
  }

  if (user.role !== "atendente" || user.category !== "ti") {
    return { error: "Você não tem acesso à base de conhecimento." };
  }

  if (formData.get("confirmed") !== "yes") {
    return { error: "Confirme a remoção do documento." };
  }

  const expected = process.env.DOCS_ADMIN_PASSWORD;
  const password = String(formData.get("password") ?? "");

  if (!expected || !passwordsMatch(password, expected)) {
    return { fieldError: "Senha incorreta." };
  }

  const document = String(formData.get("document") ?? "").trim();

  if (!isValidDocumentName(document)) {
    return { error: "Documento inválido." };
  }

  const list = await listDocuments();

  if (!list.ok) {
    return { error: "Não foi possível conferir a lista agora. Tente de novo." };
  }

  if (!list.documents.some((row) => row.document === document)) {
    return { error: "Documento não encontrado. Atualize a lista e tente de novo." };
  }

  const result = await removeDocument(document);

  if (!result.ok) {
    return { error: "Não foi possível remover o documento. Tente de novo." };
  }

  revalidatePath("/documentos");

  return { ok: true };
}
