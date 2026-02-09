import { defineConfig } from 'tsup';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node18',
  platform: 'node',
  outDir: 'dist',
  clean: true,
  minify: true,
  treeshake: true,
  splitting: false,
  bundle: true,
  banner: { js: '#!/usr/bin/env node' },
  noExternal: [/.*/],
  define: { 'PKG_VERSION': JSON.stringify(pkg.version) },
});
