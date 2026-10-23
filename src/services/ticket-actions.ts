"use server";

import { revalidatePath } from "next/cache";

import { validateAnswer } from "@/lib/answer";
import { isTicketId } from "@/lib/ticket";

import { getCurrentUser } from "./current-user";
import { createSupabaseServerClient } from "./supabase/server";

export type CloseTicketResult = { ok: true } | { ok: false; error: string };

export type AssumeTicketResult = { ok: true } | { ok: false; error: string };

export async function assumeTicketAction(
  ticketId: string,
): Promise<AssumeTicketResult> {
  const user = await getCurrentUser();

  if (!user) {
    return { ok: false, error: "Sua sessão expirou. Entre novamente." };
  }

  if (!isTicketId(ticketId)) {
    return { ok: false, error: "Chamado não encontrado." };
  }

  if (user.role !== "atendente") {
    return { ok: false, error: "Só atendentes podem assumir chamados." };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("acme_tickets")
    .update({ status: "em_andamento" })
    .eq("id", ticketId)
    .eq("status", "aberto")
    .select("id");

  if (error || !data || data.length === 0) {
    return {
      ok: false,
      error: "Não foi possível assumir este chamado. Atualize a fila e tente de novo.",
    };
  }

  revalidatePath("/fila");
  revalidatePath(`/chamados/${ticketId}`);

  return { ok: true };
}

export async function closeTicketAction(
  ticketId: string,
): Promise<CloseTicketResult> {
  const user = await getCurrentUser();

  if (!user) {
    return { ok: false, error: "Sua sessão expirou. Entre novamente." };
  }

  if (!isTicketId(ticketId)) {
    return { ok: false, error: "Chamado não encontrado." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("acme_close_ticket", {
    p_ticket_id: ticketId,
  });

  if (error) {
    return {
      ok: false,
      error:
        "Não foi possível fechar o chamado. Atualize a página e tente de novo.",
    };
  }

  revalidatePath(`/chamados/${ticketId}`);
  revalidatePath("/meus-chamados");

  return { ok: true };
}

export type AnswerTicketState = {
  error?: string;
  fieldError?: string;
};

export async function answerTicketAction(
  _previousState: AnswerTicketState,
  formData: FormData,
): Promise<AnswerTicketState> {
  const user = await getCurrentUser();

  if (!user) {
    return { error: "Sua sessão expirou. Entre novamente." };
  }

  if (user.role !== "atendente") {
    return { error: "Só atendentes podem responder chamados." };
  }

  const ticketId = String(formData.get("ticketId") ?? "");

  if (!isTicketId(ticketId)) {
    return { error: "Chamado não encontrado." };
  }

  const parsed = validateAnswer(String(formData.get("answer") ?? ""));

  if (!parsed.ok) {
    return { fieldError: parsed.message };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("acme_tickets")
    .update({
      answer: parsed.value,
      answered_at: new Date().toISOString(),
      status: "respondido",
    })
    .eq("id", ticketId)
    .is("answer", null)
    .select("id");

  if (error) {
    return { error: "Não foi possível salvar a resposta agora. Tente de novo." };
  }

  if (!data || data.length === 0) {
    return {
      error:
        "Este chamado já foi respondido ou não está disponível para você.",
    };
  }

  revalidatePath(`/chamados/${ticketId}`);
  revalidatePath("/fila");

  return {};
}
