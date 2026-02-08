// ── ANSI Color Utilities ──

const ESC = '\x1b[';
const RESET = `${ESC}0m`;

export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

export function fg(hex: string): string {
  const [r, g, b] = hexToRgb(hex);
  return `${ESC}38;2;${r};${g};${b}m`;
}

export function bg(hex: string): string {
  const [r, g, b] = hexToRgb(hex);
  return `${ESC}48;2;${r};${g};${b}m`;
}

export function fgBg(fgHex: string, bgHex: string): string {
  return fg(fgHex) + bg(bgHex);
}

export function reset(): string {
  return RESET;
}

// Strip all ANSI escape sequences for measuring visible length
const ANSI_RE = /\x1b\[[0-9;]*m/g;

export function stripAnsi(str: string): string {
  return str.replace(ANSI_RE, '');
}

export function visibleLength(str: string): number {
  return stripAnsi(str).length;
}

// ANSI-aware truncation: truncate visible characters but preserve escape sequences
export function truncate(str: string, maxWidth: number, ellipsis = '\u2026'): string {
  if (visibleLength(str) <= maxWidth) return str;

  const parts = str.split(ANSI_RE);
  const escapes = str.match(ANSI_RE) || [];

  let result = '';
  let visible = 0;
  const target = maxWidth - ellipsis.length;

  for (let i = 0; i < parts.length; i++) {
    if (i > 0 && escapes[i - 1]) {
      result += escapes[i - 1];
    }
    const part = parts[i];
    if (visible + part.length <= target) {
      result += part;
      visible += part.length;
    } else {
      result += part.slice(0, target - visible);
      visible = target;
      break;
    }
  }

  return result + ellipsis + RESET;
}

// Lerp between two hex colors
export function lerpColor(a: string, b: string, t: number): string {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${bl.toString(16).padStart(2, '0')}`;
}
