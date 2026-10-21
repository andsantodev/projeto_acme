"use server";

import { validateHistory, validateQuestion } from "@/lib/rag";

import { getCurrentUser } from "./current-user";
import { requestRagAnswer } from "./rag";

export type AskAssistantInput = {
  question: string;
  history: unknown;
};

export type AskAssistantResult =
  | {
      ok: true;
      answer: string;
      sources: { document: string; excerpt: string }[];
      grounded: boolean;
    }
  | { ok: false; error: string };

export async function askAssistant(
  input: AskAssistantInput,
): Promise<AskAssistantResult> {
  const user = await getCurrentUser();

  if (!user) {
    return { ok: false, error: "Sua sessão expirou. Entre novamente." };
  }

  if (user.role !== "colaborador") {
    return { ok: false, error: "O assistente está disponível só para colaboradores." };
  }

  const question = validateQuestion(input.question ?? "");

  if (!question.ok) {
    return { ok: false, error: question.message };
  }

  const history = validateHistory(input.history ?? []);

  if (!history.ok) {
    return { ok: false, error: history.message };
  }

  const result = await requestRagAnswer(question.value, history.value);

  if ("error" in result) {
    return {
      ok: false,
      error:
        result.error === "timeout"
          ? "O assistente demorou demais para responder. Tente de novo ou abra um chamado."
          : "Não foi possível consultar o assistente agora. Tente de novo ou abra um chamado.",
    };
  }

  return {
    ok: true,
    answer: result.answer,
    sources: result.sources,
    grounded: result.grounded,
  };
}
