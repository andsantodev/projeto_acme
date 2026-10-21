import Link from "next/link";
import type { ReactNode } from "react";

import { ProductMark } from "@/components/app-shell/product-mark";
import { PortalNav } from "@/components/app-shell/portal-nav";
import { homeRouteFor, navigationFor } from "@/lib/navigation";
import { PRODUCT_NAME } from "@/lib/product";
import { roleLabel } from "@/lib/user-label";
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
          <span className="text-[15px] font-semibold">{PRODUCT_NAME}</span>
        </Link>
        <p className="flex items-baseline gap-2">
          <span className="font-medium">{user.name}</span>
          <span className="text-xs text-muted">{roleLabel(user)}</span>
        </p>
      </header>

      <div className="grid min-h-[calc(100svh-3rem)] grid-cols-[228px_minmax(0,1fr)] max-[860px]:grid-cols-1 max-[860px]:grid-rows-[auto_minmax(0,1fr)]">
        <aside className="px-2 py-3 max-[860px]:py-2">
          <PortalNav items={navigationFor(user.role)} />
        </aside>

        <main className="mr-2 mb-2 rounded-sheet border border-border bg-surface px-6 py-6 max-[860px]:m-0 max-[860px]:rounded-none max-[860px]:border-0 max-[860px]:px-4 max-[860px]:py-4">
          {children}
        </main>
      </div>
    </div>
  );
}
