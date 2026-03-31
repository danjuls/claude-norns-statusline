import { describe, it, expect } from 'vitest';
import { SessionSegment } from '../../src/segments/session.js';
import { DEFAULT_CONFIG } from '../../src/config/defaults.js';
import type { HookData } from '../../src/types.js';

const segment = new SessionSegment();

describe('SessionSegment', () => {
  it('returns null when no cost or token data', async () => {
    expect(await segment.gather({}, DEFAULT_CONFIG)).toBeNull();
  });

  it('shows cost from real Claude Code fields', async () => {
    const data: HookData = { cost: { total_cost_usd: 0.42 } };
    const result = await segment.gather(data, DEFAULT_CONFIG);
    expect(result!.content).toContain('$0.42');
  });

  it('shows tokens from context_window', async () => {
    const data: HookData = {
      context_window: { total_input_tokens: 30000, total_output_tokens: 5000 },
    };
    const result = await segment.gather(data, DEFAULT_CONFIG);
    expect(result!.content).toContain('35.0K tok');
  });

  it('shows both cost and tokens', async () => {
    const data: HookData = {
      cost: { total_cost_usd: 1.23 },
      context_window: { total_input_tokens: 40000, total_output_tokens: 5000 },
    };
    const result = await segment.gather(data, DEFAULT_CONFIG);
    expect(result!.content).toContain('$1.23');
    expect(result!.content).toContain('45.0K tok');
  });

  it('falls back to legacy fields', async () => {
    const data: HookData = { session: { cost: 0.55 } };
    const result = await segment.gather(data, DEFAULT_CONFIG);
    expect(result!.content).toContain('$0.55');
  });

  it('shows budget warning when cost exceeds warnAt threshold', async () => {
    const data: HookData = { cost: { total_cost_usd: 9.0 } };
    const config = { ...DEFAULT_CONFIG, budget: { daily: 10, warnAt: 80 } };
    const result = await segment.gather(data, config);
    expect(result!.content).toContain('⚠90%');
  });

  it('does not show budget warning below threshold', async () => {
    const data: HookData = { cost: { total_cost_usd: 5.0 } };
    const config = { ...DEFAULT_CONFIG, budget: { daily: 10, warnAt: 80 } };
    const result = await segment.gather(data, config);
    expect(result!.content).not.toContain('⚠');
  });

  it('uses default warnAt of 80 when not specified', async () => {
    const data: HookData = { cost: { total_cost_usd: 8.5 } };
    const config = { ...DEFAULT_CONFIG, budget: { daily: 10 } };
    const result = await segment.gather(data, config);
    expect(result!.content).toContain('⚠85%');
  });
});
