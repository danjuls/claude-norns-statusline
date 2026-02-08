// ── Segment Registry ──

export { ModelSegment } from './model.js';
export { GitSegment } from './git.js';
export { ContextSegment } from './context.js';
export { SessionSegment } from './session.js';
export { UsageSegment } from './usage.js';
export { BlockSegment } from './block.js';
export { DailySegment } from './daily.js';
export { MetricsSegment } from './metrics.js';
export { VersionSegment } from './version.js';
export { TmuxSegment } from './tmux.js';
export { DirectorySegment } from './directory.js';
export { CustomSegment } from './custom.js';

import type { Segment } from '../types.js';
import { ModelSegment } from './model.js';
import { GitSegment } from './git.js';
import { ContextSegment } from './context.js';
import { SessionSegment } from './session.js';
import { UsageSegment } from './usage.js';
import { BlockSegment } from './block.js';
import { DailySegment } from './daily.js';
import { MetricsSegment } from './metrics.js';
import { VersionSegment } from './version.js';
import { TmuxSegment } from './tmux.js';
import { DirectorySegment } from './directory.js';
import { CustomSegment } from './custom.js';

export function createSegmentMap(): Record<string, Segment> {
  return {
    model: new ModelSegment(),
    git: new GitSegment(),
    context: new ContextSegment(),
    session: new SessionSegment(),
    usage: new UsageSegment(),
    block: new BlockSegment(),
    daily: new DailySegment(),
    metrics: new MetricsSegment(),
    version: new VersionSegment(),
    tmux: new TmuxSegment(),
    directory: new DirectorySegment(),
    custom: new CustomSegment(),
  };
}
