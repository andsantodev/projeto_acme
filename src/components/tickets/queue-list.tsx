import Link from "next/link";

import { AssumeButton } from "@/components/tickets/assume-button";
import { Badge } from "@/components/ui/badge";
import { formatAge, type QueueItem } from "@/lib/queue";
import {
  TICKET_CATEGORY_LABELS,
  TICKET_STATUS_LABELS,
  TICKET_STATUS_TONES,
} from "@/lib/ticket-status";

export function QueueList({
  now,
  tickets,
}: {
  now?: Date;
  tickets: QueueItem[];
}) {
  const reference = now ?? new Date();

  return (
    <ul className="overflow-hidden rounded-card border border-border bg-surface">
      {tickets.map((ticket) => (
        <li
          key={ticket.id}
          className="flex flex-col gap-3 border-b border-rule px-5 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
        >
          <Link className="min-w-0 flex-1" href={`/chamados/${ticket.id}`}>
            <span className="block truncate font-medium">{ticket.title}</span>
            <span className="mt-1 block text-xs text-muted">
              {ticket.requesterName} ·{" "}
              {TICKET_CATEGORY_LABELS[ticket.category]} ·{" "}
              {formatAge(ticket.createdAt, reference)}
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Badge tone={TICKET_STATUS_TONES[ticket.status]}>
              {TICKET_STATUS_LABELS[ticket.status]}
            </Badge>
            {ticket.status === "aberto" ? (
              <AssumeButton ticketId={ticket.id} />
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
