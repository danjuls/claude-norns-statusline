// ── Metrics Segment ──
// Response time, message count

import type { HookData, Config, SegmentResult } from '../types.js';
import { BaseSegment } from './base.js';
import { formatDuration } from '../utils/format.js';

export class MetricsSegment extends BaseSegment {
  name = 'metrics';
  defaultPriority = 40;

  async gather(hookData: HookData, config: Config): Promise<SegmentResult | null> {
    const msgs = hookData.session?.message_count ?? hookData.session?.num_turns;
    const duration = hookData.cost?.total_duration_ms ?? hookData.session?.duration_ms;

    if (msgs === undefined && duration === undefined) return null;

    const parts: string[] = [];

    if (msgs !== undefined) {
      const icon = config.charset === 'nerd' ? '\uF4A6 ' : ''; //  messages
      parts.push(`${icon}${msgs} msgs`);
    }

    if (duration !== undefined) {
      parts.push(formatDuration(duration / 1000));
    }

    return this.result(parts.join(' \u00B7 '));
  }
}
