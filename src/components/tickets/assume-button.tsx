"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { assumeTicketAction } from "@/services/ticket-actions";

export function AssumeButton({ ticketId }: { ticketId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        loading={pending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await assumeTicketAction(ticketId);

            if (!result.ok) {
              setError(result.error);
            }
          });
        }}
        variant="secondary"
      >
        Assumir
      </Button>
      {error ? (
        <p className="max-w-48 text-right text-xs text-negative" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
