import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PageIntro } from "@/components/app-shell/page-intro";
import { RefreshButton } from "@/components/app-shell/refresh-button";
import { QueueList } from "@/components/tickets/queue-list";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { homeRouteFor } from "@/lib/navigation";
import { canAccess } from "@/lib/route-access";
import { requireUser } from "@/services/current-user";
import { listQueue } from "@/services/tickets";

export const metadata: Metadata = {
  title: "Fila de atendimento",
};

export default async function QueuePage() {
  const user = await requireUser();

  if (!canAccess(user.role, "queue")) {
    redirect(homeRouteFor(user.role));
  }

  const category = user.category === "rh" ? "RH" : "TI";
  const result = await listQueue();

  return (
    <div className="flex shrink-0 flex-col gap-6">
      <PageIntro
        title="Fila de atendimento"
        description={`Chamados de ${category} aguardando atendimento, do mais antigo para o mais novo.`}
      />

      {!result.ok ? (
        <ErrorState
          action={<RefreshButton />}
          message="Não foi possível carregar a fila de atendimento."
        />
      ) : result.tickets.length === 0 ? (
        <EmptyState
          message={`Nenhum chamado aguardando em ${category}.`}
        />
      ) : (
        <QueueList tickets={result.tickets} />
      )}
    </div>
  );
}
