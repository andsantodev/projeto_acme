import "server-only";

import type { AppUser } from "@/types/user";

/**
 * Placeholder session for the skeleton. F004 replaces the body of this
 * service with the Supabase session read through `@supabase/ssr`, keeping the
 * same exported function so callers do not change.
 */
export function getCurrentUser(): AppUser {
  return {
    id: "placeholder-colaborador",
    name: "Ana",
    role: "colaborador",
    category: null,
  };
}
