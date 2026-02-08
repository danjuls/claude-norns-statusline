// ── Session Segment ──
// Shows session cost and token counts

import type { HookData, Config, SegmentResult } from '../types.js';
import { BaseSegment } from './base.js';
import { formatCost, formatTokens } from '../utils/format.js';

export class SessionSegment extends BaseSegment {
  name = 'session';
  defaultPriority = 70;

  async gather(hookData: HookData, config: Config): Promise<SegmentResult | null> {
    // Real Claude Code fields first, then legacy
    const cost = hookData.cost?.total_cost_usd
      ?? hookData.session?.cost
      ?? hookData.token_usage?.total_cost;

    const cw = hookData.context_window;
    const tokens = (cw?.total_input_tokens !== undefined || cw?.total_output_tokens !== undefined)
      ? (cw.total_input_tokens ?? 0) + (cw.total_output_tokens ?? 0)
      : hookData.token_usage?.total_tokens;

    if (cost === undefined && tokens === undefined) return null;

    const parts: string[] = [];

    if (cost !== undefined) {
      parts.push(formatCost(cost));
    }

    if (tokens !== undefined) {
      parts.push(`${formatTokens(tokens)} tok`);
    }

    const icon = config.charset === 'nerd' ? '\uDB80\uDCC7 ' : ''; // 󰳇

    return this.result(`${icon}${parts.join(' \u00B7 ')}`);
  }
}
