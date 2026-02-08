// ── Progress Bar Builder ──

import type { BarStyle } from '../types.js';

interface BarChars {
  filled: string;
  empty: string;
}

const BAR_CHARS: Record<BarStyle, BarChars> = {
  block: { filled: '\u2588', empty: '\u2591' },   // █ ░
  classic: { filled: '\u2501', empty: '\u2500' },  // ━ ─
  shade: { filled: '\u2593', empty: '\u2591' },    // ▓ ░
  dot: { filled: '\u25CF', empty: '\u25CB' },      // ● ○
  pipe: { filled: '\u2503', empty: '\u250A' },     // ┃ ┊
};

export function buildBar(
  percent: number,
  width: number,
  style: BarStyle = 'block',
): string {
  const chars = BAR_CHARS[style] || BAR_CHARS.block;
  const clamped = Math.max(0, Math.min(100, percent));
  const filled = Math.round((clamped / 100) * width);
  const empty = width - filled;
  return chars.filled.repeat(filled) + chars.empty.repeat(empty);
}

export function getBarThreshold(percent: number): 'normal' | 'warning' | 'critical' {
  if (percent >= 90) return 'critical';
  if (percent >= 70) return 'warning';
  return 'normal';
}
