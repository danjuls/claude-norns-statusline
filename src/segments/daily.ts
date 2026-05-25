// ── Daily Segment ──
// Daily aggregate usage tracking with persistent cache

import type { HookData, Config, SegmentResult } from '../types.js';
import { BaseSegment } from './base.js';
import { formatCost } from '../utils/format.js';
import { getCached, setCache } from '../utils/cache.js';

interface DailyAccumulator {
  date: string;        // YYYY-MM-DD
  totalCost: number;
  sessionsSeen: Set<string>; // deduplicate by session_id
}

interface DailyCacheData {
  date: string;
  totalCost: number;
  sessionIds: string[];
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

const CACHE_KEY = 'daily-aggregate';
const DAY_TTL = 86400; // 24 hours — stale entries are discarded by date check anyway

export class DailySegment extends BaseSegment {
  name = 'daily';
  defaultPriority = 45;

  async gather(hookData: HookData, config: Config): Promise<SegmentResult | null> {
    const cost = hookData.cost?.total_cost_usd ?? hookData.session?.cost;
    if (cost === undefined) return null;

    const today = todayKey();
    const sessionId = hookData.session_id ?? '';

    // Load or initialize daily accumulator
    const cached = getCached<DailyCacheData>(CACHE_KEY, DAY_TTL);
    let dailyCost: number;

    if (cached && cached.date === today) {
      // Same day — accumulate if new session
      if (sessionId && !cached.sessionIds.includes(sessionId)) {
        cached.totalCost += cost;
        cached.sessionIds.push(sessionId);
        setCache(CACHE_KEY, cached, DAY_TTL);
      } else if (sessionId && cached.sessionIds.includes(sessionId)) {
        // Update existing session's contribution (latest cost replaces)
        // Since we only have the total, just use the larger of cached vs current
        cached.totalCost = Math.max(cached.totalCost, cost);
        setCache(CACHE_KEY, cached, DAY_TTL);
      }
      dailyCost = cached.totalCost;
    } else {
      // New day or no cache — start fresh
      const fresh: DailyCacheData = {
        date: today,
        totalCost: cost,
        sessionIds: sessionId ? [sessionId] : [],
      };
      setCache(CACHE_KEY, fresh, DAY_TTL);
      dailyCost = cost;
    }

    const icon = config.charset === 'nerd' ? '\uF073 ' : 'Day '; //  calendar

    let content = `${icon}${formatCost(dailyCost)}`;

    // Show budget percentage if configured
    if (config.budget?.daily && dailyCost > 0) {
      const pct = Math.round((dailyCost / config.budget.daily) * 100);
      content += ` (${pct}%)`;
    }

    return this.result(content);
  }
}
