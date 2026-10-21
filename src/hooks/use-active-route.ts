"use client";

import { usePathname } from "next/navigation";

import { isActivePath } from "@/lib/active-route";

export function useActiveRoute(href: string): boolean {
  const pathname = usePathname();
  return isActivePath(href, pathname);
}
