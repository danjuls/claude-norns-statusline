import { describe, it, expect } from 'vitest';
import { getStyle, styles } from '../src/styles/index.js';
import { visibleLength } from '../src/utils/ansi.js';
import type { RenderedSegment } from '../src/types.js';

const sampleSegments: RenderedSegment[] = [
  { name: 'model', content: 'Opus', bg: '#2e261f', fg: '#d4a847', priority: 100 },
  { name: 'git', content: 'main', bg: '#1f2a1a', fg: '#7c9a5e', priority: 90 },
];

describe('styles', () => {
  it('has all 3 built-in styles', () => {
    expect(Object.keys(styles)).toEqual(
      expect.arrayContaining(['minimal', 'powerline', 'capsule'])
    );
  });

  it('getStyle returns configured style', () => {
    expect(getStyle('minimal').name).toBe('minimal');
    expect(getStyle('powerline').name).toBe('powerline');
    expect(getStyle('capsule').name).toBe('capsule');
  });

  it('falls back to powerline for unknown style', () => {
    expect(getStyle('nonexistent' as any).name).toBe('powerline');
  });

  for (const [name, style] of Object.entries(styles)) {
    it(`${name} renders non-empty output`, () => {
      const output = style.render(sampleSegments, 'nerd');
      expect(output.length).toBeGreaterThan(0);
      expect(visibleLength(output)).toBeGreaterThan(0);
    });

    it(`${name} renders with text charset`, () => {
      const output = style.render(sampleSegments, 'text');
      expect(visibleLength(output)).toBeGreaterThan(0);
    });

    it(`${name} handles empty segments`, () => {
      const output = style.render([], 'nerd');
      expect(output).toBe('');
    });

    it(`${name} handles single segment`, () => {
      const output = style.render([sampleSegments[0]], 'nerd');
      expect(visibleLength(output)).toBeGreaterThan(0);
    });
  }
});
