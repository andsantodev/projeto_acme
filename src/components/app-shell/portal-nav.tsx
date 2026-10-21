"use client";

import Link from "next/link";

import { useActiveRoute } from "@/hooks/use-active-route";
import type { NavItem } from "@/lib/navigation";

export function PortalNav({ items }: { items: readonly NavItem[] }) {
  return (
    <nav aria-label="Navegação principal">
      <ul className="flex flex-col gap-1 max-[860px]:flex-row max-[860px]:gap-2">
        {items.map((item) => (
          <li key={item.href}>
            <NavLink item={item} />
          </li>
        ))}
      </ul>
    </nav>
  );
}

function NavLink({ item }: { item: NavItem }) {
  const active = useActiveRoute(item.href);

  return (
    <Link
      aria-current={active ? "page" : undefined}
      className="flex h-8 items-center rounded-control px-3 text-muted transition-colors hover:bg-raised hover:text-ink aria-[current=page]:bg-active aria-[current=page]:font-medium aria-[current=page]:text-ink"
      href={item.href}
    >
      {item.label}
    </Link>
  );
}
