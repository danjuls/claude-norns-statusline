// ── Valhalla Theme ──
// Noble hall of the chosen: silver, ice blue, warm gold (light theme)

import type { Theme } from '../types.js';

export const valhalla: Theme = {
  name: 'valhalla',
  description: 'Hall of the Chosen \u2014 silver light, ice blue, warm gold',
  colors: {
    bg: '#e8e4df',
    fg: '#2a2520',
    accent: '#5da4c7',
    accent2: '#b8941f',
    dim: '#8a8278',
    warning: '#c48f1a',
    critical: '#b33a3a',
    success: '#4a8a5e',
    separator: '#d4d0ca',
    segments: {
      model: { bg: '#d4d0ca', fg: '#5da4c7' },
      git: { bg: '#dce8e4', fg: '#4a8a5e' },
      context: { bg: '#d4d0ca', fg: '#2a2520' },
      session: { bg: '#dce8e4', fg: '#b8941f' },
      usage: { bg: '#d4d0ca', fg: '#5da4c7' },
      ratelimit: { bg: '#dce8e4', fg: '#b33a3a' },
      agent: { bg: '#d4d0ca', fg: '#b8941f' },
      tasks: { bg: '#dce8e4', fg: '#4a8a5e' },
      subagents: { bg: '#d4d0ca', fg: '#b8941f' },
      block: { bg: '#dce8e4', fg: '#2a2520' },
      daily: { bg: '#d4d0ca', fg: '#c48f1a' },
      diff: { bg: '#dce8e4', fg: '#4a8a5e' },
      metrics: { bg: '#dce8e4', fg: '#5da4c7' },
      sparkline: { bg: '#d4d0ca', fg: '#5da4c7' },
      activity: { bg: '#dce8e4', fg: '#8a8278' },
      version: { bg: '#d4d0ca', fg: '#8a8278' },
      tmux: { bg: '#dce8e4', fg: '#8a8278' },
      directory: { bg: '#d4d0ca', fg: '#4a8a5e' },
      custom: { bg: '#dce8e4', fg: '#2a2520' },
    },
  },
};
