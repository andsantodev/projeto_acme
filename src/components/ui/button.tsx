"use client";

import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

import { Spinner } from "./spinner";

export type ButtonVariant = "primary" | "secondary" | "ghost";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-ink text-surface hover:bg-ink/90",
  secondary: "border border-control bg-surface text-ink hover:bg-raised",
  ghost: "text-ink hover:bg-raised",
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  loading?: boolean;
};

export function Button({
  children,
  className,
  disabled = false,
  loading = false,
  type = "button",
  variant = "secondary",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex h-8 items-center justify-center gap-2 rounded-control px-3 font-medium transition-colors",
        "disabled:pointer-events-none disabled:opacity-60",
        VARIANT_CLASSES[variant],
        className,
      )}
      {...rest}
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  );
}
