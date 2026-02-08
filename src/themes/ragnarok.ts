// ── Ragnarok Theme ──
// Fire and twilight: ember orange, blood red, molten gold

import type { Theme } from '../types.js';

export const ragnarok: Theme = {
  name: 'ragnarok',
  description: 'Fire & Twilight \u2014 ember orange, blood red, molten gold',
  colors: {
    bg: '#1a1110',
    fg: '#e8d5c4',
    accent: '#e8653a',
    accent2: '#c9352d',
    dim: '#6b4f42',
    warning: '#e8a834',
    critical: '#c9352d',
    success: '#8ab65e',
    separator: '#2a1c18',
    segments: {
      model: { bg: '#2a1c18', fg: '#e8653a' },
      git: { bg: '#241412', fg: '#e88a5e' },
      context: { bg: '#2a1c18', fg: '#e8d5c4' },
      session: { bg: '#241412', fg: '#e8a834' },
      usage: { bg: '#2a1c18', fg: '#e8653a' },
      block: { bg: '#241412', fg: '#e8d5c4' },
      daily: { bg: '#2a1c18', fg: '#e8a834' },
      metrics: { bg: '#241412', fg: '#e88a5e' },
      version: { bg: '#2a1c18', fg: '#6b4f42' },
      tmux: { bg: '#241412', fg: '#6b4f42' },
      directory: { bg: '#2a1c18', fg: '#e88a5e' },
      custom: { bg: '#241412', fg: '#e8d5c4' },
    },
  },
};
