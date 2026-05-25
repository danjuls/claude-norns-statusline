// ── Activity Segment ──
// Shows what Claude is currently doing based on recent transcript entries

import { openSync, readSync, closeSync, existsSync, statSync } from 'fs';
import type { HookData, Config, SegmentResult } from '../types.js';
import { BaseSegment } from './base.js';
import { getCached, setCache } from '../utils/cache.js';

interface ActivityInfo {
  label: string;
  timestamp: number;
}

const CACHE_KEY = 'activity-last';
const TAIL_BYTES = 8192; // Read last 8KB of transcript
const STALE_MS = 30_000; // Activity older than 30s is stale

const TOOL_LABELS: Record<string, string> = {
  Read: 'reading',
  Edit: 'editing',
  Write: 'writing',
  Bash: 'running cmd',
  Grep: 'searching',
  Glob: 'finding files',
  Agent: 'subagent',
  WebSearch: 'web search',
  WebFetch: 'fetching',
};

export class ActivitySegment extends BaseSegment {
  name = 'activity';
  defaultPriority = 15;

  async gather(hookData: HookData, config: Config): Promise<SegmentResult | null> {
    const transcriptPath = hookData.transcript_path;
    if (!transcriptPath) return null;

    const ttl = config.cacheTtl.transcript;
    let info = getCached<ActivityInfo>(CACHE_KEY, ttl);

    if (!info) {
      info = parseLastActivity(transcriptPath);
      if (info) setCache(CACHE_KEY, info, ttl);
    }

    if (!info) return null;

    // Don't show stale activity
    if (Date.now() - info.timestamp > STALE_MS) return null;

    const icon = config.charset === 'nerd' ? '\uF085 ' : ''; //  gears

    return this.result(`${icon}${info.label}`);
  }
}

function parseLastActivity(path: string): ActivityInfo | null {
  try {
    if (!existsSync(path)) return null;

    const stat = statSync(path);
    const size = stat.size;
    const fd = openSync(path, 'r');
    const readSize = Math.min(TAIL_BYTES, size);
    const buf = Buffer.alloc(readSize);
    readSync(fd, buf, 0, readSize, Math.max(0, size - readSize));
    closeSync(fd);

    const tail = buf.toString('utf-8');
    const lines = tail.split('\n').filter(Boolean);

    // Scan from end for most recent tool use
    for (let i = lines.length - 1; i >= 0; i--) {
      try {
        const entry = JSON.parse(lines[i]);

        // Look for tool_use content blocks
        if (entry.type === 'assistant' && Array.isArray(entry.message?.content)) {
          for (const block of entry.message.content) {
            if (block.type === 'tool_use') {
              const toolName = block.name || '';
              const label = TOOL_LABELS[toolName] || toolName.toLowerCase();
              const target = extractTarget(toolName, block.input);
              const ts = entry.timestamp ? new Date(entry.timestamp).getTime() : Date.now();
              return { label: target ? `${label} ${target}` : label, timestamp: ts };
            }
          }
        }
      } catch {
        continue;
      }
    }

    return null;
  } catch {
    return null;
  }
}

function extractTarget(tool: string, input: Record<string, unknown>): string {
  if (!input) return '';

  // Extract meaningful short context from tool input
  if (tool === 'Read' || tool === 'Edit' || tool === 'Write') {
    const fp = input.file_path as string;
    if (fp) {
      const parts = fp.split('/');
      return parts[parts.length - 1] || '';
    }
  }

  if (tool === 'Bash') {
    const cmd = input.command as string;
    if (cmd) {
      // First word of command, truncated
      const first = cmd.split(/\s+/)[0];
      return first.length > 15 ? first.slice(0, 12) + '…' : first;
    }
  }

  if (tool === 'Grep' || tool === 'Glob') {
    return (input.pattern as string || '').slice(0, 15);
  }

  return '';
}
