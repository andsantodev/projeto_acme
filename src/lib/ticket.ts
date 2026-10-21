import type { TicketCategory } from "@/types/user";

export const TICKET_TITLE_MIN = 5;
export const TICKET_TITLE_MAX = 120;
export const TICKET_DESCRIPTION_MIN = 10;
export const TICKET_DESCRIPTION_MAX = 4000;

export const TICKET_CATEGORIES: {
  value: TicketCategory;
  label: string;
  hint: string;
}[] = [
  {
    value: "ti",
    label: "TI",
    hint: "Acessos, equipamentos e sistemas",
  },
  {
    value: "rh",
    label: "RH",
    hint: "Benefícios, férias e pessoas",
  },
];

export type TicketFieldErrors = {
  category?: string;
  title?: string;
  description?: string;
};

export type TicketInput = {
  category: string;
  title: string;
  description: string;
};

export type ValidTicket = {
  category: TicketCategory;
  title: string;
  description: string;
};

type Validation =
  | { ok: true; value: ValidTicket }
  | { ok: false; errors: TicketFieldErrors };

export function validateTicketInput(input: TicketInput): Validation {
  const errors: TicketFieldErrors = {};
  const title = input.title.trim();
  const description = input.description.trim();

  if (input.category !== "ti" && input.category !== "rh") {
    errors.category = "Escolha TI ou RH.";
  }

  if (title.length < TICKET_TITLE_MIN) {
    errors.title = `O título precisa ter ao menos ${TICKET_TITLE_MIN} caracteres.`;
  } else if (title.length > TICKET_TITLE_MAX) {
    errors.title = `O título pode ter no máximo ${TICKET_TITLE_MAX} caracteres.`;
  }

  if (description.length < TICKET_DESCRIPTION_MIN) {
    errors.description = `A descrição precisa ter ao menos ${TICKET_DESCRIPTION_MIN} caracteres.`;
  } else if (description.length > TICKET_DESCRIPTION_MAX) {
    errors.description = `A descrição pode ter no máximo ${TICKET_DESCRIPTION_MAX} caracteres.`;
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      category: input.category as TicketCategory,
      title,
      description,
    },
  };
}

export function titleFromQuestion(question: string): string {
  return question.trim().slice(0, TICKET_TITLE_MAX);
}

const TICKET_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isTicketId(value: string): boolean {
  return TICKET_ID.test(value);
}
