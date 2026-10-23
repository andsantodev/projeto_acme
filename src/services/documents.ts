import "server-only";

import type { DocumentSummary } from "@/types/document";

import { createSupabaseServerClient } from "./supabase/server";

const TIMEOUT_MS = 30_000;

type DocumentRow = {
  document: string;
  chunks: number;
  updated_at: string;
};

export type ListDocumentsResult =
  | { ok: true; documents: DocumentSummary[] }
  | { ok: false };

export async function listDocuments(): Promise<ListDocumentsResult> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("acme_list_documents");

  if (error || !data) {
    return { ok: false };
  }

  return {
    ok: true,
    documents: (data as DocumentRow[]).map((row) => ({
      document: row.document,
      chunks: row.chunks,
      updatedAt: row.updated_at,
    })),
  };
}

export type UploadDocumentsResult =
  | { ok: true; documents: string[] }
  | { ok: false; error: "unavailable" | "timeout" | "invalid" };

function isTimeout(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    (error.name === "TimeoutError" || error.name === "AbortError")
  );
}

function parseUploadResponse(body: unknown): string[] | null {
  if (typeof body !== "object" || body === null) {
    return null;
  }

  const value = body as { ok?: unknown; documents?: unknown };

  if (value.ok !== true || !Array.isArray(value.documents)) {
    return null;
  }

  return value.documents.filter(
    (item): item is string => typeof item === "string",
  );
}

export async function uploadDocuments(
  files: readonly File[],
): Promise<UploadDocumentsResult> {
  const url = process.env.N8N_UPLOAD_WEBHOOK_URL;
  const secret = process.env.N8N_RAG_SECRET;

  if (!url || !secret) {
    return { ok: false, error: "unavailable" };
  }

  const body = new FormData();

  for (const file of files) {
    body.append("files", file, file.name);
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "x-acme-secret": secret },
      body,
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });

    if (!response.ok) {
      return { ok: false, error: "unavailable" };
    }

    const parsed = parseUploadResponse(await response.json().catch(() => null));

    return parsed
      ? { ok: true, documents: parsed }
      : { ok: false, error: "invalid" };
  } catch (error) {
    return { ok: false, error: isTimeout(error) ? "timeout" : "unavailable" };
  }
}

export type RemoveDocumentResult =
  | { ok: true }
  | { ok: false; error: "unavailable" | "timeout" | "invalid" };

export async function removeDocument(
  document: string,
): Promise<RemoveDocumentResult> {
  const url = process.env.N8N_REMOVE_WEBHOOK_URL;
  const secret = process.env.N8N_RAG_SECRET;

  if (!url || !secret) {
    return { ok: false, error: "unavailable" };
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-acme-secret": secret,
      },
      body: JSON.stringify({ document }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });

    if (!response.ok) {
      return { ok: false, error: "unavailable" };
    }

    const body = await response.json().catch(() => null);

    return typeof body === "object" && body !== null && body.ok === true
      ? { ok: true }
      : { ok: false, error: "invalid" };
  } catch (error) {
    return { ok: false, error: isTimeout(error) ? "timeout" : "unavailable" };
  }
}
