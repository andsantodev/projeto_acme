import type { TicketCategory } from "./user";

export type TicketStatus = "aberto" | "em_andamento" | "respondido" | "fechado";

export type TicketSummary = {
  id: string;
  title: string;
  category: TicketCategory;
  status: TicketStatus;
  createdAt: string;
};
