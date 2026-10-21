"use client";

import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

import { useFieldControl } from "./field";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, id, ...rest }: InputProps) {
  const field = useFieldControl();

  return (
    <input
      {...rest}
      id={id ?? field?.id}
      aria-describedby={rest["aria-describedby"] ?? field?.["aria-describedby"]}
      aria-invalid={rest["aria-invalid"] ?? field?.["aria-invalid"]}
      className={cn(
        "h-9 w-full rounded-control border border-control bg-surface px-3 text-ink placeholder:text-faint",
        className,
      )}
    />
  );
}
