// ── Theme Registry ──

import type { Theme, ThemeColors, Config } from '../types.js';
import { yggdrasil } from './yggdrasil.js';
import { bifrost } from './bifrost.js';
import { ragnarok } from './ragnarok.js';
import { valhalla } from './valhalla.js';
import { mist } from './mist.js';
import { jotunheim } from './jotunheim.js';

const themes: Record<string, Theme> = {
  yggdrasil,
  bifrost,
  ragnarok,
  valhalla,
  mist,
  jotunheim,
};

export function getTheme(config: Config): Theme {
  if (config.theme === 'custom' && config.customTheme) {
    return {
      name: 'custom',
      description: 'User-defined custom theme',
      colors: config.customTheme as ThemeColors,
    };
  }
  return themes[config.theme] || yggdrasil;
}

export function getAllThemes(): Theme[] {
  return Object.values(themes);
}

export { themes };
