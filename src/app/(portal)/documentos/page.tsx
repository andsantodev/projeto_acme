import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageIntro } from "@/components/app-shell/page-intro";
import { DocumentsPanel } from "@/components/documents/documents-panel";
import { canManageDocuments } from "@/lib/route-access";
import { requireUser } from "@/services/current-user";
import { listDocuments } from "@/services/documents";

export const metadata: Metadata = {
  title: "Base de conhecimento",
};

export default async function DocumentsPage() {
  const user = await requireUser();

  if (!canManageDocuments(user)) {
    notFound();
  }

  const result = await listDocuments();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageIntro
        description="Documentos que o assistente usa para responder. Enviar um arquivo com o mesmo nome substitui a versão anterior."
        title="Base de conhecimento"
      />
      <DocumentsPanel
        documents={result.ok ? result.documents : []}
        listFailed={!result.ok}
      />
    </div>
  );
}
