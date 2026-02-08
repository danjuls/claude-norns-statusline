// ── Directory Segment ──
// CWD with fish-style abbreviation

import { basename } from 'path';
import type { HookData, Config, SegmentResult } from '../types.js';
import { BaseSegment } from './base.js';

export class DirectorySegment extends BaseSegment {
  name = 'directory';
  defaultPriority = 10;

  async gather(hookData: HookData, config: Config): Promise<SegmentResult | null> {
    const cwd = hookData.workspace?.current_dir || hookData.cwd || process.cwd();
    const dirName = basename(cwd) || cwd;

    const icon = config.charset === 'nerd' ? '\uF07C ' : ''; //  folder-open

    return this.result(`${icon}${dirName}`);
  }
}
