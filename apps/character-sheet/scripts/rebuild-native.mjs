/**
 * Rebuilds better-sqlite3 against the installed Electron version's Node headers.
 * electron-rebuild doesn't follow pnpm's virtual store symlinks correctly,
 * so we use node-gyp directly here.
 */
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// Read the electron version from the installed package
const electronPkg = JSON.parse(
  readFileSync(
    resolve(require.resolve('electron'), '../package.json'),
    'utf-8',
  ),
);
const electronVersion = electronPkg.version;
console.log(`Rebuilding better-sqlite3 for Electron ${electronVersion}...`);

// Resolve the actual (non-symlinked) better-sqlite3 module directory
const betterSqlitePkg = require.resolve('better-sqlite3/package.json');
const moduleDir = dirname(betterSqlitePkg);
console.log(`Module dir: ${moduleDir}`);

try {
  execSync(
    `node-gyp rebuild --target=${electronVersion} --arch=x64 --dist-url=https://electronjs.org/headers`,
    { cwd: moduleDir, stdio: 'inherit' },
  );
  console.log('✔ Rebuild complete');
} catch (err) {
  console.error('✖ Rebuild failed:', err.message);
  process.exit(1);
}
