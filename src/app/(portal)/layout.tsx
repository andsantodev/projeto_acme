import type { ReactNode } from "react";

import { PortalShell } from "@/components/app-shell/portal-shell";
import { requireUser } from "@/services/current-user";

export default async function PortalLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireUser();

  return <PortalShell user={user}>{children}</PortalShell>;
}
