import { Fragment } from "react";

/** Renders "*word*" spans as display italics. Keeps plain text otherwise. */
export function Emphasis({ text }: { text: string }) {
  const parts = text.split(/(\*[^*]+\*)/g).filter(Boolean);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("*") && p.endsWith("*") ? (
          <em key={i}>{p.slice(1, -1)}</em>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        ),
      )}
    </>
  );
}

/** Plain text without emphasis markers, for metadata and aria labels */
export const plain = (text: string) => text.replace(/\*/g, "");
