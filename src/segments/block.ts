// ── Block Segment ──
// 5-hour block cost/token tracking

import type { HookData, Config, SegmentResult } from '../types.js';
import { BaseSegment } from './base.js';
import { formatCost, formatTokens } from '../utils/format.js';

export class BlockSegment extends BaseSegment {
  name = 'block';
  defaultPriority = 50;

  async gather(hookData: HookData, config: Config): Promise<SegmentResult | null> {
    // Block tracking uses transcript data — requires transcript_path
    // For now, rely on cost data as proxy
    const cost = hookData.cost?.total_cost_usd ?? hookData.session?.cost;
    const cw = hookData.context_window;
    const tokens = (cw?.total_input_tokens !== undefined || cw?.total_output_tokens !== undefined)
      ? (cw.total_input_tokens ?? 0) + (cw.total_output_tokens ?? 0)
      : hookData.token_usage?.total_tokens;
    if (cost === undefined && tokens === undefined) return null;

    const parts: string[] = [];
    if (cost !== undefined) parts.push(formatCost(cost));
    if (tokens !== undefined) parts.push(formatTokens(tokens));

    const icon = config.charset === 'nerd' ? '\uF017 ' : 'Blk '; //  clock

    return this.result(`${icon}${parts.join(' \u00B7 ')}`);
  }
}
