import type { AppUser } from "@/types/user";

export function roleLabel(user: AppUser): string {
  if (user.role === "colaborador") {
    return "Colaborador";
  }

  if (user.category === "ti") {
    return "Atendente de TI";
  }

  if (user.category === "rh") {
    return "Atendente de RH";
  }

  return "Atendente";
}
