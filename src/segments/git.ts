// ── Git Segment ──
// Branch name, dirty status, ahead/behind, stash

import type { HookData, Config, SegmentResult } from '../types.js';
import { BaseSegment } from './base.js';
import { getGitInfo } from '../utils/git-ops.js';

export class GitSegment extends BaseSegment {
  name = 'git';
  defaultPriority = 90;

  async gather(hookData: HookData, config: Config): Promise<SegmentResult | null> {
    const git = await getGitInfo(hookData.cwd);
    if (!git || !git.isRepo) return null;

    const icon = config.charset === 'nerd' ? '\uE0A0 ' : ''; //  branch

    const parts: string[] = [`${icon}${git.branch}`];

    // Status indicators
    const indicators: string[] = [];
    if (git.staged > 0) indicators.push(`+${git.staged}`);
    if (git.unstaged > 0) indicators.push(`~${git.unstaged}`);
    if (git.untracked > 0) indicators.push(`?${git.untracked}`);
    if (git.ahead > 0) indicators.push(`\u2191${git.ahead}`);
    if (git.behind > 0) indicators.push(`\u2193${git.behind}`);
    if (git.stashCount > 0) indicators.push(`\u2691${git.stashCount}`);

    if (indicators.length > 0) {
      parts.push(indicators.join(' '));
    } else if (git.dirty) {
      parts.push('\u25CF'); // ● dirty marker
    }

    return this.result(parts.join(' '));
  }
}
