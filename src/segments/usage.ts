// ── Usage Segment ──
// Session/weekly usage %, reset timer, plan tier.
// Source priority: rate_limits from stdin (free, no network) → OAuth API fallback.

import type { HookData, Config, SegmentResult, OAuthUsage } from '../types.js';
import { BaseSegment } from './base.js';
import { getOAuthUsage } from '../utils/oauth.js';
import { formatPercent, formatDuration } from '../utils/format.js';

/** Build usage data from the rate_limits block Claude Code ships in stdin. */
function usageFromStdin(rl: NonNullable<HookData['rate_limits']>): OAuthUsage {
  const sessionPct = Math.round(rl.five_hour?.used_percentage ?? 0);
  const weeklyPct = Math.round(rl.seven_day?.used_percentage ?? 0);

  let resetSeconds = 0;
  const resetsAt = rl.five_hour?.resets_at;
  if (typeof resetsAt === 'number') {
    resetSeconds = Math.max(0, Math.round(resetsAt - Date.now() / 1000));
  }

  // Plan tier is not in stdin — leave unknown so it's omitted from output.
  return { sessionUsagePercent: sessionPct, weeklyUsagePercent: weeklyPct, resetSeconds, planTier: 'unknown' };
}

export class UsageSegment extends BaseSegment {
  name = 'usage';
  defaultPriority = 60;

  async gather(hookData: HookData, config: Config): Promise<SegmentResult | null> {
    let usage: OAuthUsage | null = null;

    // Prefer rate limits from stdin — no auth, no network, no failure modes.
    const rl = hookData.rate_limits;
    if (rl && (rl.five_hour || rl.seven_day)) {
      usage = usageFromStdin(rl);
    } else if (config.oauth) {
      usage = await getOAuthUsage(config.cacheTtl.oauth);
    }

    if (!usage) return null;

    // Show hint for auth errors; silently hide for transient failures (network, timeout)
    if (usage.error === 'token_expired' || usage.error === 'auth_error') {
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
