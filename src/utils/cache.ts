// ── File-based Cache with TTL ──

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import type { CacheEntry } from '../types.js';

const CACHE_DIR = join(
  process.env.XDG_CACHE_HOME || join(homedir(), '.cache'),
  'claude-norns-statusline'
);

function ensureCacheDir(): void {
  if (!existsSync(CACHE_DIR)) {
    mkdirSync(CACHE_DIR, { recursive: true });
  }
}

export function getCached<T>(key: string, ttlSeconds: number): T | null {
  try {
    const path = join(CACHE_DIR, `${key}.json`);
    if (!existsSync(path)) return null;

    const entry: CacheEntry<T> = JSON.parse(readFileSync(path, 'utf-8'));
    const age = (Date.now() - entry.timestamp) / 1000;
    if (age > ttlSeconds) return null;

    return entry.data;
  } catch {
    return null;
  }
}

export function setCache<T>(key: string, data: T, ttlSeconds: number): void {
  try {
    ensureCacheDir();
    const entry: CacheEntry<T> = { data, timestamp: Date.now(), ttl: ttlSeconds };
    writeFileSync(join(CACHE_DIR, `${key}.json`), JSON.stringify(entry));
  } catch {
    // Silently fail — caching is best-effort
  }
}
