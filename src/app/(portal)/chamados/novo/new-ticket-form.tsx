"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  TICKET_CATEGORIES,
  TICKET_DESCRIPTION_MAX,
  TICKET_TITLE_MAX,
} from "@/lib/ticket";

import { createTicketAction, type NewTicketState } from "./actions";

const INITIAL_STATE: NewTicketState = {};

export function NewTicketForm({
  initialTitle,
  initialDescription,
}: {
  initialTitle: string;
  initialDescription: string;
}) {
  const [state, formAction, pending] = useActionState(
    createTicketAction,
    INITIAL_STATE,
  );
  const categoryError = state.errors?.category;

  return (
    <form action={formAction} className="grid gap-6" noValidate>
      <fieldset
        aria-describedby={categoryError ? "category-error" : undefined}
        className="grid gap-3"
      >
        <legend className="font-medium">Categoria</legend>
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
          {TICKET_CATEGORIES.map((category) => (
            <label
              key={category.value}
              className="flex cursor-pointer items-start gap-2"
            >
              <input
                className="mt-1 accent-accent"
                defaultChecked={state.values?.category === category.value}
                name="category"
                type="radio"
                value={category.value}
              />
              <span>
                <span className="font-medium">{category.label}</span>{" "}
                <span className="text-muted">— {category.hint}</span>
              </span>
            </label>
          ))}
        </div>
        {categoryError ? (
          <p className="text-xs text-negative" id="category-error">
            {categoryError}
          </p>
        ) : null}
      </fieldset>

      <Field
        error={state.errors?.title}
        hint={`${TICKET_TITLE_MAX} caracteres no máximo`}
        id="title"
        label="Título"
      >
        <Input
          defaultValue={state.values?.title ?? initialTitle}
          name="title"
          placeholder="Resuma o pedido em uma linha"
        />
      </Field>

      <Field
        error={state.errors?.description}
        hint={`Até ${TICKET_DESCRIPTION_MAX} caracteres`}
        id="description"
        label="Descrição"
      >
        <Textarea
          defaultValue={state.values?.description ?? initialDescription}
          name="description"
          rows={6}
        />
      </Field>

      {state.formError ? (
        <p className="text-sm text-negative" role="alert">
          {state.formError}
        </p>
      ) : null}

      <div>
        <Button loading={pending} type="submit" variant="primary">
          Abrir chamado
        </Button>
      </div>
    </form>
  );
}
