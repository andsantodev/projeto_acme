import "server-only";

import type { TicketStatus, TicketSummary } from "@/types/ticket";
import type { TicketCategory } from "@/types/user";

import { createSupabaseServerClient } from "./supabase/server";

type TicketRow = {
  id: string;
  title: string;
  category: TicketCategory;
  status: TicketStatus;
  created_at: string;
};

export type NewTicket = {
  userId: string;
  category: TicketCategory;
  title: string;
  description: string;
};

export type CreatedTicket = { ok: true; id: string } | { ok: false };

export type TicketListResult =
  | { ok: true; tickets: TicketSummary[] }
  | { ok: false };

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

export async function listMyTickets(): Promise<TicketListResult> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("acme_tickets")
    .select("id, title, category, status, created_at")
    .order("created_at", { ascending: false })
    .returns<TicketRow[]>();

  if (error || !data) {
    return { ok: false };
  }

  return {
    ok: true,
    tickets: data.map((row) => ({
      id: row.id,
      title: row.title,
      category: row.category,
      status: row.status,
      createdAt: row.created_at,
    })),
  };
}
