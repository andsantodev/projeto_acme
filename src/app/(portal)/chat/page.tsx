import type { Metadata } from "next";

import { PageIntro } from "@/components/app-shell/page-intro";
import { EmptyNotice } from "@/components/app-shell/empty-notice";

export const metadata: Metadata = {
  title: "Assistente",
};

export default function ChatPage() {
  return (
    <>
      <PageIntro
        title="Assistente de onboarding"
        description="Respostas a partir dos documentos da empresa, com o documento de origem citado."
      />
      <EmptyNotice>Nenhuma pergunta feita nesta conversa.</EmptyNotice>
    </>
  );
}
