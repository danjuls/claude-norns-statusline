// ── OAuth Usage Tracking ──
// Reads Claude OAuth token and fetches usage from Anthropic API
// Token sources (tried in order):
//   1. ~/.claude/.credentials.json
//   2. macOS Keychain (Claude Code-credentials)
//   3. CLAUDE_CODE_OAUTH_TOKEN env var

import { readFileSync, existsSync } from 'fs';
import { execFileSync } from 'child_process';
import { join } from 'path';
import { homedir } from 'os';
import { request } from 'https';
import type { OAuthUsage } from '../types.js';
import { getCached, setCache } from './cache.js';

const CREDENTIALS_PATH = join(homedir(), '.claude', '.credentials.json');
const KEYCHAIN_SERVICE = 'Claude Code-credentials';
const USAGE_API = 'https://api.anthropic.com/api/oauth/usage';
const CACHE_KEY = 'oauth-usage';

const PLAN_NAMES: Record<string, string> = {
  default_claude_pro: 'Pro',
  default_claude_max_5x: 'Max 5x',
  default_claude_max_20x: 'Max 20x',
};

interface CredentialsData {
  accessToken: string;
  rateLimitTier?: string;
}

// ── Token Discovery ──

function readCredentialsFile(): CredentialsData | null {
  try {
    if (!existsSync(CREDENTIALS_PATH)) return null;
    const creds = JSON.parse(readFileSync(CREDENTIALS_PATH, 'utf-8'));
    const oauth = creds?.claudeAiOauth;
    if (!oauth?.accessToken) return null;
    return { accessToken: oauth.accessToken, rateLimitTier: oauth.rateLimitTier };
  } catch {
    return null;
  }
}

function readKeychainToken(): CredentialsData | null {
  if (process.platform !== 'darwin') return null;
  try {
    const raw = execFileSync(
      'security',
      ['find-generic-password', '-s', KEYCHAIN_SERVICE, '-w'],
      { timeout: 2000, stdio: ['pipe', 'pipe', 'pipe'] },
    ).toString().trim();
    if (!raw) return null;
    const creds = JSON.parse(raw);
    const oauth = creds?.claudeAiOauth;
    if (!oauth?.accessToken) return null;
    return { accessToken: oauth.accessToken, rateLimitTier: oauth.rateLimitTier };
  } catch {
    return null;
  }
}

function readEnvToken(): CredentialsData | null {
  const token = process.env.CLAUDE_CODE_OAUTH_TOKEN;
  if (!token) return null;
  return { accessToken: token };
}

function getCredentials(): CredentialsData | null {
  return readCredentialsFile() || readKeychainToken() || readEnvToken();
}

// ── API Call ──

function fetchUsage(token: string): Promise<OAuthUsage> {
  return new Promise((resolve) => {
    const url = new URL(USAGE_API);
    const req = request(
      {
        hostname: url.hostname,
        path: url.pathname,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'anthropic-beta': 'oauth-2025-04-20',
        },
        timeout: 3000,
      },
      (res) => {
        let body = '';
        res.on('data', (chunk: Buffer) => { body += chunk; });
        res.on('end', () => {
          try {
            const data = JSON.parse(body);
            resolve(parseUsageResponse(data));
          } catch {
            resolve(errorResult('parse_error'));
          }
        });
      }
    );
    req.on('error', () => resolve(errorResult('network_error')));
    req.on('timeout', () => { req.destroy(); resolve(errorResult('timeout')); });
    req.end();
  });
}

function errorResult(error: string): OAuthUsage {
  return { sessionUsagePercent: 0, weeklyUsagePercent: 0, resetSeconds: 0, planTier: 'unknown', error };
}

// ── Response Parsing ──
// API returns: { five_hour: { utilization, resets_at }, seven_day: { utilization },
//               extra_usage?: { is_enabled, utilization, used_credits, monthly_limit } }

function parseUsageResponse(data: Record<string, unknown>): OAuthUsage {
  const fiveHour = data.five_hour as Record<string, unknown> | undefined;
  const sevenDay = data.seven_day as Record<string, unknown> | undefined;

  const sessionPct = typeof fiveHour?.utilization === 'number'
    ? Math.round(fiveHour.utilization) : 0;
  const weeklyPct = typeof sevenDay?.utilization === 'number'
    ? Math.round(sevenDay.utilization) : 0;

  let resetSeconds = 0;
  if (typeof fiveHour?.resets_at === 'string') {
    const resetMs = new Date(fiveHour.resets_at as string).getTime() - Date.now();
    resetSeconds = Math.max(0, Math.round(resetMs / 1000));
  }

  // Plan tier from credentials (not in API response)
  const tier = typeof data._planTier === 'string'
    ? (PLAN_NAMES[data._planTier] || data._planTier as string) : 'Pro';

  return { sessionUsagePercent: sessionPct, weeklyUsagePercent: weeklyPct, resetSeconds, planTier: tier };
}

// ── Public API ──

export async function getOAuthUsage(cacheTtl: number): Promise<OAuthUsage | null> {
  // Check cache first
  const cached = getCached<OAuthUsage>(CACHE_KEY, cacheTtl);
  if (cached) return { ...cached, cached: true };

  const creds = getCredentials();
  if (!creds) return null;

  const usage = await fetchUsage(creds.accessToken);

  // Inject plan tier from credentials
  if (creds.rateLimitTier) {
    usage.planTier = PLAN_NAMES[creds.rateLimitTier] || creds.rateLimitTier;
  }

  if (!usage.error) {
    setCache(CACHE_KEY, usage, cacheTtl);
  }

  return usage;
}
