import type { ReactNode } from "react";

import { PortalShell } from "@/components/app-shell/portal-shell";
import { getCurrentUser } from "@/services/current-user";

export default function PortalLayout({ children }: { children: ReactNode }) {
  const user = getCurrentUser();

  return <PortalShell user={user}>{children}</PortalShell>;
}
