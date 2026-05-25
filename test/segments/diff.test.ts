import { describe, it, expect } from 'vitest';
import { DiffSegment } from '../../src/segments/diff.js';
import { DEFAULT_CONFIG } from '../../src/config/defaults.js';
import type { HookData } from '../../src/types.js';

const segment = new DiffSegment();

describe('DiffSegment', () => {
  it('returns null when no diff data', async () => {
    expect(await segment.gather({}, DEFAULT_CONFIG)).toBeNull();
  });

  it('returns null when both are zero', async () => {
    const data: HookData = { cost: { total_lines_added: 0, total_lines_removed: 0 } };
    expect(await segment.gather(data, DEFAULT_CONFIG)).toBeNull();
  });

  it('shows lines added', async () => {
    const data: HookData = { cost: { total_lines_added: 142 } };
    const result = await segment.gather(data, DEFAULT_CONFIG);
    expect(result!.content).toContain('+142');
  });

  it('shows lines removed', async () => {
    const data: HookData = { cost: { total_lines_removed: 38 } };
    const result = await segment.gather(data, DEFAULT_CONFIG);
    expect(result!.content).toContain('-38');
  });

  it('shows both added and removed', async () => {
    const data: HookData = { cost: { total_lines_added: 142, total_lines_removed: 38 } };
    const result = await segment.gather(data, DEFAULT_CONFIG);
    expect(result!.content).toContain('+142');
    expect(result!.content).toContain('-38');
    expect(result!.name).toBe('diff');
    expect(result!.priority).toBe(35);
  });

  it('uses text charset', async () => {
    const data: HookData = { cost: { total_lines_added: 10, total_lines_removed: 5 } };
    const config = { ...DEFAULT_CONFIG, charset: 'text' as const };
    const result = await segment.gather(data, config);
    expect(result!.content).toBe('+10 -5');
  });
});
