import type { Metadata } from "next";

import { PageIntro } from "@/components/app-shell/page-intro";
import { EmptyState } from "@/components/ui/states";

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
      <EmptyState message="Nenhuma pergunta feita nesta conversa." />
    </>
  );
}
