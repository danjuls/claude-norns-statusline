// ── Transcript Parser ──
// JSONL transcript parser for Claude Code session files

import { readFileSync, statSync, existsSync, createReadStream } from 'fs';
import { createInterface } from 'readline';

interface TranscriptMessage {
  role?: string;
  type?: string;
  model?: string;
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
    cache_read_input_tokens?: number;
    cache_creation_input_tokens?: number;
  };
  costUSD?: number;
  timestamp?: string;
}

export interface TranscriptSummary {
  messageCount: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCacheRead: number;
  totalCacheCreation: number;
  totalCost: number;
  durationMs: number;
}

const STREAMING_THRESHOLD = 1_000_000; // 1MB

export async function parseTranscript(path: string): Promise<TranscriptSummary | null> {
  if (!path || !existsSync(path)) return null;

  try {
    const stat = statSync(path);

    // Use streaming for large files
    if (stat.size > STREAMING_THRESHOLD) {
      return parseTranscriptStreaming(path);
    }

    return parseTranscriptSync(path);
  } catch {
    return null;
  }
}

function parseTranscriptSync(path: string): TranscriptSummary {
  const content = readFileSync(path, 'utf-8');
  const lines = content.trim().split('\n');
  return aggregateMessages(lines.map(parseLine).filter(Boolean) as TranscriptMessage[]);
}

async function parseTranscriptStreaming(path: string): Promise<TranscriptSummary> {
  const messages: TranscriptMessage[] = [];

  const rl = createInterface({
    input: createReadStream(path, { encoding: 'utf-8' }),
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    const msg = parseLine(line);
    if (msg) messages.push(msg);
  }

  return aggregateMessages(messages);
}

function parseLine(line: string): TranscriptMessage | null {
  try {
    return JSON.parse(line);
  } catch {
    return null;
  }
}

function aggregateMessages(messages: TranscriptMessage[]): TranscriptSummary {
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let totalCacheRead = 0;
  let totalCacheCreation = 0;
  let totalCost = 0;
  let messageCount = 0;
  let firstTimestamp = 0;
  let lastTimestamp = 0;

  for (const msg of messages) {
    if (msg.usage) {
      totalInputTokens += msg.usage.input_tokens || 0;
      totalOutputTokens += msg.usage.output_tokens || 0;
      totalCacheRead += msg.usage.cache_read_input_tokens || 0;
      totalCacheCreation += msg.usage.cache_creation_input_tokens || 0;
    }
    if (msg.costUSD) totalCost += msg.costUSD;
    if (msg.role) messageCount++;
    if (msg.timestamp) {
      const ts = new Date(msg.timestamp).getTime();
      if (!firstTimestamp || ts < firstTimestamp) firstTimestamp = ts;
      if (ts > lastTimestamp) lastTimestamp = ts;
    }
  }

  return {
    messageCount,
    totalInputTokens,
    totalOutputTokens,
    totalCacheRead,
    totalCacheCreation,
    totalCost,
    durationMs: lastTimestamp - firstTimestamp,
  };
}

// ── Task Tracking ──
// Reconstructs task progress from a transcript's tool_use events.
// Supports both the TaskCreate/TaskUpdate event system and TodoWrite snapshots;
// whichever produced the most recent event wins.

export interface TaskSummary {
  completed: number;
  total: number;
  activeForm: string | null; // present-continuous label of the in-progress task
  lastEventMs: number;       // timestamp of the most recent task event
}

interface TaskState {
  created: { activeForm: string; status: string }[]; // TaskCreate order = id #1..N
  todoSnapshot: { activeForm: string; status: string }[] | null;
  lastTaskEventMs: number;
  lastTodoEventMs: number;
}

function processTaskLine(state: TaskState, line: string): void {
  let entry: { message?: { content?: unknown }; timestamp?: string };
  try {
    entry = JSON.parse(line);
  } catch {
    return;
  }
  const content = entry?.message?.content;
  if (!Array.isArray(content)) return;

  const ts = entry.timestamp ? new Date(entry.timestamp).getTime() : 0;

  for (const block of content) {
    if (!block || block.type !== 'tool_use') continue;
    const input = (block.input ?? {}) as Record<string, unknown>;

    if (block.name === 'TaskCreate') {
      const activeForm = (input.activeForm || input.subject || '') as string;
      state.created.push({ activeForm, status: 'pending' });
      if (ts) state.lastTaskEventMs = Math.max(state.lastTaskEventMs, ts);
    } else if (block.name === 'TaskUpdate') {
      const id = parseInt(String(input.taskId), 10);
      const task = state.created[id - 1];
      if (task && typeof input.status === 'string') task.status = input.status;
      if (ts) state.lastTaskEventMs = Math.max(state.lastTaskEventMs, ts);
    } else if (block.name === 'TodoWrite' && Array.isArray(input.todos)) {
      state.todoSnapshot = (input.todos as Record<string, unknown>[]).map(t => ({
        activeForm: (t.activeForm || t.content || '') as string,
        status: (t.status || 'pending') as string,
      }));
      if (ts) state.lastTodoEventMs = Math.max(state.lastTodoEventMs, ts);
    }
  }
}

function summarizeTasks(state: TaskState): TaskSummary | null {
  const useTodo = state.todoSnapshot !== null && state.lastTodoEventMs >= state.lastTaskEventMs;
  const items = useTodo ? state.todoSnapshot! : state.created;
  if (items.length === 0) return null;

  const completed = items.filter(t => t.status === 'completed').length;
  const active = items.find(t => t.status === 'in_progress');

  return {
    completed,
    total: items.length,
    activeForm: active?.activeForm || null,
    lastEventMs: Math.max(state.lastTaskEventMs, state.lastTodoEventMs),
  };
}

export async function parseTasks(path: string): Promise<TaskSummary | null> {
  if (!path || !existsSync(path)) return null;

  try {
    const state: TaskState = { created: [], todoSnapshot: null, lastTaskEventMs: 0, lastTodoEventMs: 0 };
    const stat = statSync(path);

    if (stat.size > STREAMING_THRESHOLD) {
      const rl = createInterface({
        input: createReadStream(path, { encoding: 'utf-8' }),
        crlfDelay: Infinity,
      });
      for await (const line of rl) processTaskLine(state, line);
    } else {
      for (const line of readFileSync(path, 'utf-8').trim().split('\n')) {
        processTaskLine(state, line);
      }
    }

    return summarizeTasks(state);
  } catch {
    return null;
  }
}
