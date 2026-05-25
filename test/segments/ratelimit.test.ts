import { describe, it, expect, vi } from 'vitest';
import { RateLimitSegment } from '../../src/segments/ratelimit.js';
import { DEFAULT_CONFIG } from '../../src/config/defaults.js';
import type { HookData, OAuthUsage } from '../../src/types.js';

// Mock OAuth to avoid network calls
vi.mock('../../src/utils/oauth.js', () => ({
  getOAuthUsage: vi.fn(),
}));

import { getOAuthUsage } from '../../src/utils/oauth.js';
const mockGetOAuthUsage = vi.mocked(getOAuthUsage);

const segment = new RateLimitSegment();

describe('RateLimitSegment', () => {
  it('returns null when oauth disabled', async () => {
    const config = { ...DEFAULT_CONFIG, oauth: false };
    expect(await segment.gather({}, config)).toBeNull();
  });

  it('returns null when no usage data', async () => {
    mockGetOAuthUsage.mockResolvedValue(null);
    expect(await segment.gather({}, DEFAULT_CONFIG)).toBeNull();
  });

  it('returns null when usage has error', async () => {
    mockGetOAuthUsage.mockResolvedValue({
      sessionUsagePercent: 0, weeklyUsagePercent: 0,
      resetSeconds: 0, planTier: 'Pro', error: 'network_error',
    });
    expect(await segment.gather({}, DEFAULT_CONFIG)).toBeNull();
  });

  it('returns null when session usage is 0', async () => {
    mockGetOAuthUsage.mockResolvedValue({
      sessionUsagePercent: 0, weeklyUsagePercent: 50,
      resetSeconds: 0, planTier: 'Pro',
    });
    expect(await segment.gather({}, DEFAULT_CONFIG)).toBeNull();
  });

  it('shows bar and percentage for active usage', async () => {
    mockGetOAuthUsage.mockResolvedValue({
      sessionUsagePercent: 75, weeklyUsagePercent: 60,
      resetSeconds: 3600, planTier: 'Pro',
    });
    const result = await segment.gather({}, DEFAULT_CONFIG);
    expect(result).not.toBeNull();
    expect(result!.content).toContain('75%');
    expect(result!.name).toBe('ratelimit');
  });

  it('shows reset timer when usage >= 30%', async () => {
    mockGetOAuthUsage.mockResolvedValue({
      sessionUsagePercent: 50, weeklyUsagePercent: 30,
      resetSeconds: 7200, planTier: 'Pro',
    });
    const result = await segment.gather({}, DEFAULT_CONFIG);
    expect(result!.content).toContain('2h');
  });

  it('hides reset timer when usage < 30%', async () => {
    mockGetOAuthUsage.mockResolvedValue({
      sessionUsagePercent: 20, weeklyUsagePercent: 10,
      resetSeconds: 7200, planTier: 'Pro',
    });
    const result = await segment.gather({}, DEFAULT_CONFIG);
    expect(result!.content).not.toContain('2h');
  });
});
