// ── Version Segment ──
// Claude Code version

import { execFile } from 'child_process';
import type { HookData, Config, SegmentResult } from '../types.js';
import { BaseSegment } from './base.js';

export class VersionSegment extends BaseSegment {
  name = 'version';
  defaultPriority = 30;

  async gather(hookData: HookData, config: Config): Promise<SegmentResult | null> {
    // Prefer version from stdin, fall back to shell exec
    let ver = hookData.version;

    if (!ver) {
      ver = await new Promise<string>(resolve => {
        execFile('claude', ['--version'], { timeout: 2000 }, (err, stdout) => {
          resolve(err ? '' : stdout.trim());
        });
      });
    }

    if (!ver) return null;

    // Extract version number if it's a full string
    const match = ver.match(/([\d.]+)/);
    ver = match?.[1] || ver;

    const icon = config.charset === 'nerd' ? '\uF02B ' : 'v'; //  tag

    return this.result(`${icon}${ver}`);
  }
}
