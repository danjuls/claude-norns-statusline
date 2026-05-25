// ── Nott Theme ──
// Nott, goddess of Night: a Tokyo Night palette - midnight indigo, soft blue, twilight violet

import type { Theme } from '../types.js';

export const nott: Theme = {
  name: 'nott',
  description: 'Goddess of Night - midnight indigo, soft blue, twilight violet',
  colors: {
    bg: '#1a1b26',
    fg: '#c0caf5',
    accent: '#7aa2f7',
    accent2: '#bb9af7',
    dim: '#565f89',
    warning: '#e0af68',
    critical: '#f7768e',
    success: '#9ece6a',
    separator: '#16161e',
    segments: {
      model: { bg: '#24283b', fg: '#7aa2f7' },
      git: { bg: '#1f2335', fg: '#9ece6a' },
      context: { bg: '#24283b', fg: '#c0caf5' },
      session: { bg: '#1f2335', fg: '#e0af68' },
      usage: { bg: '#24283b', fg: '#7dcfff' },
      ratelimit: { bg: '#1f2335', fg: '#f7768e' },
      agent: { bg: '#24283b', fg: '#bb9af7' },
      tasks: { bg: '#1f2335', fg: '#9ece6a' },
      subagents: { bg: '#24283b', fg: '#bb9af7' },
      block: { bg: '#1f2335', fg: '#c0caf5' },
      daily: { bg: '#24283b', fg: '#ff9e64' },
      diff: { bg: '#1f2335', fg: '#9ece6a' },
      metrics: { bg: '#1f2335', fg: '#7dcfff' },
      sparkline: { bg: '#24283b', fg: '#bb9af7' },
      activity: { bg: '#1f2335', fg: '#565f89' },
      version: { bg: '#24283b', fg: '#565f89' },
      tmux: { bg: '#1f2335', fg: '#565f89' },
      directory: { bg: '#24283b', fg: '#7dcfff' },
      custom: { bg: '#1f2335', fg: '#c0caf5' },
    },
  },
};
