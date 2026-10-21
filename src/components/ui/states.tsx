import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

function StateFrame({
  action,
  children,
  className,
  role,
}: {
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  role?: "alert";
}) {
  return (
    <div
      role={role}
      className={cn(
        "grid place-items-center gap-2 rounded-control border border-dashed px-4 py-8 text-center",
        className,
      )}
    >
      <p>{children}</p>
      {action}
    </div>
  );
}

export function EmptyState({
  action,
  message,
}: {
  action?: ReactNode;
  message: ReactNode;
}) {
  return (
    <StateFrame action={action} className="border-control text-muted">
      {message}
    </StateFrame>
  );
}

export function ErrorState({
  action,
  message,
}: {
  action?: ReactNode;
  message: ReactNode;
}) {
  return (
    <StateFrame
      action={action}
      className="border-negative/40 text-ink"
      role="alert"
    >
      {message}
    </StateFrame>
  );
}
