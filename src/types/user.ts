export type Role = "colaborador" | "atendente";

export type TicketCategory = "ti" | "rh";

export type AppUser = {
  id: string;
  name: string;
  role: Role;
  category: TicketCategory | null;
};
