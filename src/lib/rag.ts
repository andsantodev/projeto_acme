export type ChatRole = "user" | "assistant";

export type Turn = {
  role: ChatRole;
  content: string;
};

export type Source = {
  document: string;
  excerpt: string;
};

export type RagAnswer = {
  answer: string;
  sources: Source[];
  grounded: boolean;
};

export const QUESTION_MAX = 500;
export const HISTORY_MAX_TURNS = 6;
export const HISTORY_MAX_CHARS = 1500;

type Validation<T> =
  | { ok: true; value: T }
  | { ok: false; message: string };

export function validateQuestion(raw: string): Validation<string> {
  const value = raw.trim();

  if (!value) {
    return { ok: false, message: "Escreva uma pergunta antes de enviar." };
  }

  if (value.length > QUESTION_MAX) {
    return {
      ok: false,
      message: `A pergunta pode ter no máximo ${QUESTION_MAX} caracteres.`,
    };
  }

  return { ok: true, value };
}

export function validateHistory(raw: unknown): Validation<Turn[]> {
  if (!Array.isArray(raw)) {
    return { ok: false, message: "Histórico inválido." };
  }

  if (raw.length > HISTORY_MAX_TURNS) {
    return {
      ok: false,
      message: `O histórico pode ter no máximo ${HISTORY_MAX_TURNS} turnos.`,
    };
  }

  const turns: Turn[] = [];

  for (const item of raw) {
    if (!item || typeof item !== "object") {
      return { ok: false, message: "Histórico inválido." };
    }

    const candidate = item as Record<string, unknown>;
    const role = candidate.role;
    const content = candidate.content;

    if (
      (role !== "user" && role !== "assistant") ||
      typeof content !== "string"
    ) {
      return { ok: false, message: "Histórico inválido." };
    }

    turns.push({ role, content });
  }

  const totalChars = turns.reduce((sum, turn) => sum + turn.content.length, 0);

  if (totalChars > HISTORY_MAX_CHARS) {
    return {
      ok: false,
      message: `O histórico pode ter no máximo ${HISTORY_MAX_CHARS} caracteres.`,
    };
  }

  return { ok: true, value: turns };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseRagResponse(raw: unknown): Validation<RagAnswer> {
  if (!isRecord(raw)) {
    return { ok: false, message: "Resposta do assistente inválida." };
  }

  const keys = Object.keys(raw).sort();

  if (JSON.stringify(keys) !== JSON.stringify(["answer", "grounded", "sources"])) {
    return { ok: false, message: "Resposta do assistente inválida." };
  }

  const { answer, grounded, sources } = raw;

  if (
    typeof answer !== "string" ||
    answer.trim().length === 0 ||
    typeof grounded !== "boolean" ||
    !Array.isArray(sources)
  ) {
    return { ok: false, message: "Resposta do assistente inválida." };
  }

  const parsedSources: Source[] = [];

  for (const source of sources) {
    if (!isRecord(source)) {
      return { ok: false, message: "Resposta do assistente inválida." };
    }

    const { document, excerpt } = source;

    if (
      typeof document !== "string" ||
      typeof excerpt !== "string" ||
      document.length === 0
    ) {
      return { ok: false, message: "Resposta do assistente inválida." };
    }

    parsedSources.push({ document, excerpt });
  }

  return {
    ok: true,
    value: { answer, sources: parsedSources, grounded },
  };
}
