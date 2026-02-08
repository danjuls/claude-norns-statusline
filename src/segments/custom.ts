// ── Custom Segment ──
// Runs a user-defined shell command

import { execFile } from 'child_process';
import type { HookData, Config, SegmentResult } from '../types.js';
import { BaseSegment } from './base.js';

export class CustomSegment extends BaseSegment {
  name = 'custom';
  defaultPriority = 5;

  async gather(hookData: HookData, config: Config): Promise<SegmentResult | null> {
    const command = config.segments.custom?.options?.command;
    if (!command) return null;

    const output = await new Promise<string>(resolve => {
      execFile('sh', ['-c', command], { timeout: 2000 }, (err, stdout) => {
        resolve(err ? '' : stdout.trim());
      });
    });

    if (!output) return null;

    return this.result(output);
  }
}
