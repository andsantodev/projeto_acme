import type { Role } from "@/types/user";

export type Area = "assistant" | "my-tickets" | "queue";

const AREAS_BY_ROLE: Record<Role, readonly Area[]> = {
  colaborador: ["assistant", "my-tickets"],
  atendente: ["queue"],
};

export function canAccess(role: Role, area: Area): boolean {
  return AREAS_BY_ROLE[role].includes(area);
}
