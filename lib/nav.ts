/** Site map order. Transitions sweep forward (left to right) when moving down this list. */
export const NAV = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Products", href: "/products" },
  { label: "Team", href: "/team" },
  { label: "Contact", href: "/contact" },
] as const;

export function navIndex(path: string) {
  if (path === "/") return 0;
  const i = NAV.findIndex((n) => n.href !== "/" && path.startsWith(n.href));
  if (i >= 0) return i + (path.split("/").length > 2 ? 0.5 : 0);
  return NAV.length;
}

export const isCurrent = (path: string, href: string) =>
  href === "/" ? path === "/" : path === href || path.startsWith(`${href}/`);
