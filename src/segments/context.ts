// ── Context Segment ──
// Shows context window usage with progress bar

import type { HookData, Config, SegmentResult } from '../types.js';
import { BaseSegment } from './base.js';
import { buildBar, getBarThreshold } from '../utils/bar.js';
import { formatPercent } from '../utils/format.js';

export class ContextSegment extends BaseSegment {
  name = 'context';
  defaultPriority = 80;

  async gather(hookData: HookData, config: Config): Promise<SegmentResult | null> {
    // Try real Claude Code fields first, then legacy
    let pct: number | null = null;

    if (hookData.context_window?.used_percentage !== undefined) {
      pct = hookData.context_window.used_percentage;
    } else if (hookData.context_window?.remaining_percentage !== undefined) {
      pct = 100 - hookData.context_window.remaining_percentage;
    } else if (hookData.context?.percentage !== undefined) {
      pct = hookData.context.percentage;
    } else if (hookData.token_usage?.percentage_remaining !== undefined) {
      pct = 100 - hookData.token_usage.percentage_remaining;
    }

    if (pct === null) return null;

    // Normalize so compaction threshold (default 80%) displays as 100%
    const ceiling = config.contextCeiling;
    if (ceiling && ceiling > 0 && ceiling < 100) {
      pct = Math.min(100, (pct / ceiling) * 100);
    }

    const bar = buildBar(pct, config.barWidth, config.barStyle);
    const label = formatPercent(pct);
    const icon = config.charset === 'nerd' ? '\uF0D0 ' : 'Ctx '; //

    return this.result(`${icon}${bar} ${label}`);
  }
}
