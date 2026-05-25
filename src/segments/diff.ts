// ── Diff Segment ──
// Lines added/removed this session, from Claude Code's cost.total_lines_* fields.

import type { HookData, Config, SegmentResult } from '../types.js';
import { BaseSegment } from './base.js';
import { formatTokens } from '../utils/format.js';

export class DiffSegment extends BaseSegment {
  name = 'diff';
  defaultPriority = 53;

  async gather(hookData: HookData, config: Config): Promise<SegmentResult | null> {
    const added = hookData.cost?.total_lines_added ?? 0;
    const removed = hookData.cost?.total_lines_removed ?? 0;

    if (added === 0 && removed === 0) return null;

    const parts: string[] = [];
    if (added > 0) parts.push(`+${formatTokens(added)}`);
    if (removed > 0) parts.push(`-${formatTokens(removed)}`);

    const icon = config.charset === 'nerd' ? ' ' : ''; //  diff
    return this.result(`${icon}${parts.join(' ')}`);
  }
}
