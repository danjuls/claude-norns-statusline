// ── Subagents Segment ──
// Live view of running subagents (Task tool sidechains).
// Single agent: type · activity · ↑output · elapsed.  Multiple: count + total output.

import type { HookData, Config, SegmentResult } from '../types.js';
import { BaseSegment } from './base.js';
import { getRunningSubagents } from '../utils/subagents.js';
import { formatTokens, formatDuration } from '../utils/format.js';

export class SubagentsSegment extends BaseSegment {
  name = 'subagents';
  defaultPriority = 51;

  async gather(hookData: HookData, config: Config): Promise<SegmentResult | null> {
    const path = hookData.transcript_path;
    if (!path) return null;

    const agents = getRunningSubagents(path);
    if (agents.length === 0) return null;

    const icon = config.charset === 'nerd' ? '▶ ' : '> '; // ▶

    if (agents.length === 1) {
      const a = agents[0];
      const parts = [a.agentType];
      if (a.activity) parts.push(a.activity);
      if (a.outputTokens > 0) parts.push(`↑${formatTokens(a.outputTokens)}`);
      if (a.elapsedMs > 0) parts.push(formatDuration(a.elapsedMs / 1000));
      return this.result(`${icon}${parts.join(' · ')}`);
    }

    const totalOut = agents.reduce((sum, a) => sum + a.outputTokens, 0);
    let content = `${icon}${agents.length} agents`;
    if (totalOut > 0) content += ` · ↑${formatTokens(totalOut)}`;
    return this.result(content);
  }
}
