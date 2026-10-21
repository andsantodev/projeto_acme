import "server-only";

import type { TicketCategory } from "@/types/user";

import { createSupabaseServerClient } from "./supabase/server";

export type NewTicket = {
  userId: string;
  category: TicketCategory;
  title: string;
  description: string;
};

export type CreatedTicket = { ok: true; id: string } | { ok: false };

export async function insertTicket(ticket: NewTicket): Promise<CreatedTicket> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("acme_tickets")
    .insert({
      user_id: ticket.userId,
      category: ticket.category,
      title: ticket.title,
      description: ticket.description,
    })
    .select("id")
    .single<{ id: string }>();

  if (error || !data) {
    return { ok: false };
  }

  return { ok: true, id: data.id };
}
