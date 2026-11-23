// Turns an HTML graphic into PNG files with Playwright (Chromium).
// Usage: node render.mjs <file.html> <out-dir> [width] [height] [--scale=2]
// One PNG per element with class "slide" (slide-1.png, slide-2.png ...).
// If there is only one slide, or none, it writes graphic.png.
// Needs the one-time setup: node setup.mjs (in this folder)
import { createRequire } from 'node:module';
import { homedir } from 'node:os';
import { join as pjoin } from 'node:path';

// Load packages from the shared setup folder (~/.post-graphics), or from a normal local install.
const RUNTIME = process.env.POST_GRAPHICS_HOME || pjoin(homedir(), '.post-graphics');
function load(name) {
  for (const base of [pjoin(RUNTIME, 'package.json'), import.meta.url]) {
    try { return createRequire(base)(name); } catch {}
  }
  console.error(`[post-graphics] NOT SET UP: run "node setup.mjs" from this scripts folder first.`);
  process.exit(2);
}
const { chromium } = load('playwright');
import { mkdirSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
const scaleArg = args.find((a) => a.startsWith('--scale='));
const scale = scaleArg ? Number(scaleArg.split('=')[1]) : 1;
const [file, outDir, w = '1080', h = '1350'] = args.filter((a) => !a.startsWith('--'));
if (!file || !outDir || !existsSync(file)) {
  console.error('Usage: node render.mjs <file.html> <out-dir> [width] [height] [--scale=2]');
  process.exit(1);
}
const width = Number(w);
const height = Number(h);
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: scale });
await page.goto(pathToFileURL(resolve(file)).href, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);

const written = [];
const slides = await page.$$('.slide');
if (slides.length <= 1) {
  const target = join(outDir, 'graphic.png');
  if (slides.length === 1) await slides[0].screenshot({ path: target });
  else await page.screenshot({ path: target });
  written.push(target);
} else {
  for (let i = 0; i < slides.length; i++) {
    const target = join(outDir, `slide-${i + 1}.png`);
    await slides[i].screenshot({ path: target });
    written.push(target);
  }
}
await browser.close();
console.log(written.join('\n'));
