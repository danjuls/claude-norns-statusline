// ── Agent Segment ──
// Shows active agent/subagent name

import type { HookData, Config, SegmentResult } from '../types.js';
import { BaseSegment } from './base.js';

export class AgentSegment extends BaseSegment {
  name = 'agent';
  defaultPriority = 55;

  async gather(hookData: HookData, config: Config): Promise<SegmentResult | null> {
    const agentName = hookData.agent?.name;
    if (!agentName) return null;

    const icon = config.charset === 'nerd' ? '\uF0C0 ' : ''; //  users/agent

    return this.result(`${icon}${agentName}`);
  }
}
