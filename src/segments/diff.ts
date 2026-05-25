// ── Diff Stats Segment ──
// Shows lines added/removed in the current session

import type { HookData, Config, SegmentResult } from '../types.js';
import { BaseSegment } from './base.js';

export class DiffSegment extends BaseSegment {
  name = 'diff';
  defaultPriority = 35;

  async gather(hookData: HookData, config: Config): Promise<SegmentResult | null> {
    const added = hookData.cost?.total_lines_added;
    const removed = hookData.cost?.total_lines_removed;

    if (added === undefined && removed === undefined) return null;
    if ((added ?? 0) === 0 && (removed ?? 0) === 0) return null;

    const parts: string[] = [];
    if (added !== undefined && added > 0) parts.push(`+${added}`);
    if (removed !== undefined && removed > 0) parts.push(`-${removed}`);

    const icon = config.charset === 'nerd' ? ' ' : ''; //  diff

    return this.result(`${icon}${parts.join(' ')}`);
  }
}
