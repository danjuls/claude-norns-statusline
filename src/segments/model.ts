// ── Model Segment ──
// Shows the active Claude model name

import type { HookData, Config, SegmentResult } from '../types.js';
import { BaseSegment } from './base.js';
import { formatModelName } from '../utils/format.js';

const MODEL_ICONS: Record<string, string> = {
  opus: '\uDB80\uDE9B',    // 󰦛 brain/star
  sonnet: '\uDB82\uDC13',  // 󱀓 note
  haiku: '\uF4A5',         //  leaf
};

function getModelIcon(id: string): string {
  const lower = id.toLowerCase();
  for (const [key, icon] of Object.entries(MODEL_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return '\uF121'; //  code
}

export class ModelSegment extends BaseSegment {
  name = 'model';
  defaultPriority = 100;

  async gather(hookData: HookData, config: Config): Promise<SegmentResult | null> {
    if (!hookData.model?.id) return null;

    const name = formatModelName(hookData.model.id, hookData.model.display_name);
    const icon = config.charset === 'nerd' ? `${getModelIcon(hookData.model.id)} ` : '';

    return this.result(`${icon}${name}`);
  }
}
