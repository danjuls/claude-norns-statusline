// ── Jotunheim Theme ──
// Frozen giants' realm: deep navy, glacier cyan, frost white

import type { Theme } from '../types.js';

export const jotunheim: Theme = {
  name: 'jotunheim',
  description: 'Frozen Realm \u2014 deep navy, glacier cyan, frost white',
  colors: {
    bg: '#0a1628',
    fg: '#e3eaf2',
    accent: '#4ec9d4',
    accent2: '#8aaff0',
    dim: '#3a506b',
    warning: '#d4aa4e',
    critical: '#d45858',
    success: '#5eb89a',
    separator: '#122240',
    segments: {
      model: { bg: '#122240', fg: '#8aaff0' },
      git: { bg: '#0a2035', fg: '#4ec9d4' },
      context: { bg: '#122240', fg: '#e3eaf2' },
      session: { bg: '#0a2035', fg: '#d4aa4e' },
      usage: { bg: '#122240', fg: '#4ec9d4' },
      block: { bg: '#0a2035', fg: '#e3eaf2' },
      daily: { bg: '#122240', fg: '#d4aa4e' },
      metrics: { bg: '#0a2035', fg: '#4ec9d4' },
      version: { bg: '#122240', fg: '#3a506b' },
      tmux: { bg: '#0a2035', fg: '#3a506b' },
      directory: { bg: '#122240', fg: '#4ec9d4' },
      custom: { bg: '#0a2035', fg: '#e3eaf2' },
    },
  },
};
