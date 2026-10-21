import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { PageIntro } from "@/components/app-shell/page-intro";
import { RefreshButton } from "@/components/app-shell/refresh-button";
import { TicketList } from "@/components/tickets/ticket-list";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { homeRouteFor } from "@/lib/navigation";
import { canAccess } from "@/lib/route-access";
import { requireUser } from "@/services/current-user";
import { listMyTickets } from "@/services/tickets";

export const metadata: Metadata = {
  title: "Meus chamados",
};

const primaryLink =
  "inline-flex h-8 items-center rounded-control bg-ink px-3 font-medium text-surface transition-colors hover:bg-ink/90";

export default async function MyTicketsPage() {
  const user = await requireUser();

  if (!canAccess(user.role, "my-tickets")) {
    redirect(homeRouteFor(user.role));
  }

  const result = await listMyTickets();

  return (
    <div className="flex shrink-0 flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageIntro
          title="Meus chamados"
          description="Chamados abertos por você e o status de cada um."
        />
        <Link className={primaryLink} href="/chamados/novo">
          Novo chamado
        </Link>
      </div>

      {!result.ok ? (
        <ErrorState
          action={<RefreshButton />}
          message="Não foi possível carregar seus chamados."
        />
      ) : result.tickets.length === 0 ? (
        <EmptyState
          action={
            <div className="flex flex-col items-center gap-2">
              <Link
                className="font-medium text-ink underline underline-offset-[3px]"
                href="/chamados/novo"
              >
                Abrir chamado
              </Link>
              <Link
                className="text-sm text-muted underline underline-offset-[3px]"
                href="/chat"
              >
                Perguntar ao assistente
              </Link>
            </div>
          }
          message="Você ainda não abriu nenhum chamado."
        />
      ) : (
        <TicketList tickets={result.tickets} />
      )}
    </div>
  );
}
