import type { Metadata } from "next";

import { EmptyNotice } from "@/components/app-shell/empty-notice";
import { PageIntro } from "@/components/app-shell/page-intro";

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
      <EmptyNotice>Nenhum chamado aguardando atendimento.</EmptyNotice>
    </>
  );
}
