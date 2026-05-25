import { describe, it, expect } from 'vitest';
import { hexToRgb, fg, bg, fgBg, reset, stripAnsi, visibleLength, truncate, lerpColor } from '../../src/utils/ansi.js';

describe('hexToRgb', () => {
  it('converts hex to RGB tuple', () => {
    expect(hexToRgb('#ff0000')).toEqual([255, 0, 0]);
    expect(hexToRgb('#00ff00')).toEqual([0, 255, 0]);
    expect(hexToRgb('#0000ff')).toEqual([0, 0, 255]);
    expect(hexToRgb('ffffff')).toEqual([255, 255, 255]);
  });
});

describe('fg/bg/fgBg', () => {
  it('produces truecolor foreground escape', () => {
    expect(fg('#ff0000')).toBe('\x1b[38;2;255;0;0m');
  });

  it('produces truecolor background escape', () => {
    expect(bg('#00ff00')).toBe('\x1b[48;2;0;255;0m');
  });

  it('combines fg and bg', () => {
    expect(fgBg('#ff0000', '#00ff00')).toBe('\x1b[38;2;255;0;0m\x1b[48;2;0;255;0m');
  });
});

describe('reset', () => {
  it('returns reset escape', () => {
    expect(reset()).toBe('\x1b[0m');
  });
});

describe('stripAnsi', () => {
  it('removes ANSI escape sequences', () => {
    const colored = '\x1b[38;2;255;0;0mhello\x1b[0m';
    expect(stripAnsi(colored)).toBe('hello');
  });

  it('returns plain text unchanged', () => {
    expect(stripAnsi('hello')).toBe('hello');
  });
});

describe('visibleLength', () => {
  it('counts only visible characters', () => {
    const colored = `${fg('#ff0000')}hello${reset()}`;
    expect(visibleLength(colored)).toBe(5);
  });

  it('handles plain text', () => {
    expect(visibleLength('hello')).toBe(5);
  });
});

describe('truncate', () => {
  it('returns string as-is if within width', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });

  it('truncates with ellipsis', () => {
    const result = truncate('hello world', 6);
    expect(stripAnsi(result)).toBe('hello…');
  });

  it('handles ANSI-colored strings', () => {
    const colored = `${fg('#ff0000')}hello world${reset()}`;
    const result = truncate(colored, 6);
    expect(visibleLength(result)).toBeLessThanOrEqual(6);
  });
});

describe('lerpColor', () => {
  it('returns start color at t=0', () => {
    expect(lerpColor('#000000', '#ffffff', 0)).toBe('#000000');
  });

  it('returns end color at t=1', () => {
    expect(lerpColor('#000000', '#ffffff', 1)).toBe('#ffffff');
  });

  it('interpolates midpoint', () => {
    expect(lerpColor('#000000', '#ffffff', 0.5)).toBe('#808080');
  });
});
