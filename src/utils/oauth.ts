// ── OAuth Usage Tracking ──
// Reads Claude OAuth token and fetches usage from Anthropic API
// Token sources (tried in order):
//   1. ~/.claude/.credentials.json
//   2. macOS Keychain (Claude Code-credentials)
//   3. CLAUDE_CODE_OAUTH_TOKEN env var

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execFileSync } from 'child_process';
import { join } from 'path';
import { homedir } from 'os';
import { request } from 'https';
import type { OAuthUsage } from '../types.js';
import { getCached, setCache } from './cache.js';

const CREDENTIALS_PATH = join(homedir(), '.claude', '.credentials.json');
const KEYCHAIN_SERVICE = 'Claude Code-credentials';
const USAGE_API = 'https://api.anthropic.com/api/oauth/usage';
const TOKEN_API = 'https://platform.claude.com/v1/oauth/token';
const CLIENT_ID = '9d1c250a-e61b-44d9-88ed-5944d1962f5e';
const CACHE_KEY = 'oauth-usage';

const PLAN_NAMES: Record<string, string> = {
  default_claude_pro: 'Pro',
  default_claude_max_5x: 'Max 5x',
  default_claude_max_20x: 'Max 20x',
};

interface CredentialsData {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  rateLimitTier?: string;
  source?: 'file' | 'keychain' | 'env';
}

// ── Token Discovery ──

function isTokenExpired(expiresAt?: number): boolean {
  if (!expiresAt) return false; // can't tell — assume valid
  return Date.now() > expiresAt;
}

function readCredentialsFile(): CredentialsData | null {
  try {
    if (!existsSync(CREDENTIALS_PATH)) return null;
    const creds = JSON.parse(readFileSync(CREDENTIALS_PATH, 'utf-8'));
    const oauth = creds?.claudeAiOauth;
    if (!oauth?.accessToken) return null;
    return {
      accessToken: oauth.accessToken,
      refreshToken: oauth.refreshToken,
      expiresAt: oauth.expiresAt,
      rateLimitTier: oauth.rateLimitTier,
      source: 'file',
    };
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
    return {
      accessToken: oauth.accessToken,
      refreshToken: oauth.refreshToken,
      expiresAt: oauth.expiresAt,
      rateLimitTier: oauth.rateLimitTier,
      source: 'keychain',
    };
  } catch {
    return null;
  }
}

function readEnvToken(): CredentialsData | null {
  const token = process.env.CLAUDE_CODE_OAUTH_TOKEN;
  if (!token) return null;
  return { accessToken: token, source: 'env' };
}

/** Returns all credential sources to try in priority order */
function getAllCredentials(): CredentialsData[] {
  const sources: CredentialsData[] = [];
  const file = readCredentialsFile();
  if (file) sources.push(file);
  const keychain = readKeychainToken();
  if (keychain) sources.push(keychain);
  const env = readEnvToken();
  if (env) sources.push(env);
  return sources;
}

// ── Token Refresh ──

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope?: string;
}

function refreshOAuthToken(refreshToken: string): Promise<CredentialsData | null> {
  return new Promise((resolve) => {
    const url = new URL(TOKEN_API);
    const body = JSON.stringify({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: process.env.CLAUDE_CODE_OAUTH_CLIENT_ID || CLIENT_ID,
    });

    const req = request(
      {
        hostname: url.hostname,
        path: url.pathname,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
        timeout: 5000,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk: Buffer) => { data += chunk; });
        res.on('end', () => {
          try {
            const resp: TokenResponse = JSON.parse(data);
            if (!resp.access_token) { resolve(null); return; }
            const expiresAt = Date.now() + resp.expires_in * 1000;
            resolve({
              accessToken: resp.access_token,
              refreshToken: resp.refresh_token,
              expiresAt,
            });
          } catch { resolve(null); }
        });
      }
    );
    req.on('error', () => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });
    req.write(body);
    req.end();
  });
}

/** Persist refreshed tokens to credentials file */
function updateCredentialsFile(creds: CredentialsData): void {
  try {
    if (!existsSync(CREDENTIALS_PATH)) return;
    const raw = JSON.parse(readFileSync(CREDENTIALS_PATH, 'utf-8'));
    if (!raw.claudeAiOauth) return;
    raw.claudeAiOauth.accessToken = creds.accessToken;
    if (creds.refreshToken) raw.claudeAiOauth.refreshToken = creds.refreshToken;
    if (creds.expiresAt) raw.claudeAiOauth.expiresAt = creds.expiresAt;
    writeFileSync(CREDENTIALS_PATH, JSON.stringify(raw, null, 2));
  } catch {
    // Best-effort — don't break if file write fails
  }
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
  // Detect API error responses (e.g. expired token, auth failure)
  if (data.type === 'error' || data.error) {
    const err = data.error as Record<string, unknown> | undefined;
    const code = err?.details
      ? (err.details as Record<string, unknown>).error_code as string
      : 'auth_error';
    return errorResult(code === 'token_expired' ? 'token_expired' : 'auth_error');
  }

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

  const allCreds = getAllCredentials();
  if (allCreds.length === 0) return null;

  // Track plan tier and last error across credential sources
  let planTier: string | undefined;
  let lastError: string | undefined;

  for (const creds of allCreds) {
    if (creds.rateLimitTier) {
      planTier = PLAN_NAMES[creds.rateLimitTier] || creds.rateLimitTier;
    }

    let activeCreds = creds;

    // If token is expired, try to refresh before making API call
    if (isTokenExpired(creds.expiresAt) && creds.refreshToken) {
      const refreshed = await refreshOAuthToken(creds.refreshToken);
      if (refreshed) {
        // Preserve plan tier and source from original credentials
        refreshed.rateLimitTier = creds.rateLimitTier;
        refreshed.source = creds.source;
        // Persist refreshed token to credentials file
        if (creds.source === 'file') updateCredentialsFile(refreshed);
        activeCreds = refreshed;
      } else {
        // Refresh failed — skip this source, try next
        lastError = 'token_expired';
        continue;
      }
    }

    const usage = await fetchUsage(activeCreds.accessToken);

    // If API returned auth error, try refreshing token once
    if (usage.error === 'token_expired' || usage.error === 'auth_error') {
      if (activeCreds.refreshToken && !isTokenExpired(activeCreds.expiresAt)) {
        // Token wasn't detected as expired but API rejected it — try refresh
        const refreshed = await refreshOAuthToken(activeCreds.refreshToken);
        if (refreshed) {
          refreshed.rateLimitTier = creds.rateLimitTier;
          if (creds.source === 'file') updateCredentialsFile(refreshed);
          const retryUsage = await fetchUsage(refreshed.accessToken);
          if (!retryUsage.error) {
            if (planTier) retryUsage.planTier = planTier;
            setCache(CACHE_KEY, retryUsage, cacheTtl);
            return retryUsage;
          }
        }
      }
      // This source failed — try next
      lastError = usage.error;
      continue;
    }

    if (usage.error) {
      // Non-auth failure (network, timeout, parse) — track and try next source
      lastError = usage.error;
      continue;
    }

    if (planTier) usage.planTier = planTier;
    setCache(CACHE_KEY, usage, cacheTtl);
    return usage;
  }

  // All sources exhausted — return the actual last error
  return { sessionUsagePercent: 0, weeklyUsagePercent: 0, resetSeconds: 0, planTier: planTier || 'unknown', error: lastError || 'no_credentials' };
}
