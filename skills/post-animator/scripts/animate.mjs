// Turns an animated HTML graphic into an endlessly looping GIF.
// Usage: node animate.mjs <animated.html> <out.gif> [fps] [scale]
// The HTML must define window.DURATION (seconds) and window.setT(t), which sets the exact state at time t.
// The size is read from the page body (for example 1080x1350 or 1080x1080).
// Renders one frame per 1/fps second with one shared palette, so colours never flicker between frames.
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
const gifenc = load('gifenc');
const { PNG } = load('pngjs');
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const { GIFEncoder, quantize } = gifenc;
const [file, out, fpsArg = '15', scaleArg = '1'] = process.argv.slice(2);
if (!file || !out) {
  console.error('Usage: node animate.mjs <animated.html> <out.gif> [fps] [scale]');
  process.exit(1);
}
const fps = Number(fpsArg);
const scale = Number(scaleArg);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: scale });
await page.goto(pathToFileURL(resolve(file)).href, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
const size = await page.evaluate(() => ({ w: document.body.offsetWidth, h: document.body.offsetHeight }));
await page.setViewportSize({ width: size.w, height: size.h });
if ((await page.evaluate(() => typeof window.setT)) !== 'function') {
  console.error('The page has no window.setT(t). See motion.js in this skill.');
  process.exit(1);
}
const duration = await page.evaluate(() => window.DURATION);
const frames = Math.round(duration * fps);
const gif = GIFEncoder();
// Capture every frame first, then build ONE palette for the whole GIF.
// A palette per frame makes colours shift between frames, so images flicker.
const shots = [];
for (let i = 0; i < frames; i++) {
  await page.evaluate((t) => window.setT(t), i / fps);
  shots.push(await page.screenshot());
}
// Palette from EVERY frame (every 4th pixel), so colours that only show up while
// something moves (e.g. bright green text mid-scroll) get their own entries and do not speckle.
const PX = 4;
const perFrame = Math.ceil(size.w * scale * size.h * scale / PX) * 4;
const all = new Uint8Array(perFrame * frames);
let off = 0;
for (let i = 0; i < frames; i++) {
  const d = PNG.sync.read(shots[i]).data;
  for (let p = 0; p < d.length && off + 4 <= all.length; p += 4 * PX) {
    all[off] = d[p]; all[off + 1] = d[p + 1]; all[off + 2] = d[p + 2]; all[off + 3] = 255; off += 4;
  }
}
// 255 real colours + 1 transparent slot (index 255), used for pixels that did not change.
const palette = quantize(all.subarray(0, off), 255);
while (palette.length < 255) palette.push([0, 0, 0]);
palette.push([0, 0, 0]);
const TRANSPARENT = 255;
// Exact colour -> nearest palette index, shared by all frames. gifenc's applyPalette
// caches by colour bucket, so one frame's pixels can change another region's colours.
const nearest = new Map();
function indexFrame(data) {
  const out = new Uint8Array(data.length / 4);
  for (let p = 0, q = 0; p < data.length; p += 4, q++) {
    const r = data[p], g = data[p + 1], b = data[p + 2];
    const key = (r << 16) | (g << 8) | b;
    let idx = nearest.get(key);
    if (idx === undefined) {
      let best = Infinity;
      for (let k = 0; k < TRANSPARENT; k++) {   // never map a real colour to the transparent slot
        const c = palette[k];
        const dist = (r - c[0]) ** 2 + (g - c[1]) ** 2 + (b - c[2]) ** 2;
        if (dist < best) { best = dist; idx = k; }
      }
      nearest.set(key, idx);
    }
    out[q] = idx;
  }
  return out;
}
// Each frame after the first only stores the pixels that changed; the rest are
// transparent over the previous frame (dispose 1 = keep). Photos stay small this way.
let prev = null;
for (let i = 0; i < frames; i++) {
  const png = PNG.sync.read(shots[i]);
  const idx = indexFrame(png.data);
  const delay = Math.round(1000 / fps);
  if (!prev) {
    gif.writeFrame(idx, png.width, png.height, { palette, delay, repeat: 0, dispose: 1 });
  } else {
    const frame = new Uint8Array(idx.length);
    for (let k = 0; k < idx.length; k++) frame[k] = idx[k] === prev[k] ? TRANSPARENT : idx[k];
    gif.writeFrame(frame, png.width, png.height, { palette, delay, transparent: true, transparentIndex: TRANSPARENT, dispose: 1 });
  }
  prev = idx;
}
gif.finish();
writeFileSync(out, gif.bytes());
await browser.close();
console.log(`${frames} frames, ${(gif.bytes().length / 1048576).toFixed(2)} MB -> ${out}`);
