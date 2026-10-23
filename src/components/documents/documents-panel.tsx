"use client";

import { useState } from "react";

import { RefreshButton } from "@/components/app-shell/refresh-button";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { formatDocumentDate } from "@/lib/documents";
import type { DocumentSummary } from "@/types/document";

import { RemoveDocumentDialog } from "./remove-document-dialog";
import { UploadDialog } from "./upload-dialog";

export function DocumentsPanel({
  documents,
  listFailed = false,
}: {
  documents: DocumentSummary[];
  listFailed?: boolean;
}) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  return (
    <section className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Documentos da base</h2>
        <Button onClick={() => setUploadOpen(true)} variant="primary">
          Adicionar/atualizar documento
        </Button>
      </div>

      {listFailed ? (
        <ErrorState
          action={<RefreshButton />}
          message="Não foi possível carregar os documentos agora."
        />
      ) : documents.length === 0 ? (
        <EmptyState
          action={
            <Button onClick={() => setUploadOpen(true)}>
              Adicionar documento
            </Button>
          }
          message="A base ainda não tem documentos. Envie o primeiro arquivo .md."
        />
      ) : (
        <DocumentTable documents={documents} onRemove={setRemoving} />
      )}

      {uploadOpen ? (
        <UploadDialog onClose={() => setUploadOpen(false)} />
      ) : null}

      {removing ? (
        <RemoveDocumentDialog
          document={removing}
          onClose={() => setRemoving(null)}
        />
      ) : null}
    </section>
  );
}

function DocumentTable({
  documents,
  onRemove,
}: {
  documents: DocumentSummary[];
  onRemove: (document: string) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-control border border-border">
      <table className="w-full border-collapse text-left">
        <caption className="sr-only">
          Documentos da base de conhecimento, com número de trechos e última
          atualização
        </caption>
        <thead className="bg-raised text-sm text-muted">
          <tr>
            <th className="px-4 py-2 font-medium" scope="col">
              Documento
            </th>
            <th className="px-4 py-2 font-medium" scope="col">
              Trechos
            </th>
            <th className="px-4 py-2 font-medium" scope="col">
              Última atualização
            </th>
            <th className="px-4 py-2 font-medium" scope="col">
              Ações
            </th>
          </tr>
        </thead>
        <tbody>
          {documents.map((document) => (
            <tr className="border-t border-border" key={document.document}>
              <th className="px-4 py-2 font-medium" scope="row">
                {document.document}
              </th>
              <td className="px-4 py-2 text-muted">{document.chunks}</td>
              <td className="px-4 py-2 text-muted">
                {formatDocumentDate(document.updatedAt)}
              </td>
              <td className="px-4 py-2">
                <Button
                  aria-label={`Remover ${document.document}`}
                  onClick={() => onRemove(document.document)}
                  variant="ghost"
                >
                  Remover
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
