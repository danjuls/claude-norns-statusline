import { defineConfig } from 'tsup';

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
});
