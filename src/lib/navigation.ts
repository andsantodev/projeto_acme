import type { AppUser } from "@/types/user";

export type NavItem = {
  href: "/chat" | "/meus-chamados" | "/chamados/novo" | "/fila" | "/documentos";
  label: string;
};

const COLABORADOR_NAV: readonly NavItem[] = [
  { href: "/chat", label: "Assistente" },
  { href: "/chamados/novo", label: "Novo chamado" },
  { href: "/meus-chamados", label: "Meus chamados" },
];

const QUEUE_NAV: readonly NavItem[] = [
  { href: "/fila", label: "Fila de atendimento" },
];

const TI_NAV: readonly NavItem[] = [
  { href: "/fila", label: "Fila de atendimento" },
  { href: "/documentos", label: "Base de conhecimento" },
];

export function navigationFor(
  user: Pick<AppUser, "role" | "category">,
): readonly NavItem[] {
  if (user.role === "atendente") {
    return user.category === "ti" ? TI_NAV : QUEUE_NAV;
  }

  return COLABORADOR_NAV;
}

export function homeRouteFor(role: AppUser["role"]): NavItem["href"] {
  return role === "atendente" ? "/fila" : "/chat";
}
