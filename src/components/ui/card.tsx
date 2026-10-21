import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export function Card({
  actions,
  children,
  className,
  title,
}: {
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-card border border-border bg-surface p-5",
        className,
      )}
    >
      {title || actions ? (
        <header className="mb-4 flex items-center justify-between gap-3">
          {title ? (
            <h2 className="text-base font-semibold">{title}</h2>
          ) : null}
          {actions}
        </header>
      ) : null}
      {children}
    </section>
  );
}
