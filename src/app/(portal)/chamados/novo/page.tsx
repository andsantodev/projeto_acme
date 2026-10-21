import type { Metadata } from "next";

import { PageIntro } from "@/components/app-shell/page-intro";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Abrir chamado",
};

export default async function NewTicketPage({
  searchParams,
}: PageProps<"/chamados/novo">) {
  const { pergunta } = await searchParams;
  const question = typeof pergunta === "string" ? pergunta : null;

  return (
    <>
      <PageIntro
        title="Abrir chamado"
        description="O formulário de abertura de chamado entra na F009."
      />

      {question ? (
        <Card title="Pergunta que originou o chamado">
          <p className="whitespace-pre-line">{question}</p>
        </Card>
      ) : (
        <p className="text-muted">
          Nenhuma pergunta foi passada para este chamado.
        </p>
      )}
    </>
  );
}
