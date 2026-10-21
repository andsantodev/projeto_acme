import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RefreshButton } from "@/components/app-shell/refresh-button";
import { TicketDetailView } from "@/components/tickets/ticket-detail";
import { ErrorState } from "@/components/ui/states";
import { isTicketId } from "@/lib/ticket";
import { requireUser } from "@/services/current-user";
import { getTicket } from "@/services/tickets";

export const metadata: Metadata = {
  title: "Chamado",
};

export default async function TicketDetailPage({
  params,
}: PageProps<"/chamados/[id]">) {
  const user = await requireUser();
  const { id } = await params;

  if (!isTicketId(id)) {
    notFound();
  }

  const result = await getTicket(id);

  if (!result.ok) {
    return (
      <ErrorState
        action={<RefreshButton />}
        message="Não foi possível carregar o chamado."
      />
    );
  }

  if (!result.ticket) {
    notFound();
  }

  const attendant = user.role === "atendente";
  const canAnswer =
    attendant &&
    result.ticket.answer === null &&
    (result.ticket.status === "aberto" ||
      result.ticket.status === "em_andamento");

  return (
    <TicketDetailView
      backHref={attendant ? "/fila" : "/meus-chamados"}
      backLabel={
        attendant ? "Voltar para a fila" : "Voltar para meus chamados"
      }
      canAnswer={canAnswer}
      owner={result.ticket.userId === user.id}
      ticket={result.ticket}
    />
  );
}
