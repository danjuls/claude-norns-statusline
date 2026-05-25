import { describe, it, expect } from 'vitest';
import { AgentSegment } from '../../src/segments/agent.js';
import { DEFAULT_CONFIG } from '../../src/config/defaults.js';
import type { HookData } from '../../src/types.js';

const segment = new AgentSegment();

describe('AgentSegment', () => {
  it('returns null when no agent data', async () => {
    expect(await segment.gather({}, DEFAULT_CONFIG)).toBeNull();
  });

  it('returns null when agent has no name', async () => {
    const data: HookData = { agent: {} };
    expect(await segment.gather(data, DEFAULT_CONFIG)).toBeNull();
  });

  it('shows agent name', async () => {
    const data: HookData = { agent: { name: 'Explore' } };
    const result = await segment.gather(data, DEFAULT_CONFIG);
    expect(result!.content).toContain('Explore');
    expect(result!.name).toBe('agent');
    expect(result!.priority).toBe(55);
  });

  it('uses text charset', async () => {
    const data: HookData = { agent: { name: 'Plan' } };
    const config = { ...DEFAULT_CONFIG, charset: 'text' as const };
    const result = await segment.gather(data, config);
    expect(result!.content).toBe('Plan');
  });
});
