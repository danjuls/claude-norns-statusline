// ── Bifrost Theme ──
// Rainbow bridge, aurora borealis: cyan, violet, rose, gold

import type { Theme } from '../types.js';

export const bifrost: Theme = {
  name: 'bifrost',
  description: 'Rainbow Bridge \u2014 aurora cyan, violet, shimmering rose',
  colors: {
    bg: '#0d1117',
    fg: '#c9d1d9',
    accent: '#56d4c8',
    accent2: '#a371f7',
    dim: '#484f58',
    warning: '#d29922',
    critical: '#f85149',
    success: '#56d4c8',
    separator: '#161b22',
    segments: {
      model: { bg: '#161b22', fg: '#a371f7' },
      git: { bg: '#0d1f2d', fg: '#56d4c8' },
      context: { bg: '#1a1127', fg: '#c9d1d9' },
      session: { bg: '#161b22', fg: '#d2a8ff' },
      usage: { bg: '#0d1f2d', fg: '#56d4c8' },
      block: { bg: '#1a1127', fg: '#c9d1d9' },
      daily: { bg: '#161b22', fg: '#d29922' },
      metrics: { bg: '#0d1f2d', fg: '#56d4c8' },
      version: { bg: '#1a1127', fg: '#484f58' },
      tmux: { bg: '#161b22', fg: '#484f58' },
      directory: { bg: '#0d1f2d', fg: '#56d4c8' },
      custom: { bg: '#1a1127', fg: '#c9d1d9' },
    },
  },
};
