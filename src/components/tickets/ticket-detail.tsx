import Link from "next/link";

import { AnswerForm } from "@/components/tickets/answer-form";
import { CloseTicketButton } from "@/components/tickets/close-ticket-button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  canCloseTicket,
  formatTicketDate,
  showsAnswer,
  SIMULATION_NOTICE,
  TICKET_CATEGORY_LABELS,
  TICKET_STATUS_LABELS,
  TICKET_STATUS_TONES,
} from "@/lib/ticket-status";
import type { TicketDetail } from "@/types/ticket";

export function TicketDetailView({
  backHref,
  backLabel,
  canAnswer,
  owner,
  ticket,
}: {
  backHref: "/meus-chamados" | "/fila";
  backLabel: string;
  canAnswer: boolean;
  owner: boolean;
  ticket: TicketDetail;
}) {
  const answerVisible = showsAnswer(ticket.status) && ticket.answer;

  return (
    <div className="flex shrink-0 flex-col gap-6">
      <Link
        className="w-fit text-sm text-muted underline underline-offset-[3px]"
        href={backHref}
      >
        {backLabel}
      </Link>

      <header className="flex flex-col gap-2">
        <h1 className="text-title font-semibold">{ticket.title}</h1>
        <p className="flex flex-wrap items-center gap-2 text-sm text-muted">
          <span>
            {TICKET_CATEGORY_LABELS[ticket.category]} · Aberto em{" "}
            {formatTicketDate(ticket.createdAt)}
          </span>
          <Badge tone={TICKET_STATUS_TONES[ticket.status]}>
            {TICKET_STATUS_LABELS[ticket.status]}
          </Badge>
        </p>
      </header>

      <Card title="Descrição">
        <p className="whitespace-pre-line">{ticket.description}</p>
      </Card>

      {canAnswer ? (
        <Card title="Responder ao colaborador">
          <AnswerForm ticketId={ticket.id} />
        </Card>
      ) : null}

      {answerVisible ? (
        <Card title="Resposta do atendente">
          <p className="whitespace-pre-line">{ticket.answer}</p>
          {ticket.answeredAt ? (
            <p className="mt-2 text-xs text-muted">
              Respondido em {formatTicketDate(ticket.answeredAt)}
            </p>
          ) : null}
          <p className="mt-3 text-xs text-muted">{SIMULATION_NOTICE}</p>
        </Card>
      ) : null}

      {canCloseTicket({ owner, status: ticket.status }) ? (
        <CloseTicketButton ticketId={ticket.id} />
      ) : null}
    </div>
  );
}
