// ── Directory Segment ──
// CWD with fish-style abbreviation

import type { HookData, Config, SegmentResult } from '../types.js';
import { BaseSegment } from './base.js';
import { abbreviatePath } from '../utils/path.js';

export class DirectorySegment extends BaseSegment {
  name = 'directory';
  defaultPriority = 10;

  async gather(hookData: HookData, config: Config): Promise<SegmentResult | null> {
    const cwd = hookData.workspace?.current_dir || hookData.cwd || process.cwd();
    const maxSegments = (config.segments.directory?.options?.maxSegments as number) ?? 3;
    const display = abbreviatePath(cwd, maxSegments);

    const icon = config.charset === 'nerd' ? '\uF07C ' : ''; //  folder-open

    return this.result(`${icon}${display}`);
  }
}
