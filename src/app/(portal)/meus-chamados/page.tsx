import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { PageIntro } from "@/components/app-shell/page-intro";
import { EmptyState } from "@/components/ui/states";
import { homeRouteFor } from "@/lib/navigation";
import { canAccess } from "@/lib/route-access";
import { requireUser } from "@/services/current-user";

export const metadata: Metadata = {
  title: "Meus chamados",
};

export default async function MyTicketsPage() {
  const user = await requireUser();

  if (!canAccess(user.role, "my-tickets")) {
    redirect(homeRouteFor(user.role));
  }

  return (
    <>
      <PageIntro
        title="Meus chamados"
        description="Chamados abertos por você e o status de cada um."
      />
      <EmptyState
        action={
          <Link
            className="font-medium text-ink underline underline-offset-[3px]"
            href="/chat"
          >
            Ir para o assistente
          </Link>
        }
        message="Você ainda não abriu nenhum chamado."
      />
    </>
  );
}
