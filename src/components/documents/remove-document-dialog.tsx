"use client";

import { useActionState, useEffect, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  removeDocumentAction,
  type RemoveDocumentState,
} from "@/services/document-actions";

const INITIAL_STATE: RemoveDocumentState = {};

export function RemoveDocumentDialog({
  document,
  onClose,
}: {
  document: string;
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    removeDocumentAction,
    INITIAL_STATE,
  );
  const [clientError, setClientError] = useState<string>();

  useEffect(() => {
    if (state.ok) {
      onClose();
    }
  }, [state.ok, onClose]);

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
    const confirmed = event.currentTarget.elements.namedItem("confirmed");

    if (!(confirmed instanceof HTMLInputElement) || !confirmed.checked) {
      event.preventDefault();
      setClientError("Confirme a remoção do documento.");
      return;
    }

    setClientError(undefined);
  }

  return (
    <div
      aria-labelledby="remove-document-title"
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4"
      role="dialog"
    >
      <div className="grid w-full max-w-lg gap-4 rounded-sheet border border-border bg-surface p-5">
        <div className="grid gap-1">
          <h2 className="text-lg font-semibold" id="remove-document-title">
            Remover documento
          </h2>
          <p className="text-sm text-muted">
            Remover <strong>{document}</strong> da base? Os trechos deixam de ser
            usados pelo assistente.
          </p>
        </div>

        <form action={formAction} className="grid gap-4" onSubmit={handleSubmit}>
          <input name="document" type="hidden" value={document} />

          <Field
            error={state.fieldError}
            hint="Senha de publicação da base."
            id="remove-document-password"
            label="Senha"
          >
            <Input autoComplete="off" autoFocus name="password" type="password" />
          </Field>

          <label className="flex items-start gap-2 text-sm">
            <input className="mt-1" name="confirmed" type="checkbox" value="yes" />
            <span>Confirmo a remoção de {document}.</span>
          </label>

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
              Remover
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
