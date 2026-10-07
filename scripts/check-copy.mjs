/**
 * Copy audit. Scans content files and components for:
 *   em and en dashes, spaced hyphens used as separators, banned words, lorem ipsum,
 *   and wrong spellings of the company name.
 * Exits 1 on any hit. Only user facing strings are checked (string literals and JSX text).
 *
 *   npm run check:copy
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOTS = ["content", "components", "app"];
const BANNED = [
  "unleash",
  "elevate",
  "seamless",
  "cutting-edge",
  "cutting edge",
  "state-of-the-art",
  "state of the art",
  "game-changer",
  "game changer",
  "revolutionize",
  "revolutionise",
  "in today's fast-paced world",
  "we are passionate about",
  "world-class",
  "world class",
  "one-stop solution",
  "one stop solution",
  "journey",
  "lorem ipsum",
  "lorem",
];
const NAME_VARIANTS = [/Jaysn Agro (?:Pvt|Private) Ltd/i, /\bJaysn Agro India\b(?! PRIVATE LIMITED)/, /\bJaysn Agro\b/];

const files = [];
const walkDir = (d) => {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) walkDir(p);
    else if (/\.(ts|tsx)$/.test(f)) files.push(p);
  }
};
ROOTS.forEach(walkDir);

/** Pull out string literals and JSX text, skip imports, classNames, CSS and code-ish strings */
function userText(src) {
  const out = [];
  const lines = src.split("\n");
  lines.forEach((line, i) => {
    const t = line.trim();
    if (/^(import|export \*|\/\/|\*|\/\*)/.test(t)) return;
    const strings = [...line.matchAll(/"([^"\\]*(?:\\.[^"\\]*)*)"|`([^`]*)`|'([^'\\]*(?:\\.[^'\\]*)*)'/g)].map(
      (m) => m[1] ?? m[2] ?? m[3] ?? "",
    );
    // JSX text between tags
    const jsx = [...line.matchAll(/>([^<>{}]+)</g)].map((m) => m[1]);
    for (const s of [...strings, ...jsx]) {
      if (!/[a-z]{3,}\s+[a-z]{2,}/i.test(s)) continue; // needs to look like words
      if (/^[\w\-./:@#?=&%]+$/.test(s)) continue; // paths, ids
      out.push({ line: i + 1, text: s });
    }
  });
  return out;
}

const hits = [];
for (const f of files) {
  const src = readFileSync(f, "utf8");
  for (const { line, text } of userText(src)) {
    const where = `${relative(process.cwd(), f)}:${line}`;
    if (/[\u2014\u2013]/.test(text)) hits.push(`${where}  dash used as separator: "${text}"`);
    if (/\s-\s/.test(text) && !/\d\s-\s\d/.test(text)) hits.push(`${where}  spaced hyphen as separator: "${text}"`);
    const lower = text.toLowerCase();
    for (const b of BANNED) {
      if (lower.includes(b) && !(b === "journey" && /camera/.test(lower))) hits.push(`${where}  banned word "${b}": "${text}"`);
    }
    for (const re of NAME_VARIANTS) if (re.test(text)) hits.push(`${where}  company name must be JAYSN AGRO or JAYSN AGRO INDIA PRIVATE LIMITED: "${text}"`);
  }
  // Raw dashes anywhere in content files, even outside the patterns above
  if (f.startsWith("content")) {
    src.split("\n").forEach((l, i) => {
      if (/[\u2014\u2013]/.test(l)) hits.push(`${relative(process.cwd(), f)}:${i + 1}  dash character in content file`);
    });
  }
}

if (hits.length) {
  console.log(`Copy check failed with ${hits.length} hit(s):\n`);
  [...new Set(hits)].forEach((h) => console.log("  " + h));
  process.exit(1);
}
console.log(`Copy check passed (${files.length} files).`);
