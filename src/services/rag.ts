import "server-only";

import {
  parseRagResponse,
  type RagAnswer,
  type Turn,
} from "@/lib/rag";

const TIMEOUT_MS = 30_000;

export type RagFailure = {
  error: "unavailable" | "timeout" | "invalid";
};

function isTimeout(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    (error.name === "TimeoutError" || error.name === "AbortError")
  );
}

export async function requestRagAnswer(
  question: string,
  history: Turn[],
): Promise<RagAnswer | RagFailure> {
  const url = process.env.N8N_RAG_WEBHOOK_URL;
  const secret = process.env.N8N_RAG_SECRET;

  if (!url || !secret) {
    return { error: "unavailable" };
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-acme-secret": secret,
      },
      body: JSON.stringify({ question, history }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });

    if (!response.ok) {
      return { error: "unavailable" };
    }

    const body = await response.json().catch(() => null);
    const parsed = parseRagResponse(body);

    return parsed.ok ? parsed.value : { error: "invalid" };
  } catch (error) {
    return { error: isTimeout(error) ? "timeout" : "unavailable" };
  }
}
