// ── Glow Shimmer Effect ──
// A traveling light sweep that brightens the theme's existing colors.
// Preserves the theme aesthetic — no rainbow, just a warm glow passing across.
// Animates naturally as Claude Code refreshes the statusline (~150ms).

const ESC = '\x1b[';
const ANSI_RE = /\x1b\[[0-9;]*m/g;
const FG_RE = /\x1b\[38;2;(\d+);(\d+);(\d+)m/;
const BG_RE = /\x1b\[48;2;(\d+);(\d+);(\d+)m/;

function lerp(a: number, b: number, t: number): number {
  return Math.round(a + (b - a) * t);
}

// Brighten an RGB color toward white by intensity (0–1)
function brighten(r: number, g: number, b: number, intensity: number): [number, number, number] {
  return [
    lerp(r, 255, intensity),
    lerp(g, 255, intensity),
    lerp(b, 255, intensity),
  ];
}

/**
 * Apply a traveling glow to an ANSI-colored string.
 * Keeps all theme colors intact but brightens characters as a
 * light band sweeps across, like a reflection on metal.
 */
export function applyShimmer(input: string): string {
  const now = Date.now() / 1000;

  // Two sweep bands at different speeds for depth
  const sweep1 = (now * 25) % 140;   // main glow: 25 chars/sec
  const sweep2 = (now * 15) % 140;   // secondary: 15 chars/sec, subtler
  const bandWidth1 = 14;
  const bandWidth2 = 8;
  const maxBrighten1 = 0.6;  // main band peak brightness boost
  const maxBrighten2 = 0.3;  // secondary band

  // Gentle global pulse (slow breathe)
  const pulse = (Math.sin(now * 2.0) + 1) / 2; // 0–1, ~0.3Hz
  const pulseBoost = pulse * 0.08; // subtle 0–8% base brighten

  // Tokenize: split into ANSI sequences and visible text
  const tokens: Array<{ type: 'ansi' | 'text'; value: string }> = [];
  let lastIndex = 0;
  for (const match of input.matchAll(new RegExp(ANSI_RE.source, 'g'))) {
    if (match.index > lastIndex) {
      tokens.push({ type: 'text', value: input.slice(lastIndex, match.index) });
    }
    tokens.push({ type: 'ansi', value: match[0] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < input.length) {
    tokens.push({ type: 'text', value: input.slice(lastIndex) });
  }

  // Track current colors from ANSI state
  let currentFg: [number, number, number] | null = null;
  let currentBg: [number, number, number] | null = null;
  let charIndex = 0;
  let result = '';

  for (const token of tokens) {
    if (token.type === 'ansi') {
      // Parse and track color state
      const fgMatch = token.value.match(FG_RE);
      if (fgMatch) {
        currentFg = [+fgMatch[1], +fgMatch[2], +fgMatch[3]];
      }
      const bgMatch = token.value.match(BG_RE);
      if (bgMatch) {
        currentBg = [+bgMatch[1], +bgMatch[2], +bgMatch[3]];
      }
      if (token.value === `${ESC}0m`) {
        currentFg = null;
        currentBg = null;
        result += token.value;
        continue;
      }
      // Don't emit original color codes — we'll re-emit modified versions per character
      continue;
    }

    // For each visible character, compute glow intensity
    for (const char of token.value) {
      let intensity = pulseBoost;

      // Main sweep band
      const dist1 = Math.abs(charIndex - sweep1);
      if (dist1 < bandWidth1) {
        intensity += maxBrighten1 * (1 - (dist1 / bandWidth1) ** 2);
      }

      // Secondary sweep band
      const dist2 = Math.abs(charIndex - sweep2);
      if (dist2 < bandWidth2) {
        intensity += maxBrighten2 * (1 - (dist2 / bandWidth2) ** 2);
      }

      intensity = Math.min(intensity, 0.75);

      // Apply brightening to current foreground
      let fgCode = '';
      if (currentFg) {
        const [r, g, b] = brighten(currentFg[0], currentFg[1], currentFg[2], intensity);
        fgCode = `${ESC}38;2;${r};${g};${b}m`;
      }

      // Apply subtle brightening to background too (half intensity)
      let bgCode = '';
      if (currentBg) {
        const [r, g, b] = brighten(currentBg[0], currentBg[1], currentBg[2], intensity * 0.4);
        bgCode = `${ESC}48;2;${r};${g};${b}m`;
      }

      result += `${fgCode}${bgCode}${char}`;
      charIndex++;
    }
  }

  result += `${ESC}0m`;
  return result;
}
