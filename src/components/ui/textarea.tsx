"use client";

import type { TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

import { useFieldControl } from "./field";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, id, ...rest }: TextareaProps) {
  const field = useFieldControl();

  return (
    <textarea
      {...rest}
      id={id ?? field?.id}
      aria-describedby={rest["aria-describedby"] ?? field?.["aria-describedby"]}
      aria-invalid={rest["aria-invalid"] ?? field?.["aria-invalid"]}
      className={cn(
        "min-h-24 w-full rounded-control border border-control bg-surface px-3 py-2 text-ink placeholder:text-faint",
        className,
      )}
    />
  );
}
