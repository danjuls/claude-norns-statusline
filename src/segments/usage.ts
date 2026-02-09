// ── Usage Segment ──
// OAuth API: session/weekly usage %, timer, plan tier

import type { HookData, Config, SegmentResult } from '../types.js';
import { BaseSegment } from './base.js';
import { getOAuthUsage } from '../utils/oauth.js';
import { formatPercent, formatDuration } from '../utils/format.js';

export class UsageSegment extends BaseSegment {
  name = 'usage';
  defaultPriority = 60;

  async gather(hookData: HookData, config: Config): Promise<SegmentResult | null> {
    if (!config.oauth) return null;

    const usage = await getOAuthUsage(config.cacheTtl.oauth);
    if (!usage) return null;

    // Show hint when token is expired and couldn't be refreshed
    if (usage.error === 'token_expired') {
      const icon = config.charset === 'nerd' ? '\uDB80\uDF26 ' : ''; // 󰼦
      return this.result(`${icon}token expired`);
    }
    if (usage.error) return null;

    const parts: string[] = [];

    // Session usage
    if (usage.sessionUsagePercent > 0) {
      parts.push(`S:${formatPercent(usage.sessionUsagePercent)}`);
    }

    // Reset timer (show when session usage is meaningful)
    if (usage.resetSeconds > 0 && usage.sessionUsagePercent >= 50) {
      parts.push(formatDuration(usage.resetSeconds));
    }

    // Weekly usage
    if (usage.weeklyUsagePercent > 0) {
      parts.push(`W:${formatPercent(usage.weeklyUsagePercent)}`);
    }

    // Plan tier (only if not default Pro)
    if (usage.planTier && usage.planTier !== 'Pro' && usage.planTier !== 'unknown') {
      parts.push(usage.planTier);
    }

    if (parts.length === 0) return null;

    const icon = config.charset === 'nerd' ? '\uDB80\uDF26 ' : ''; // 󰼦

    return this.result(`${icon}${parts.join(' \u00B7 ')}`);
  }
}
