// One-step setup for the post-graphics skills. Claude runs this; the person never has to.
// Usage: node setup.mjs
// Installs the renderer once into ~/.post-graphics (or $POST_GRAPHICS_HOME), shared by all three skills.
// Safe to run any time: if everything is already there, it only checks and prints READY.
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const HOME = process.env.POST_GRAPHICS_HOME || join(homedir(), '.post-graphics');
const PKG = join(HOME, 'package.json');
const say = (m) => console.log(`[post-graphics] ${m}`);

const major = Number(process.versions.node.split('.')[0]);
if (major < 18) {
  say(`Node ${process.versions.node} is too old (need 18 or newer). Use the Python scripts instead, or update Node from https://nodejs.org.`);
  process.exit(3);
}

function run(cmd, args) {
  // Windows needs a shell to find npm.cmd / npx.cmd. The arguments are fixed strings in this file.
  const r = process.platform === 'win32'
    ? spawnSync([cmd, ...args].join(' '), { cwd: HOME, stdio: 'inherit', shell: true })
    : spawnSync(cmd, args, { cwd: HOME, stdio: 'inherit' });
  if (r.status !== 0) {
    say(`This step failed: ${cmd} ${args.join(' ')}`);
    process.exit(r.status || 1);
  }
}

async function browserWorks() {
  try {
    const { chromium } = createRequire(PKG)('playwright');
    const b = await chromium.launch();
    await b.close();
    return true;
  } catch {
    return false;
  }
}

function packagesThere() {
  const req = createRequire(PKG);
  try { ['playwright', 'gifenc', 'pngjs'].forEach((n) => req.resolve(n)); return true; } catch { return false; }
}

mkdirSync(HOME, { recursive: true });
if (!existsSync(PKG)) {
  writeFileSync(PKG, JSON.stringify({ name: 'post-graphics-runtime', private: true, description: 'Renderer for the post-graphics Claude skills' }, null, 2));
}

if (!packagesThere()) {
  say(`First-time setup in ${HOME}. This takes a minute or two and only happens once.`);
  run('npm', ['install', '--no-audit', '--no-fund', '--loglevel=error', 'playwright', 'gifenc', 'pngjs']);
}
if (!(await browserWorks())) {
  say('Downloading the browser used to draw graphics (about 150 MB, once).');
  run('npx', ['--yes', 'playwright', 'install', 'chromium']);
  if (!(await browserWorks())) {
    say('The browser still does not start. On Linux, try: npx playwright install --with-deps chromium');
    process.exit(4);
  }
}
say(`READY (${HOME})`);
