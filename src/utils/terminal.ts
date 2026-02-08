// ── Terminal Detection ──

export function getTerminalWidth(): number {
  try {
    // stdout.columns is unavailable when piped (Claude Code captures output)
    if (process.stdout.columns) return process.stdout.columns;

    // Check env vars that shells/terminals may set
    const cols = parseInt(process.env.COLUMNS || '', 10);
    if (cols > 0) return cols;

    // Generous fallback — most terminals are 150+ wide, and Claude Code
    // handles overflow gracefully. Better to show segments than hide them.
    return 200;
  } catch {
    return 200;
  }
}

export type ColorDepth = 'truecolor' | '256' | '16' | 'none';

export function detectColorDepth(): ColorDepth {
  const colorterm = process.env.COLORTERM;
  if (colorterm === 'truecolor' || colorterm === '24bit') return 'truecolor';

  const term = process.env.TERM || '';
  if (term.includes('256color')) return '256';
  if (term.includes('color') || term.includes('xterm')) return '16';

  // Most modern terminals support truecolor
  if (process.stdout.isTTY) return 'truecolor';

  return 'truecolor';
}
