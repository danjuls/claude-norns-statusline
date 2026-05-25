// ── Tasks Segment ──
// Task/todo progress from the session transcript: completed/total + active label.
// Hidden once the most recent task event goes stale (defends against leftover lists).

import type { HookData, Config, SegmentResult } from '../types.js';
import { BaseSegment } from './base.js';
import { parseTasks, type TaskSummary } from '../utils/transcript.js';
import { getCached, setCache } from '../utils/cache.js';

const FRESHNESS_MS = 2 * 60 * 1000; // hide if no task activity in the last 2 minutes
const LABEL_MAX = 28;

const EMPTY: TaskSummary = { completed: 0, total: 0, activeForm: null, lastEventMs: 0 };

function truncateLabel(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1).trimEnd() + '…';
}

export class TasksSegment extends BaseSegment {
  name = 'tasks';
  defaultPriority = 52;

  async gather(hookData: HookData, config: Config): Promise<SegmentResult | null> {
    const path = hookData.transcript_path;
    if (!path) return null;

    // Cache the parsed summary per session to avoid re-scanning the transcript each render.
    const key = `tasks-${hookData.session_id || 'default'}`;
    let summary = getCached<TaskSummary>(key, config.cacheTtl.transcript);
    if (!summary) {
      summary = (await parseTasks(path)) ?? EMPTY;
      setCache(key, summary, config.cacheTtl.transcript);
    }

    if (summary.total === 0) return null;
    if (summary.lastEventMs > 0 && Date.now() - summary.lastEventMs > FRESHNESS_MS) return null;

    const icon = config.charset === 'nerd' ? ' ' : ''; //  tasks
    let content = `${icon}${summary.completed}/${summary.total}`;
    if (summary.activeForm) {
      content += ` ${truncateLabel(summary.activeForm, LABEL_MAX)}`;
    }

    return this.result(content);
  }
}
