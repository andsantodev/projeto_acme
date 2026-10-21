import "server-only";

import type { TicketDetail, TicketStatus, TicketSummary } from "@/types/ticket";
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

export type TicketDetailResult =
  | { ok: true; ticket: TicketDetail | null }
  | { ok: false };

type TicketDetailRow = {
  id: string;
  user_id: string;
  category: TicketCategory;
  status: TicketStatus;
  title: string;
  description: string;
  answer: string | null;
  answered_at: string | null;
  created_at: string;
};

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

export async function getTicket(id: string): Promise<TicketDetailResult> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("acme_tickets")
    .select(
      "id, user_id, category, status, title, description, answer, answered_at, created_at",
    )
    .eq("id", id)
    .maybeSingle<TicketDetailRow>();

  if (error) {
    return { ok: false };
  }

  if (!data) {
    return { ok: true, ticket: null };
  }

  return {
    ok: true,
    ticket: {
      id: data.id,
      userId: data.user_id,
      category: data.category,
      status: data.status,
      title: data.title,
      description: data.description,
      answer: data.answer,
      answeredAt: data.answered_at,
      createdAt: data.created_at,
    },
  };
}
