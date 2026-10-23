"use client";

import { useEffect, useState, useTransition, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { FileInput } from "@/components/ui/file-input";
import { Input } from "@/components/ui/input";
import { DOCUMENT_MAX_FILES, validateDocumentFiles } from "@/lib/documents";
import {
  uploadDocumentsAction,
  type UploadDocumentsState,
} from "@/services/document-actions";

export function UploadDialog({ onClose }: { onClose: () => void }) {
  const [state, setState] = useState<UploadDocumentsState>({});
  const [clientError, setClientError] = useState<string>();
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const input = form.elements.namedItem("files");
    const files =
      input instanceof HTMLInputElement ? Array.from(input.files ?? []) : [];
    const check = validateDocumentFiles(files);

    if (!check.ok) {
      setClientError(check.error);
      return;
    }

    setClientError(undefined);

    // The action is called directly instead of through <form action> so the
    // browser does not reset the file input when the password is wrong.
    const passwordInput = form.elements.namedItem("password");
    const body = new FormData();

    body.set(
      "password",
      passwordInput instanceof HTMLInputElement ? passwordInput.value : "",
    );

    for (const file of files) {
      body.append("files", file, file.name);
    }

    startTransition(async () => {
      const result = await uploadDocumentsAction({}, body);

      setState(result);

      if (result.ok) {
        onClose();
      }
    });
  }

  return (
    <div
      aria-labelledby="upload-documents-title"
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4"
      role="dialog"
    >
      <div className="grid w-full max-w-lg gap-4 rounded-sheet border border-border bg-surface p-5">
        <div className="grid gap-1">
          <h2 className="text-lg font-semibold" id="upload-documents-title">
            Adicionar/atualizar documento
          </h2>
          <p className="text-sm text-muted">
            Enviar um arquivo com nome já existente substitui somente aquele
            documento.
          </p>
        </div>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <Field
            error={state.fieldError}
            hint="Senha de publicação da base."
            id="documents-password"
            label="Senha"
          >
            <Input autoComplete="off" autoFocus name="password" type="password" />
          </Field>

          <Field
            hint={`Até ${DOCUMENT_MAX_FILES} arquivos .md de 200 KB cada.`}
            id="documents-files"
            label="Arquivos .md"
          >
            <FileInput accept=".md,text/markdown" multiple name="files" />
          </Field>

          {clientError ? (
            <p className="text-sm text-negative" role="alert">
              {clientError}
            </p>
          ) : null}

          {state.error ? (
            <p className="text-sm text-negative" role="alert">
              {state.error}
            </p>
          ) : null}

          <div className="flex justify-end gap-2">
            <Button onClick={onClose} variant="ghost">
              Fechar
            </Button>
            <Button loading={pending} type="submit" variant="primary">
              Enviar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
