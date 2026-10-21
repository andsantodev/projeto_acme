"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { ANSWER_MAX } from "@/lib/answer";
import {
  answerTicketAction,
  type AnswerTicketState,
} from "@/services/ticket-actions";

const INITIAL_STATE: AnswerTicketState = {};

export function AnswerForm({ ticketId }: { ticketId: string }) {
  const [state, formAction, pending] = useActionState(
    answerTicketAction,
    INITIAL_STATE,
  );

  return (
    <form action={formAction} className="grid gap-4">
      <input name="ticketId" type="hidden" value={ticketId} />

      <Field
        error={state.fieldError}
        hint={`Até ${ANSWER_MAX} caracteres`}
        id="answer"
        label="Resposta"
      >
        <Textarea name="answer" rows={5} />
      </Field>

      {state.error ? (
        <p className="text-sm text-negative" role="alert">
          {state.error}
        </p>
      ) : null}

      <div>
        <Button loading={pending} type="submit" variant="primary">
          Responder
        </Button>
      </div>
    </form>
  );
}
