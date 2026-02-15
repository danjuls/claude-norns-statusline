// ── Default Configuration ──

import type { Config } from '../types.js';

export const DEFAULT_CONFIG: Config = {
  theme: 'yggdrasil',
  style: 'powerline',
  charset: 'nerd',
  barStyle: 'block',
  barWidth: 10,
  segments: {
    model: { enabled: true, priority: 100 },
    git: { enabled: true, priority: 90 },
    context: { enabled: true, priority: 80 },
    session: { enabled: true, priority: 70 },
    usage: { enabled: true, priority: 60 },
    block: { enabled: false, priority: 50 },
    daily: { enabled: false, priority: 45 },
    metrics: { enabled: false, priority: 40 },
    version: { enabled: false, priority: 30 },
    tmux: { enabled: false, priority: 20 },
    directory: { enabled: false, priority: 10 },
    custom: { enabled: false, priority: 5 },
  },
  contextCeiling: 80,
  shimmer: false,
  oauth: true,
  cacheTtl: {
    git: 5,
    oauth: 60,
    transcript: 30,
  },
};
