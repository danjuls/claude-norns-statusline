import { describe, it, expect } from 'vitest';
import { sparkline } from '../../src/utils/sparkline.js';

describe('sparkline', () => {
  it('returns empty string for empty input', () => {
    expect(sparkline([])).toBe('');
  });

  it('renders flat line for constant values', () => {
    const result = sparkline([5, 5, 5, 5], 4);
    expect(result).toBe('▂▂▂▂');
  });

  it('renders ascending values', () => {
    const result = sparkline([0, 1, 2, 3, 4, 5, 6, 7], 8);
    expect(result).toBe('▁▂▃▄▅▆▇█');
  });

  it('renders min to max for two values', () => {
    const result = sparkline([0, 100], 2);
    expect(result).toBe('▁█');
  });

  it('resamples to target width', () => {
    const result = sparkline([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], 4);
    expect(result.length).toBe(4);
  });

  it('handles single value', () => {
    const result = sparkline([42], 4);
    expect(result.length).toBe(1); // Only 1 value, no resampling needed
  });

  it('respects custom width', () => {
    const result = sparkline([1, 2, 3, 4, 5, 6], 3);
    expect(result.length).toBe(3);
  });
});
