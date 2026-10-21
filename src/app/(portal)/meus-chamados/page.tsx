import type { Metadata } from "next";
import Link from "next/link";

import { EmptyNotice } from "@/components/app-shell/empty-notice";
import { PageIntro } from "@/components/app-shell/page-intro";

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
      <EmptyNotice
        action={
          <Link
            className="font-medium text-ink underline underline-offset-[3px]"
            href="/chat"
          >
            Ir para o assistente
          </Link>
        }
      >
        Você ainda não abriu nenhum chamado.
      </EmptyNotice>
    </>
  );
}
