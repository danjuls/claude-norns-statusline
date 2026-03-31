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

    if (usage.error) {
      const icon = config.charset === 'nerd' ? '\uDB80\uDF26 ' : ''; // 󰼦
      if (usage.error === 'token_expired' || usage.error === 'auth_error') {
        return this.result(`${icon}auth expired`);
      }
      // Show brief indicator for transient failures so users know something is off
      if (usage.error === 'network_error') return this.result(`${icon}offline`);
      if (usage.error === 'timeout') return this.result(`${icon}timeout`);
      return null;
    }

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
