"use client";

import { useId, useMemo, useRef, useState } from "react";
import { countries } from "@/lib/countries";
import styles from "./QuoteForm.module.css";

/** Searchable country select (ARIA combobox with a listbox). */
export default function CountrySelect({
  value,
  onChange,
  onBlur,
  id,
  describedBy,
}: {
  value: string;
  onChange: (name: string, code: string | null) => void;
  onBlur?: () => void;
  id: string;
  describedBy?: string;
}) {
  const list = useMemo(() => countries(), []);
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const lb = useId();
  const listRef = useRef<HTMLUListElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase() === q);
  }, [list, query]);

  const pick = (i: number) => {
    const c = filtered[i];
    if (!c) return;
    setQuery(c.name);
    onChange(c.name, c.code);
    setOpen(false);
  };

  const scrollActive = (i: number) => {
    const el = listRef.current?.children[i] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  };

  return (
    <div className={styles.combo}>
      <input
        id={id}
        className={styles.input}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={lb}
        aria-autocomplete="list"
        aria-activedescendant={open && filtered[active] ? `${lb}-${filtered[active].code}` : undefined}
        aria-describedby={describedBy}
        autoComplete="country-name"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setActive(0);
          onChange(e.target.value, null);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          window.setTimeout(() => setOpen(false), 120);
          onBlur?.();
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
            const n = Math.min(filtered.length - 1, active + 1);
            setActive(n);
            scrollActive(n);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            const n = Math.max(0, active - 1);
            setActive(n);
            scrollActive(n);
          } else if (e.key === "Enter" && open) {
            e.preventDefault();
            pick(active);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
      />
      {open && filtered.length > 0 && (
        <ul ref={listRef} id={lb} role="listbox" className={styles.listbox} data-lenis-prevent>
          {filtered.map((c, i) => (
            <li
              key={c.code}
              id={`${lb}-${c.code}`}
              role="option"
              aria-selected={i === active}
              className={i === active ? styles.optionActive : styles.option}
              onPointerDown={(e) => {
                e.preventDefault();
                pick(i);
              }}
              onPointerEnter={() => setActive(i)}
            >
              {c.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
