// ── Block Segment ──
// 5-hour rolling window cost/token tracking via transcript

import type { HookData, Config, SegmentResult } from '../types.js';
import { BaseSegment } from './base.js';
import { formatCost, formatTokens, formatDuration } from '../utils/format.js';
import { parseTranscript } from '../utils/transcript.js';
import { getCached, setCache } from '../utils/cache.js';
import type { TranscriptSummary } from '../utils/transcript.js';

const BLOCK_HOURS = 5;
const BLOCK_MS = BLOCK_HOURS * 60 * 60 * 1000;

export class BlockSegment extends BaseSegment {
  name = 'block';
  defaultPriority = 50;

  async gather(hookData: HookData, config: Config): Promise<SegmentResult | null> {
    const transcriptPath = hookData.transcript_path;

    // Try transcript-based tracking first
    if (transcriptPath) {
      const cacheKey = 'block-transcript';
      const ttl = config.cacheTtl.transcript;
      let summary = getCached<TranscriptSummary>(cacheKey, ttl);

      if (!summary) {
        summary = await parseTranscript(transcriptPath) ?? undefined;
        if (summary) setCache(cacheKey, summary, ttl);
      }

      if (summary && summary.durationMs > 0) {
        const parts: string[] = [];
        if (summary.totalCost > 0) parts.push(formatCost(summary.totalCost));
        const totalTokens = summary.totalInputTokens + summary.totalOutputTokens;
        if (totalTokens > 0) parts.push(formatTokens(totalTokens));

        // Show elapsed / block window
        const elapsed = Math.min(summary.durationMs, BLOCK_MS);
        const remaining = BLOCK_MS - elapsed;
        if (remaining > 0) {
          parts.push(`${formatDuration(remaining / 1000)} left`);
        }

        if (parts.length > 0) {
          const icon = config.charset === 'nerd' ? '\uF017 ' : 'Blk ';
          return this.result(`${icon}${parts.join(' · ')}`);
        }
      }
    }

    // Fallback: use session cost data as proxy
    const cost = hookData.cost?.total_cost_usd ?? hookData.session?.cost;
    const cw = hookData.context_window;
    const tokens = (cw?.total_input_tokens !== undefined || cw?.total_output_tokens !== undefined)
      ? (cw.total_input_tokens ?? 0) + (cw.total_output_tokens ?? 0)
      : hookData.token_usage?.total_tokens;
    if (cost === undefined && tokens === undefined) return null;

    const parts: string[] = [];
    if (cost !== undefined) parts.push(formatCost(cost));
    if (tokens !== undefined) parts.push(formatTokens(tokens));

    const icon = config.charset === 'nerd' ? '\uF017 ' : 'Blk '; //  clock

    return this.result(`${icon}${parts.join(' · ')}`);
  }
}
