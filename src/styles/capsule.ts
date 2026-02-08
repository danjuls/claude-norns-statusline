// ── Capsule Style ──
// Rounded pills: (segment) (segment) (segment)

import type { Style, RenderedSegment, CharsetName } from '../types.js';
import { fg, bg, fgBg, reset } from '../utils/ansi.js';

const CAPS: Record<CharsetName, { left: string; right: string }> = {
  nerd: { left: '\uE0B6', right: '\uE0B4' },  // Powerline round caps
  text: { left: '(', right: ')' },
};

export const capsule: Style = {
  name: 'capsule',
  render(segments: RenderedSegment[], charset: CharsetName): string {
    const cap = CAPS[charset];
    const parts = segments.map(s => {
      const open = `${fg(s.bg)}${cap.left}`;
      const content = `${fgBg(s.fg, s.bg)} ${s.content} `;
      const close = `${reset()}${fg(s.bg)}${cap.right}${reset()}`;
      return open + content + close;
    });
    return parts.join(' ');
  },
};
