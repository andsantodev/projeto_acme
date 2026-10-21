import Link from "next/link";
import type { ReactNode } from "react";

import { ProductMark } from "@/components/app-shell/product-mark";
import { PortalNav } from "@/components/app-shell/portal-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { homeRouteFor, navigationFor } from "@/lib/navigation";
import { PRODUCT_NAME } from "@/lib/product";
import { roleLabel } from "@/lib/user-label";
import { logoutAction } from "@/services/auth-actions";
import type { AppUser } from "@/types/user";

export function PortalShell({
  user,
  children,
}: {
  user: AppUser;
  children: ReactNode;
}) {
  return (
    <div className="min-h-svh">
      <header className="flex h-12 items-center justify-between gap-4 px-5 max-[860px]:px-4">
        <Link
          className="flex items-center gap-2 rounded-control"
          href={homeRouteFor(user.role)}
        >
          <ProductMark />
          <span className="text-brand font-semibold">{PRODUCT_NAME}</span>
        </Link>

        <div className="flex items-center gap-3">
          <p className="flex items-center gap-2">
            <span className="font-medium">{user.name}</span>
            <Badge>{roleLabel(user)}</Badge>
          </p>
          <form action={logoutAction}>
            <Button type="submit" variant="ghost">
              Sair
            </Button>
          </form>
        </div>
      </header>

      <div className="grid h-[calc(100svh-3rem)] grid-cols-[228px_minmax(0,1fr)] max-[860px]:grid-cols-1 max-[860px]:grid-rows-[auto_minmax(0,1fr)]">
        <aside className="px-2 py-3 max-[860px]:py-2">
          <PortalNav items={navigationFor(user.role)} />
        </aside>

        <main className="mr-2 mb-2 flex min-h-0 flex-col overflow-y-auto rounded-sheet border border-border bg-surface px-6 py-6 max-[860px]:m-0 max-[860px]:rounded-none max-[860px]:border-0 max-[860px]:px-4 max-[860px]:py-4">
          {children}
        </main>
      </div>
    </div>
  );
}
