// ── Subagent Discovery ──
// Reads running subagents from the session's sidechain transcripts.
// Layout (relative to the main transcript at <slug>/<session>.jsonl):
//   <slug>/<session>/subagents/agent-X.meta.json  → { agentType, description }
//   <slug>/<session>/subagents/agent-X.jsonl       → the subagent's transcript
// A subagent counts as "running" if its .jsonl was modified within FRESH_MS.

import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join } from 'path';

const FRESH_MS = 20_000; // drops the row 20s after the subagent's last activity

export interface SubagentInfo {
  agentType: string;
  description: string;
  model: string | null;
  outputTokens: number;
  activity: string | null; // last action: tool name, "(thinking)", or "(replying)"
  elapsedMs: number;
}

interface TranscriptLine {
  timestamp?: string;
  message?: {
    role?: string;
    model?: string;
    usage?: { output_tokens?: number };
    content?: unknown;
  };
}

/** Derive the subagents dir from the main transcript path. */
function subagentsDir(transcriptPath: string): string {
  return join(transcriptPath.replace(/\.jsonl$/, ''), 'subagents');
}

function lastActivity(content: unknown): string | null {
  if (!Array.isArray(content) || content.length === 0) return null;
  // Walk backwards to the last meaningful block.
  for (let i = content.length - 1; i >= 0; i--) {
    const block = content[i];
    if (!block || typeof block !== 'object') continue;
    if (block.type === 'tool_use') {
      return typeof block.name === 'string' ? block.name : '(tool)';
    }
    if (block.type === 'thinking') return '(thinking)';
    if (block.type === 'text') return '(replying)';
  }
  return null;
}

function parseAgentTranscript(jsonlPath: string): Pick<SubagentInfo, 'model' | 'outputTokens' | 'activity' | 'elapsedMs'> {
  let model: string | null = null;
  let outputTokens = 0;
  let activity: string | null = null;
  let firstTs = 0;
  let lastTs = 0;

  const content = readFileSync(jsonlPath, 'utf-8').trim().split('\n');
  for (const line of content) {
    let entry: TranscriptLine;
    try {
      entry = JSON.parse(line);
    } catch {
      continue;
    }
    const msg = entry.message;
    if (entry.timestamp) {
      const ts = new Date(entry.timestamp).getTime();
      if (!firstTs || ts < firstTs) firstTs = ts;
      if (ts > lastTs) lastTs = ts;
    }
    if (msg?.role === 'assistant') {
      if (msg.model) model = msg.model;
      outputTokens += msg.usage?.output_tokens || 0;
      const act = lastActivity(msg.content);
      if (act) activity = act;
    }
  }

  return { model, outputTokens, activity, elapsedMs: lastTs - firstTs };
}

/** Returns subagents whose transcript was touched within the freshness window. */
export function getRunningSubagents(transcriptPath: string): SubagentInfo[] {
  const dir = subagentsDir(transcriptPath);
  if (!existsSync(dir)) return [];

  const agents: SubagentInfo[] = [];
  const now = Date.now();

  let files: string[];
  try {
    files = readdirSync(dir);
  } catch {
    return [];
  }

  for (const file of files) {
    if (!file.endsWith('.meta.json')) continue;
    const base = file.slice(0, -'.meta.json'.length);
    const jsonlPath = join(dir, `${base}.jsonl`);

    try {
      // Gate on freshness first — avoids parsing transcripts for idle agents.
      const stat = statSync(jsonlPath);
      if (now - stat.mtimeMs > FRESH_MS) continue;

      const meta = JSON.parse(readFileSync(join(dir, file), 'utf-8'));
      const detail = parseAgentTranscript(jsonlPath);

      agents.push({
        agentType: meta.agentType || 'agent',
        description: meta.description || '',
        ...detail,
      });
    } catch {
      continue;
    }
  }

  return agents;
}
