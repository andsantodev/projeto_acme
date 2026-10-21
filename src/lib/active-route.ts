/**
 * A navigation item is current when the pathname is exactly its href or a
 * child of it. A plain prefix check would light up "/fila" on "/fila-antiga".
 */
export function isActivePath(href: string, pathname: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
