// ── Sparkline Segment ──
// Tiny inline sparkline showing cost-over-time from transcript

import type { HookData, Config, SegmentResult } from '../types.js';
import { BaseSegment } from './base.js';
import { sparkline } from '../utils/sparkline.js';
import { getCached, setCache } from '../utils/cache.js';
import { parseTranscriptBuckets } from '../utils/transcript.js';

const CACHE_KEY = 'sparkline-buckets';

export class SparklineSegment extends BaseSegment {
  name = 'sparkline';
  defaultPriority = 25;

  async gather(hookData: HookData, config: Config): Promise<SegmentResult | null> {
    const transcriptPath = hookData.transcript_path;
    if (!transcriptPath) return null;

    const width = (config.segments.sparkline?.options?.width as number) ?? 8;
    const ttl = config.cacheTtl.transcript;

    let buckets = getCached<number[]>(CACHE_KEY, ttl);
    if (!buckets) {
      buckets = await parseTranscriptBuckets(transcriptPath);
      if (buckets && buckets.length > 0) {
        setCache(CACHE_KEY, buckets, ttl);
      }
    }

    if (!buckets || buckets.length < 2) return null;

    const chart = sparkline(buckets, width);
    if (!chart) return null;

    const icon = config.charset === 'nerd' ? '\uF080 ' : ''; //  chart

    return this.result(`${icon}${chart}`);
  }
}
