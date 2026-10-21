"use client";

import { createContext, useContext, useId, type ReactNode } from "react";

type FieldControlProps = {
  id: string;
  "aria-describedby": string | undefined;
  "aria-invalid": true | undefined;
};

const FieldContext = createContext<FieldControlProps | null>(null);

/**
 * A control rendered inside a Field picks up its id and the description
 * pointer, so the label and the error message cannot drift from the input.
 */
export function useFieldControl(): FieldControlProps | null {
  return useContext(FieldContext);
}

export function Field({
  children,
  error,
  hint,
  id,
  label,
}: {
  children: ReactNode;
  error?: string;
  hint?: string;
  id?: string;
  label: string;
}) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const hintId = hint ? `${controlId}-hint` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <FieldContext.Provider
      value={{
        id: controlId,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : undefined,
      }}
    >
      <div className="grid gap-2">
        <label className="font-medium" htmlFor={controlId}>
          {label}
        </label>
        {hint ? (
          <p className="text-xs text-muted" id={hintId}>
            {hint}
          </p>
        ) : null}
        {children}
        {error ? (
          <p className="text-xs text-negative" id={errorId}>
            {error}
          </p>
        ) : null}
      </div>
    </FieldContext.Provider>
  );
}
