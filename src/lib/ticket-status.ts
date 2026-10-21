import type { BadgeTone } from "@/components/ui/badge";
import type { TicketCategory } from "@/types/user";
import type { TicketStatus } from "@/types/ticket";

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  aberto: "Aberto",
  em_andamento: "Em andamento",
  respondido: "Respondido",
  fechado: "Fechado",
};

export const TICKET_STATUS_TONES: Record<TicketStatus, BadgeTone> = {
  aberto: "warning",
  em_andamento: "neutral",
  respondido: "positive",
  fechado: "neutral",
};

export const TICKET_CATEGORY_LABELS: Record<TicketCategory, string> = {
  ti: "TI",
  rh: "RH",
};

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "America/Sao_Paulo",
});

export function formatTicketDate(isoDate: string): string {
  return dateFormatter.format(new Date(isoDate));
}
