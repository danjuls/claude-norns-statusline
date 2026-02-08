// ── Fish-style Path Abbreviation ──

import { homedir } from 'os';
import { sep } from 'path';

export function abbreviatePath(fullPath: string, maxSegments = 3): string {
  const home = homedir();
  let p = fullPath;

  // Replace home dir with ~
  if (p.startsWith(home)) {
    p = '~' + p.slice(home.length);
  }

  const parts = p.split(sep).filter(Boolean);

  // If within limit, return as-is
  if (parts.length <= maxSegments) {
    return (p.startsWith('~') ? '' : sep) + parts.join(sep);
  }

  // Abbreviate: keep first char of intermediate dirs, full last N
  const head = parts.slice(0, -maxSegments + 1).map(s => s[0]);
  const tail = parts.slice(-maxSegments + 1);
  const prefix = p.startsWith('~') ? '' : sep;

  return prefix + [...head, ...tail].join(sep);
}
