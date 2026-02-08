// ── Style Registry ──

import type { Style, StyleName } from '../types.js';
import { minimal } from './minimal.js';
import { powerline } from './powerline.js';
import { capsule } from './capsule.js';

const styles: Record<StyleName, Style> = {
  minimal,
  powerline,
  capsule,
};

export function getStyle(name: StyleName): Style {
  return styles[name] || powerline;
}

export { styles };
