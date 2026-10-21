import type { Metadata } from "next";

import { PageIntro } from "@/components/app-shell/page-intro";

export const metadata: Metadata = {
  title: "Chamado",
};

export default async function TicketDetailPage({ params }: PageProps<"/chamados/[id]">) {
  const { id } = await params;

  return (
    <>
      <PageIntro
        title="Chamado"
        description="Acompanhe a resposta do atendente e feche o chamado quando estiver resolvido."
      />
      <p className="text-muted">
        Identificador <span className="text-ink">{id}</span>
      </p>
    </>
  );
}
