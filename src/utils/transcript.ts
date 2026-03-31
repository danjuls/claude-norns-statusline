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

// ── Bucket Aggregation (for sparkline) ──

export async function parseTranscriptBuckets(path: string, bucketCount = 16): Promise<number[] | null> {
  if (!path || !existsSync(path)) return null;

  try {
    const stat = statSync(path);
    const content = stat.size > STREAMING_THRESHOLD
      ? await readStreamingLines(path)
      : readFileSync(path, 'utf-8').trim().split('\n');

    const entries: { ts: number; cost: number }[] = [];
    for (const line of content) {
      const msg = parseLine(line);
      if (msg?.costUSD && msg.timestamp) {
        entries.push({ ts: new Date(msg.timestamp).getTime(), cost: msg.costUSD });
      }
    }

    if (entries.length < 2) return null;

    entries.sort((a, b) => a.ts - b.ts);
    const start = entries[0].ts;
    const end = entries[entries.length - 1].ts;
    const span = end - start;
    if (span <= 0) return null;

    const buckets = new Array(bucketCount).fill(0);
    for (const e of entries) {
      const idx = Math.min(Math.floor(((e.ts - start) / span) * bucketCount), bucketCount - 1);
      buckets[idx] += e.cost;
    }

    return buckets;
  } catch {
    return null;
  }
}

async function readStreamingLines(path: string): Promise<string[]> {
  const lines: string[] = [];
  const rl = createInterface({
    input: createReadStream(path, { encoding: 'utf-8' }),
    crlfDelay: Infinity,
  });
  for await (const line of rl) {
    lines.push(line);
  }
  return lines;
}

// ── Summary Aggregation ──

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
