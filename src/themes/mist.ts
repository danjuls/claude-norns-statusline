// ── Mist Theme ──
// Niflheim fog: deep slate, lavender, pale cyan

import type { Theme } from '../types.js';

export const mist: Theme = {
  name: 'mist',
  description: 'Niflheim Fog \u2014 deep slate, drifting lavender, pale cyan',
  colors: {
    bg: '#2d2d3a',
    fg: '#c8c5d4',
    accent: '#9e8cca',
    accent2: '#6eb8c4',
    dim: '#545472',
    warning: '#c4a84e',
    critical: '#c45858',
    success: '#6eaa78',
    separator: '#3a3a4d',
    segments: {
      model: { bg: '#3a3a4d', fg: '#9e8cca' },
      git: { bg: '#2d3540', fg: '#6eb8c4' },
      context: { bg: '#3a3a4d', fg: '#c8c5d4' },
      session: { bg: '#2d3540', fg: '#c4a84e' },
      usage: { bg: '#3a3a4d', fg: '#9e8cca' },
      ratelimit: { bg: '#2d3540', fg: '#c45858' },
      agent: { bg: '#3a3a4d', fg: '#c4a84e' },
      tasks: { bg: '#2d3540', fg: '#6eaa78' },
      subagents: { bg: '#3a3a4d', fg: '#c4a84e' },
      block: { bg: '#2d3540', fg: '#c8c5d4' },
      daily: { bg: '#3a3a4d', fg: '#c4a84e' },
      diff: { bg: '#2d3540', fg: '#6eaa78' },
      metrics: { bg: '#2d3540', fg: '#6eb8c4' },
      sparkline: { bg: '#3a3a4d', fg: '#9e8cca' },
      activity: { bg: '#2d3540', fg: '#545472' },
      version: { bg: '#3a3a4d', fg: '#545472' },
      tmux: { bg: '#2d3540', fg: '#545472' },
      directory: { bg: '#3a3a4d', fg: '#6eb8c4' },
      custom: { bg: '#2d3540', fg: '#c8c5d4' },
    },
  },
};
