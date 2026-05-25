// ── Rate Limit Segment ──
// Visual progress bar of 5-hour usage window with reset timer

import type { HookData, Config, SegmentResult } from '../types.js';
import { BaseSegment } from './base.js';
import { getOAuthUsage } from '../utils/oauth.js';
import { buildBar } from '../utils/bar.js';
import { formatPercent, formatDuration } from '../utils/format.js';

export class RateLimitSegment extends BaseSegment {
  name = 'ratelimit';
  defaultPriority = 65;

  async gather(hookData: HookData, config: Config): Promise<SegmentResult | null> {
    if (!config.oauth) return null;

    const usage = await getOAuthUsage(config.cacheTtl.oauth);
    if (!usage || usage.error) return null;
    if (usage.sessionUsagePercent <= 0) return null;

    const pct = usage.sessionUsagePercent;
    const barWidth = config.segments.ratelimit?.options?.barWidth as number ?? 8;
    const bar = buildBar(pct, barWidth, config.barStyle);

    const parts: string[] = [`${bar} ${formatPercent(pct)}`];

    // Show reset timer when usage is meaningful
    if (usage.resetSeconds > 0 && pct >= 30) {
      parts.push(formatDuration(usage.resetSeconds));
    }

    const icon = config.charset === 'nerd' ? '\uF0E7 ' : 'RL '; //  bolt

    return this.result(`${icon}${parts.join(' · ')}`);
  }
}
