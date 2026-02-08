// ── Daily Segment ──
// Daily aggregate usage tracking

import type { HookData, Config, SegmentResult } from '../types.js';
import { BaseSegment } from './base.js';
import { formatCost } from '../utils/format.js';

export class DailySegment extends BaseSegment {
  name = 'daily';
  defaultPriority = 45;

  async gather(hookData: HookData, config: Config): Promise<SegmentResult | null> {
    // Daily tracking is derived from cost data
    const cost = hookData.cost?.total_cost_usd ?? hookData.session?.cost;
    if (cost === undefined) return null;

    const icon = config.charset === 'nerd' ? '\uF073 ' : 'Day '; //  calendar

    let content = `${icon}${formatCost(cost)}`;

    // Show budget warning if configured
    if (config.budget?.daily && cost > 0) {
      const pct = Math.round((cost / config.budget.daily) * 100);
      content += ` (${pct}%)`;
    }

    return this.result(content);
  }
}
