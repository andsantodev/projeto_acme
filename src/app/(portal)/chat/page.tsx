import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PageIntro } from "@/components/app-shell/page-intro";
import { ChatPanel } from "@/components/chat/chat-panel";
import { homeRouteFor } from "@/lib/navigation";
import { canAccess } from "@/lib/route-access";
import { getQuestionStatus } from "@/services/chat-usage";
import { requireUser } from "@/services/current-user";

export const metadata: Metadata = {
  title: "Assistente",
};

export default async function ChatPage() {
  const user = await requireUser();

  if (!canAccess(user.role, "assistant")) {
    redirect(homeRouteFor(user.role));
  }

  const status = await getQuestionStatus();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0">
        <PageIntro
          title="Assistente de onboarding"
          description="Respostas a partir dos documentos da empresa, com o documento de origem citado."
        />
      </div>
      <ChatPanel initialRemaining={status?.remaining ?? null} />
    </div>
  );
}
