"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { closeTicketAction } from "@/services/ticket-actions";

export function CloseTicketButton({ ticketId }: { ticketId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="grid gap-2">
      <Button
        className="w-fit"
        loading={pending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await closeTicketAction(ticketId);

            if (!result.ok) {
              setError(result.error);
            }
          });
        }}
        variant="primary"
      >
        Fechar chamado
      </Button>
      {error ? (
        <p className="text-sm text-negative" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
