"use server";

import { redirect } from "next/navigation";

import { validateTicketInput, type TicketFieldErrors } from "@/lib/ticket";

import { getCurrentUser } from "@/services/current-user";
import { insertTicket } from "@/services/tickets";

export type NewTicketState = {
  errors?: TicketFieldErrors;
  formError?: string;
  values?: {
    category: string;
    title: string;
    description: string;
  };
};

export async function createTicketAction(
  _previousState: NewTicketState,
  formData: FormData,
): Promise<NewTicketState> {
  const user = await getCurrentUser();

  if (!user) {
    return { formError: "Sua sessão expirou. Entre novamente." };
  }

  if (user.role !== "colaborador") {
    return { formError: "Só colaboradores podem abrir chamados." };
  }

  const values = {
    category: String(formData.get("category") ?? ""),
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
  };

  const parsed = validateTicketInput(values);

  if (!parsed.ok) {
    return { errors: parsed.errors, values };
  }

  const created = await insertTicket({
    userId: user.id,
    category: parsed.value.category,
    title: parsed.value.title,
    description: parsed.value.description,
  });

  if (!created.ok) {
    return {
      formError: "Não foi possível abrir o chamado agora. Tente de novo.",
      values,
    };
  }

  redirect(`/chamados/${created.id}`);
}
