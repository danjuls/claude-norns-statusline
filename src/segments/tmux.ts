// ── Tmux Segment ──
// Tmux session name

import { execFile } from 'child_process';
import type { HookData, Config, SegmentResult } from '../types.js';
import { BaseSegment } from './base.js';

export class TmuxSegment extends BaseSegment {
  name = 'tmux';
  defaultPriority = 20;

  async gather(hookData: HookData, config: Config): Promise<SegmentResult | null> {
    const tmux = process.env.TMUX;
    if (!tmux) return null;

    const sessionName = process.env.TMUX_PANE
      ? await this.getSessionName()
      : null;

    if (!sessionName) return null;

    const icon = config.charset === 'nerd' ? '\uEBC8 ' : 'tmux:'; //

    return this.result(`${icon}${sessionName}`);
  }

  private getSessionName(): Promise<string | null> {
    return new Promise(resolve => {
      execFile('tmux', ['display-message', '-p', '#S'], { timeout: 1000 }, (err, stdout) => {
        resolve(err ? null : stdout.trim() || null);
      });
    });
  }
}
