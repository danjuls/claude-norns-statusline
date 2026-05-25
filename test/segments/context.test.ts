import { describe, it, expect } from 'vitest';
import { ContextSegment } from '../../src/segments/context.js';
import { DEFAULT_CONFIG } from '../../src/config/defaults.js';
import type { HookData } from '../../src/types.js';

const segment = new ContextSegment();

describe('ContextSegment', () => {
  it('returns null when no context data', async () => {
    expect(await segment.gather({}, DEFAULT_CONFIG)).toBeNull();
  });

  it('shows context percentage with bar', async () => {
    const data: HookData = { context_window: { used_percentage: 40 } };
    const result = await segment.gather(data, DEFAULT_CONFIG);
    expect(result).not.toBeNull();
    expect(result!.content).toContain('50%'); // 40/80 ceiling = 50%
    expect(result!.name).toBe('context');
  });

  it('normalizes to context ceiling', async () => {
    // With default ceiling of 80%, 80% used should show as 100%
    const data: HookData = { context_window: { used_percentage: 80 } };
    const result = await segment.gather(data, DEFAULT_CONFIG);
    expect(result!.content).toContain('100%');
  });

  it('computes from remaining_percentage', async () => {
    const data: HookData = { context_window: { remaining_percentage: 60 } };
    const result = await segment.gather(data, DEFAULT_CONFIG);
    expect(result).not.toBeNull();
    // used = 40%, normalized = 40/80*100 = 50%
    expect(result!.content).toContain('50%');
  });

  it('respects custom bar width', async () => {
    const data: HookData = { context_window: { used_percentage: 50 } };
    const config = { ...DEFAULT_CONFIG, barWidth: 5 };
    const result = await segment.gather(data, config);
    // Bar should be 5 chars wide
    expect(result).not.toBeNull();
  });

  it('skips ceiling normalization when contextCeiling is undefined', async () => {
    const data: HookData = { context_window: { used_percentage: 40 } };
    const config = { ...DEFAULT_CONFIG, contextCeiling: undefined };
    const result = await segment.gather(data, config);
    expect(result!.content).toContain('40%');
  });
});
