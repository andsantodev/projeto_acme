export const ANSWER_MAX = 4000;

type Validation =
  | { ok: true; value: string }
  | { ok: false; message: string };

export function validateAnswer(raw: string): Validation {
  const value = raw.trim();

  if (!value) {
    return { ok: false, message: "Escreva uma resposta antes de enviar." };
  }

  if (value.length > ANSWER_MAX) {
    return {
      ok: false,
      message: `A resposta pode ter no máximo ${ANSWER_MAX} caracteres.`,
    };
  }

  return { ok: true, value };
}
