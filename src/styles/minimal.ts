// ── Minimal Style ──
// Clean pipe separators: segment │ segment │ segment

import type { Style, RenderedSegment, CharsetName } from '../types.js';
import { fg, bg, reset } from '../utils/ansi.js';

const SEPARATORS: Record<CharsetName, string> = {
  nerd: ' \u2502 ',   // │
  text: ' | ',
};

export const minimal: Style = {
  name: 'minimal',
  render(segments: RenderedSegment[], charset: CharsetName): string {
    const sep = SEPARATORS[charset];
    const parts = segments.map(s => {
      return `${fg(s.fg)}${s.content}${reset()}`;
    });
    return parts.join(sep);
  },
};
