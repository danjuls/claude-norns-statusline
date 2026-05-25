import { describe, it, expect } from 'vitest';
import { MetricsSegment } from '../../src/segments/metrics.js';
import { DEFAULT_CONFIG } from '../../src/config/defaults.js';
import type { HookData } from '../../src/types.js';

const segment = new MetricsSegment();

describe('MetricsSegment', () => {
  it('returns null when no metrics data', async () => {
    expect(await segment.gather({}, DEFAULT_CONFIG)).toBeNull();
  });

  it('shows message count', async () => {
    const data: HookData = { session: { message_count: 12 } };
    const result = await segment.gather(data, DEFAULT_CONFIG);
    expect(result!.content).toContain('12 msgs');
  });

  it('shows duration', async () => {
    const data: HookData = { cost: { total_duration_ms: 180000 } };
    const result = await segment.gather(data, DEFAULT_CONFIG);
    expect(result!.content).toContain('3m');
  });

  it('shows both when available', async () => {
    const data: HookData = {
      session: { message_count: 5 },
      cost: { total_duration_ms: 60000 },
    };
    const result = await segment.gather(data, DEFAULT_CONFIG);
    expect(result!.content).toContain('5 msgs');
    expect(result!.content).toContain('1m');
  });
});
