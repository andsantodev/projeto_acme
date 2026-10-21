import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PageIntro } from "@/components/app-shell/page-intro";
import { Card } from "@/components/ui/card";
import { titleFromQuestion } from "@/lib/ticket";
import { requireUser } from "@/services/current-user";

import { NewTicketForm } from "./new-ticket-form";

export const metadata: Metadata = {
  title: "Abrir chamado",
};

export default async function NewTicketPage({
  searchParams,
}: PageProps<"/chamados/novo">) {
  const user = await requireUser();

  if (user.role !== "colaborador") {
    redirect("/fila");
  }

  const { pergunta } = await searchParams;
  const question = typeof pergunta === "string" ? pergunta : "";

  return (
    <>
      <PageIntro
        title="Abrir chamado"
        description="Conte o que aconteceu. O chamado entra na fila de TI ou de RH."
      />
      <Card>
        <NewTicketForm
          initialDescription={question}
          initialTitle={titleFromQuestion(question)}
        />
      </Card>
    </>
  );
}
