"use server";

import { DAILY_QUESTION_LIMIT } from "@/lib/chat-usage";
import { validateHistory, validateQuestion } from "@/lib/rag";

import { consumeQuestion } from "./chat-usage";
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
      remaining: number | null;
    }
  | {
      ok: false;
      error: string;
      remaining: number | null;
      limitReached?: boolean;
    };

export async function askAssistant(
  input: AskAssistantInput,
): Promise<AskAssistantResult> {
  const user = await getCurrentUser();

  if (!user) {
    return { ok: false, error: "Sua sessão expirou. Entre novamente.", remaining: null };
  }

  if (user.role !== "colaborador") {
    return {
      ok: false,
      error: "O assistente está disponível só para colaboradores.",
      remaining: null,
    };
  }

  const question = validateQuestion(input.question ?? "");

  if (!question.ok) {
    return { ok: false, error: question.message, remaining: null };
  }

  const history = validateHistory(input.history ?? []);

  if (!history.ok) {
    return { ok: false, error: history.message, remaining: null };
  }

  const consumed = await consumeQuestion();

  if (!consumed) {
    return {
      ok: false,
      error: "Não foi possível verificar seu limite de perguntas agora. Tente de novo.",
      remaining: null,
    };
  }

  if (!consumed.allowed) {
    return {
      ok: false,
      error: `Você atingiu o limite de ${DAILY_QUESTION_LIMIT} perguntas hoje. Abra um chamado para o time responsável.`,
      remaining: 0,
      limitReached: true,
    };
  }

  const result = await requestRagAnswer(question.value, history.value);

  if ("error" in result) {
    return {
      ok: false,
      error:
        result.error === "timeout"
          ? "O assistente demorou demais para responder. Tente de novo ou abra um chamado."
          : "Não foi possível consultar o assistente agora. Tente de novo ou abra um chamado.",
      remaining: consumed.remaining,
    };
  }

  return {
    ok: true,
    answer: result.answer,
    sources: result.sources,
    grounded: result.grounded,
    remaining: consumed.remaining,
  };
}
