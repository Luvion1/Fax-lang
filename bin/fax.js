#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const root = join(__dirname, '..');
const indexTs = join(root, 'src', 'index.ts');

try {
  // Mencari path absolut ke loader ts-node secara relatif terhadap package ini
  const loaderPath = require.resolve('ts-node/esm');

  const result = spawnSync('node', [
    '--loader', loaderPath,
    '--no-warnings',
    indexTs,
    ...process.argv.slice(2)
  ], {
    stdio: 'inherit'
  });

  process.exit(result.status ?? 0);
} catch (e) {
  console.error("Error: Could not find 'ts-node' loader. Please ensure dependencies are installed.");
  process.exit(1);
}
