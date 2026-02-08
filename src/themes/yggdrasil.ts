// ── Yggdrasil Theme ──
// The World Tree: deep forest bark browns, moss greens, ancient gold

import type { Theme } from '../types.js';

export const yggdrasil: Theme = {
  name: 'yggdrasil',
  description: 'World Tree \u2014 deep forest bark, moss green, ancient gold',
  colors: {
    bg: '#1a1612',
    fg: '#d4c9b8',
    accent: '#7c9a5e',
    accent2: '#d4a847',
    dim: '#6b5f50',
    warning: '#d4a847',
    critical: '#c44b3f',
    success: '#7c9a5e',
    separator: '#2e261f',
    segments: {
      model: { bg: '#2e261f', fg: '#d4a847' },
      git: { bg: '#1f2a1a', fg: '#7c9a5e' },
      context: { bg: '#2a2318', fg: '#d4c9b8' },
      session: { bg: '#2e261f', fg: '#c9a84c' },
      usage: { bg: '#1f2a1a', fg: '#8aad6a' },
      block: { bg: '#2a2318', fg: '#d4c9b8' },
      daily: { bg: '#2e261f', fg: '#b89a4a' },
      metrics: { bg: '#1f2a1a', fg: '#7c9a5e' },
      version: { bg: '#2a2318', fg: '#6b5f50' },
      tmux: { bg: '#2e261f', fg: '#6b5f50' },
      directory: { bg: '#1f2a1a', fg: '#8aad6a' },
      custom: { bg: '#2a2318', fg: '#d4c9b8' },
    },
  },
};
