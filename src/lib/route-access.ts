import type { Role, TicketCategory } from "@/types/user";

export type Area = "assistant" | "my-tickets" | "queue";

const AREAS_BY_ROLE: Record<Role, readonly Area[]> = {
  colaborador: ["assistant", "my-tickets"],
  atendente: ["queue"],
};

export function canAccess(role: Role, area: Area): boolean {
  return AREAS_BY_ROLE[role].includes(area);
}

/**
 * The knowledge base belongs to the TI attendant only. The check runs in the
 * page (404 for everyone else) and again in the upload action, because a
 * hidden nav item is not a permission.
 */
export function canManageDocuments(user: {
  role: Role;
  category: TicketCategory | null;
}): boolean {
  return user.role === "atendente" && user.category === "ti";
}
