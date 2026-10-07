/**
 * Screenshots every route at desktop and mobile sizes into /screenshots, plus each home chapter.
 * Uses playwright-core with the locally installed Chrome (or CHROME_PATH). Needs the site
 * running on BASE_URL (default http://localhost:3000).
 *
 *   npm run shots                       all routes, 1440x900 and 390x844
 *   npm run shots -- --routes=/,/team   some routes
 *   npm run shots -- --full             also 1920x1080, 1024x768, 768x1024 and top/middle/bottom
 */
import { chromium } from "playwright-core";
import { mkdirSync, existsSync } from "node:fs";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? true];
  }),
);
const candidates = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
].filter(Boolean);
const executablePath = candidates.find((p) => existsSync(p));

const routes = args.routes
  ? String(args.routes).split(",")
  : ["/", "/services", "/products", "/products/fertilizer", "/products/cattle-feed", "/team", "/contact", "/privacy", "/nope-404"];
const viewports = args.full
  ? [
      [1440, 900],
      [1920, 1080],
      [1024, 768],
      [768, 1024],
      [390, 844],
    ]
  : [
      [1440, 900],
      [390, 844],
    ];

mkdirSync("screenshots", { recursive: true });
const browser = await chromium.launch({
  executablePath,
  headless: true,
  args: ["--ignore-gpu-blocklist", "--enable-webgl", "--use-angle=default"],
});
const errors = [];

for (const [w, h] of viewports) {
  const context = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  // Skip the preloader after the first page, like a returning visitor
  await context.addInitScript(() => {
    try {
      if (!location.search.includes("preloader")) sessionStorage.setItem("jaysn-visited", "1");
    } catch {}
  });
  const page = await context.newPage();
  page.on("console", (m) => {
    if (m.type() === "error" || m.type() === "warning") errors.push(`[${w}x${h}] ${page.url()} ${m.type()}: ${m.text()}`);
  });
  page.on("pageerror", (e) => errors.push(`[${w}x${h}] ${page.url()} pageerror: ${e.message}`));

  for (const route of routes) {
    const name = route === "/" ? "home" : route.replace(/^\//, "").replace(/\//g, "_");
    await page.goto(BASE + route, { waitUntil: "networkidle", timeout: 60000 }).catch(() => {});
    await page.waitForTimeout(Number(args.wait ?? 6500));
    await page.screenshot({ path: `screenshots/${name}-${w}x${h}-top.png` });

    if (route === "/" && !args.nochapters) {
      const ids = ["ch-soil", "ch-stock", "ch-trade", "ch-people", "ch-quote"];
      for (const id of ids) {
        await page.evaluate((id) => {
          const el = document.getElementById(id)?.closest("section");
          if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY);
        }, id);
        await page.waitForTimeout(2600);
        await page.screenshot({ path: `screenshots/${name}-${w}x${h}-${id}.png` });
      }
      // Trade chapter globe part
      await page.evaluate(() => {
        const el = document.getElementById("ch-trade")?.closest("section");
        if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY + el.offsetHeight * 0.6);
      });
      await page.waitForTimeout(2600);
      await page.screenshot({ path: `screenshots/${name}-${w}x${h}-globe.png` });
    } else if (args.full || args.scroll) {
      for (const [label, f] of [
        ["middle", 0.5],
        ["bottom", 1],
      ]) {
        await page.evaluate((f) => window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * f), f);
        await page.waitForTimeout(1800);
        await page.screenshot({ path: `screenshots/${name}-${w}x${h}-${label}.png` });
      }
    }
    console.log(`shot ${route} @ ${w}x${h}`);
  }
  await context.close();
}
await browser.close();
if (errors.length) {
  console.log(`\nConsole errors and warnings (${errors.length}):`);
  for (const e of [...new Set(errors)]) console.log(e);
} else console.log("\nNo console errors or warnings.");
