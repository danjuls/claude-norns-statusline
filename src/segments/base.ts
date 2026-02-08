// ── Base Segment ──

import type { Segment, SegmentResult, HookData, Config } from '../types.js';

export abstract class BaseSegment implements Segment {
  abstract name: string;
  abstract defaultPriority: number;

  abstract gather(hookData: HookData, config: Config): Promise<SegmentResult | null>;

  protected result(content: string, priorityOverride?: number): SegmentResult {
    return {
      name: this.name,
      content,
      priority: priorityOverride ?? this.defaultPriority,
    };
  }
}
