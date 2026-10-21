import type { Role } from "@/types/user";

export type NavItem = {
  href: "/chat" | "/meus-chamados" | "/fila";
  label: string;
};

const NAV_BY_ROLE: Record<Role, readonly NavItem[]> = {
  colaborador: [
    { href: "/chat", label: "Assistente" },
    { href: "/meus-chamados", label: "Meus chamados" },
  ],
  atendente: [{ href: "/fila", label: "Fila de atendimento" }],
};

export function navigationFor(role: Role): readonly NavItem[] {
  return NAV_BY_ROLE[role];
}

export function homeRouteFor(role: Role): NavItem["href"] {
  return role === "atendente" ? "/fila" : "/chat";
}
