import "server-only";

import { redirect } from "next/navigation";

import type { AppUser, Role, TicketCategory } from "@/types/user";

import { createSupabaseServerClient } from "./supabase/server";

type ProfileRow = {
  id: string;
  display_name: string;
  role: Role;
  category: TicketCategory | null;
};

export async function getCurrentUser(): Promise<AppUser | null> {
  const supabase = await createSupabaseServerClient();

  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims.sub;

  if (!userId) {
    return null;
  }

  const { data: profile } = await supabase
    .from("acme_profiles")
    .select("id, display_name, role, category")
    .eq("id", userId)
    .maybeSingle<ProfileRow>();

  if (!profile) {
    return null;
  }

  return {
    id: profile.id,
    name: profile.display_name,
    role: profile.role,
    category: profile.category,
  };
}

export async function requireUser(): Promise<AppUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
