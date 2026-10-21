import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  formatTicketDate,
  TICKET_CATEGORY_LABELS,
  TICKET_STATUS_LABELS,
  TICKET_STATUS_TONES,
} from "@/lib/ticket-status";
import type { TicketSummary } from "@/types/ticket";

export function TicketList({ tickets }: { tickets: TicketSummary[] }) {
  return (
    <ul className="overflow-hidden rounded-card border border-border bg-surface">
      {tickets.map((ticket) => (
        <li
          key={ticket.id}
          className="border-b border-rule last:border-b-0"
        >
          <Link
            className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-raised sm:flex-row sm:items-center sm:justify-between"
            href={`/chamados/${ticket.id}`}
          >
            <span className="min-w-0">
              <span className="block truncate font-medium">{ticket.title}</span>
              <span className="mt-1 block text-xs text-muted">
                {TICKET_CATEGORY_LABELS[ticket.category]} ·{" "}
                {formatTicketDate(ticket.createdAt)}
              </span>
            </span>
            <Badge tone={TICKET_STATUS_TONES[ticket.status]}>
              {TICKET_STATUS_LABELS[ticket.status]}
            </Badge>
          </Link>
        </li>
      ))}
    </ul>
  );
}
