"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "./current-user";
import { createSupabaseServerClient } from "./supabase/server";

export type CloseTicketResult = { ok: true } | { ok: false; error: string };

export async function closeTicketAction(
  ticketId: string,
): Promise<CloseTicketResult> {
  const user = await getCurrentUser();

  if (!user) {
    return { ok: false, error: "Sua sessão expirou. Entre novamente." };
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
