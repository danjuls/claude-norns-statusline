import { describe, it, expect } from 'vitest';
import { getTheme, getAllThemes, themes } from '../src/themes/index.js';
import { DEFAULT_CONFIG } from '../src/config/defaults.js';
import type { Config, ThemeColors } from '../src/types.js';

describe('themes', () => {
  it('has all 7 built-in themes', () => {
    expect(Object.keys(themes)).toHaveLength(7);
    expect(Object.keys(themes)).toEqual(
      expect.arrayContaining(['yggdrasil', 'bifrost', 'ragnarok', 'valhalla', 'mist', 'jotunheim', 'nott'])
    );
  });

  it('getAllThemes returns all themes', () => {
    expect(getAllThemes()).toHaveLength(7);
  });

  it('getTheme returns configured theme', () => {
    const config = { ...DEFAULT_CONFIG, theme: 'bifrost' };
    expect(getTheme(config).name).toBe('bifrost');
  });

  it('falls back to yggdrasil for unknown theme', () => {
    const config = { ...DEFAULT_CONFIG, theme: 'nonexistent' };
    expect(getTheme(config).name).toBe('yggdrasil');
  });

  it('every theme has all required segment colors', () => {
    const requiredSegments = [
      'model', 'git', 'context', 'session', 'usage',
      'block', 'daily', 'metrics', 'version', 'tmux',
      'directory', 'custom',
    ];

    for (const theme of getAllThemes()) {
      for (const seg of requiredSegments) {
        const colors = theme.colors.segments[seg as keyof ThemeColors['segments']];
        expect(colors, `${theme.name} missing colors for ${seg}`).toBeDefined();
        expect(colors.bg, `${theme.name}.${seg} missing bg`).toBeTruthy();
        expect(colors.fg, `${theme.name}.${seg} missing fg`).toBeTruthy();
      }
    }
  });

  it('every theme has base colors', () => {
    for (const theme of getAllThemes()) {
      expect(theme.colors.bg).toBeTruthy();
      expect(theme.colors.fg).toBeTruthy();
      expect(theme.colors.accent).toBeTruthy();
      expect(theme.colors.warning).toBeTruthy();
      expect(theme.colors.critical).toBeTruthy();
    }
  });
});
