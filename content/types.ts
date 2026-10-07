/**
 * A company fact. Nothing with verified: false may be presented as fact on the live site.
 * `npm run check:content` lists every unverified fact. STRICT_CONTENT=1 fails the build.
 */
export interface Fact<T = string> {
  value: T;
  verified: boolean;
  /** Where the fact came from or what the client must confirm */
  note?: string;
}

export const fact = <T>(value: T, verified = false, note?: string): Fact<T> => ({
  value,
  verified,
  ...(note ? { note } : {}),
});

/** Plain text of a fact, for metadata and attributes where a marker cannot render */
export const factText = <T>(f: Fact<T>) => String(f.value);

export interface LinkItem {
  label: string;
  href: string;
}

export interface Figure {
  value: Fact<string>;
  unit: string;
  caption: string;
}
