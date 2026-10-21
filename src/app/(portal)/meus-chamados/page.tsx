import type { Metadata } from "next";
import Link from "next/link";

import { PageIntro } from "@/components/app-shell/page-intro";
import { EmptyState } from "@/components/ui/states";

export const metadata: Metadata = {
  title: "Meus chamados",
};

export default function MyTicketsPage() {
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
