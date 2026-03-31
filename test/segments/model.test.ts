import { describe, it, expect } from 'vitest';
import { ModelSegment } from '../../src/segments/model.js';
import { DEFAULT_CONFIG } from '../../src/config/defaults.js';
import type { HookData } from '../../src/types.js';

const segment = new ModelSegment();

describe('ModelSegment', () => {
  it('returns null when no model data', async () => {
    expect(await segment.gather({}, DEFAULT_CONFIG)).toBeNull();
  });

  it('shows model display name', async () => {
    const data: HookData = { model: { id: 'claude-opus-4-6', display_name: 'Opus 4.6' } };
    const result = await segment.gather(data, DEFAULT_CONFIG);
    expect(result).not.toBeNull();
    expect(result!.content).toContain('Opus 4.6');
    expect(result!.name).toBe('model');
    expect(result!.priority).toBe(100);
  });

  it('parses model ID when no display name', async () => {
    const data: HookData = { model: { id: 'claude-sonnet-4-6' } };
    const result = await segment.gather(data, DEFAULT_CONFIG);
    expect(result!.content).toContain('Sonnet');
  });

  it('uses text fallback when charset is text', async () => {
    const data: HookData = { model: { id: 'claude-opus-4-6', display_name: 'Opus' } };
    const config = { ...DEFAULT_CONFIG, charset: 'text' as const };
    const result = await segment.gather(data, config);
    expect(result!.content).toBe('Opus');
  });
});
