import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PageIntro } from "@/components/app-shell/page-intro";
import { ChatPanel } from "@/components/chat/chat-panel";
import { homeRouteFor } from "@/lib/navigation";
import { canAccess } from "@/lib/route-access";
import { requireUser } from "@/services/current-user";

export const metadata: Metadata = {
  title: "Assistente",
};

export default async function ChatPage() {
  const user = await requireUser();

  if (!canAccess(user.role, "assistant")) {
    redirect(homeRouteFor(user.role));
  }

  return (
    <>
      <PageIntro
        title="Assistente de onboarding"
        description="Respostas a partir dos documentos da empresa, com o documento de origem citado."
      />
      <ChatPanel />
    </>
  );
}
