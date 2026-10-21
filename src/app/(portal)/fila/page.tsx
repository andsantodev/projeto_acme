import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PageIntro } from "@/components/app-shell/page-intro";
import { EmptyState } from "@/components/ui/states";
import { homeRouteFor } from "@/lib/navigation";
import { canAccess } from "@/lib/route-access";
import { requireUser } from "@/services/current-user";

export const metadata: Metadata = {
  title: "Fila de atendimento",
};

export default async function QueuePage() {
  const user = await requireUser();

  if (!canAccess(user.role, "queue")) {
    redirect(homeRouteFor(user.role));
  }

  return (
    <>
      <PageIntro
        title="Fila de atendimento"
        description="Chamados abertos da sua categoria, do mais antigo para o mais novo."
      />
      <EmptyState message="Nenhum chamado aguardando atendimento." />
    </>
  );
}
