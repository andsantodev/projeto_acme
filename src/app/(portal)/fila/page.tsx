import type { Metadata } from "next";

import { PageIntro } from "@/components/app-shell/page-intro";
import { EmptyState } from "@/components/ui/states";

export const metadata: Metadata = {
  title: "Fila de atendimento",
};

export default function QueuePage() {
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
