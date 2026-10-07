const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Traps Tab focus inside `root` (plus any `extra` elements, for example the header close
 * button). Returns a cleanup that restores focus to the opener.
 */
export function trapFocus(root: HTMLElement, onEscape: () => void, extra: (HTMLElement | null)[] = []) {
  const opener = document.activeElement as HTMLElement | null;
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onEscape();
      return;
    }
    if (e.key !== "Tab") return;
    const scopes = [...extra.filter((x): x is HTMLElement => !!x), root];
    const items = scopes.flatMap((r) => [
      ...(r.matches(FOCUSABLE) ? [r] : []),
      ...Array.from(r.querySelectorAll<HTMLElement>(FOCUSABLE)),
    ]).filter(
      (el) => el.offsetParent !== null || el === document.activeElement,
    );
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };
  document.addEventListener("keydown", onKey);
  return () => {
    document.removeEventListener("keydown", onKey);
    opener?.focus?.({ preventScroll: true });
  };
}
