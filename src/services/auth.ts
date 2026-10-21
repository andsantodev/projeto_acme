import "server-only";

import { createSupabaseServerClient } from "./supabase/server";

export async function signIn(
  email: string,
  password: string,
): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  return error === null;
}

export async function signOut(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
}
