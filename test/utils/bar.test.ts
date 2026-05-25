import { describe, it, expect } from 'vitest';
import { buildBar, getBarThreshold } from '../../src/utils/bar.js';

describe('buildBar', () => {
  it('builds empty bar at 0%', () => {
    expect(buildBar(0, 10)).toBe('░░░░░░░░░░');
  });

  it('builds full bar at 100%', () => {
    expect(buildBar(100, 10)).toBe('██████████');
  });

  it('builds partial bar', () => {
    const bar = buildBar(50, 10);
    expect(bar.length).toBe(10);
    expect(bar).toBe('█████░░░░░');
  });

  it('clamps to 0-100', () => {
    expect(buildBar(-10, 5)).toBe('░░░░░');
    expect(buildBar(200, 5)).toBe('█████');
  });

  it('supports dot style', () => {
    expect(buildBar(40, 5, 'dot')).toBe('●●○○○');
  });

  it('supports classic style', () => {
    const bar = buildBar(60, 5, 'classic');
    expect(bar.length).toBe(5);
  });
});

describe('getBarThreshold', () => {
  it('returns normal below 70%', () => {
    expect(getBarThreshold(0)).toBe('normal');
    expect(getBarThreshold(69)).toBe('normal');
  });

  it('returns warning at 70-89%', () => {
    expect(getBarThreshold(70)).toBe('warning');
    expect(getBarThreshold(89)).toBe('warning');
  });

  it('returns critical at 90%+', () => {
    expect(getBarThreshold(90)).toBe('critical');
    expect(getBarThreshold(100)).toBe('critical');
  });
});
