import type { ReactNode } from "react";

export function EmptyNotice({
  children,
  action,
}: {
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="grid place-items-center gap-2 rounded-control border border-dashed border-control px-4 py-8 text-center text-muted">
      <p>{children}</p>
      {action}
    </div>
  );
}
