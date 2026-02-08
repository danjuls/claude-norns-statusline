// ── Powerline Style ──
// Arrow glyph separators: segment▸segment▸segment

import type { Style, RenderedSegment, CharsetName } from '../types.js';
import { fg, bg, fgBg, reset } from '../utils/ansi.js';

const ARROW: Record<CharsetName, string> = {
  nerd: '\uE0B0',   // Powerline arrow
  text: '>',
};

export const powerline: Style = {
  name: 'powerline',
  render(segments: RenderedSegment[], charset: CharsetName): string {
    const arrow = ARROW[charset];
    let result = '';

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      const next = segments[i + 1];

      // Segment content with bg + fg
      result += `${fgBg(seg.fg, seg.bg)} ${seg.content} `;

      // Arrow: fg = current bg, bg = next bg (or reset)
      if (next) {
        result += `${fgBg(seg.bg, next.bg)}${arrow}`;
      } else {
        result += `${reset()}${fg(seg.bg)}${arrow}${reset()}`;
      }
    }

    return result;
  },
};
