import "server-only";

import { saoPauloDay } from "@/lib/chat-usage";

import { createSupabaseServerClient } from "./supabase/server";

export type QuestionStatus = {
  used: number;
  remaining: number;
};

export type ConsumedQuestion = {
  allowed: boolean;
  remaining: number;
};

function firstRow(data: unknown): Record<string, unknown> | null {
  const row = Array.isArray(data) ? data[0] : data;

  return row && typeof row === "object" ? (row as Record<string, unknown>) : null;
}

export async function getQuestionStatus(): Promise<QuestionStatus | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("acme_question_status", {
    p_day: saoPauloDay(new Date()),
  });
  const row = firstRow(data);

  if (error || !row) {
    return null;
  }

  return {
    used: Number(row.used ?? 0),
    remaining: Number(row.remaining ?? 0),
  };
}

export async function consumeQuestion(): Promise<ConsumedQuestion | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("acme_consume_question");
  const row = firstRow(data);

  if (error || !row) {
    return null;
  }

  return {
    allowed: Boolean(row.allowed),
    remaining: Number(row.remaining ?? 0),
  };
}
