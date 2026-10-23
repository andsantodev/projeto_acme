"use client";

import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

import { useFieldControl } from "./field";

export type FileInputProps = InputHTMLAttributes<HTMLInputElement>;

export function FileInput({ className, id, ...rest }: FileInputProps) {
  const field = useFieldControl();

  return (
    <input
      {...rest}
      id={id ?? field?.id}
      aria-describedby={rest["aria-describedby"] ?? field?.["aria-describedby"]}
      aria-invalid={rest["aria-invalid"] ?? field?.["aria-invalid"]}
      className={cn(
        "block w-full text-sm text-muted file:mr-3 file:rounded-control file:border file:border-control file:bg-raised file:px-3 file:py-1 file:font-medium file:text-ink",
        className,
      )}
      type="file"
    />
  );
}
