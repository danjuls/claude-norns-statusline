// ── Config Loader ──
// Priority: CLI args > env vars > project > user > XDG > defaults

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import type { Config, StyleName, CharsetName, BarStyle } from '../types.js';
import { DEFAULT_CONFIG } from './defaults.js';

function deepMerge<T extends Record<string, unknown>>(base: T, override: Partial<T>): T {
  const result = { ...base };
  for (const key of Object.keys(override) as Array<keyof T>) {
    const val = override[key];
    if (val !== undefined && val !== null) {
      if (typeof val === 'object' && !Array.isArray(val) && typeof result[key] === 'object') {
        result[key] = deepMerge(result[key] as Record<string, unknown>, val as Record<string, unknown>) as T[keyof T];
      } else {
        result[key] = val as T[keyof T];
      }
    }
  }
  return result;
}

function loadJsonFile(path: string): Record<string, unknown> | null {
  try {
    if (!existsSync(path)) return null;
    return JSON.parse(readFileSync(path, 'utf-8'));
  } catch {
    return null;
  }
}

function getConfigPaths(): string[] {
  const home = homedir();
  const xdg = process.env.XDG_CONFIG_HOME || join(home, '.config');
  return [
    join(xdg, 'claude-norns-statusline', 'config.json'),
    join(process.cwd(), '.claude-norns-statusline.json'),
  ];
}

function parseCliArgs(args: string[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (const arg of args) {
    const match = arg.match(/^--(\w[\w-]*)(?:=(.+))?$/);
    if (match) {
      result[match[1]] = match[2] ?? 'true';
    }
  }
  return result;
}

export function loadConfig(cliArgs: string[]): Config {
  let config: Config = JSON.parse(JSON.stringify(DEFAULT_CONFIG));

  // Layer 1: File configs (lowest to highest priority)
  for (const path of getConfigPaths()) {
    const fileConfig = loadJsonFile(path);
    if (fileConfig) {
      config = deepMerge(config, fileConfig as Partial<Config>);
    }
  }

  // Layer 2: Environment variables
  if (process.env.NORNS_THEME) config.theme = process.env.NORNS_THEME;
  if (process.env.NORNS_STYLE) config.style = process.env.NORNS_STYLE as StyleName;
  if (process.env.NORNS_CHARSET) config.charset = process.env.NORNS_CHARSET as CharsetName;
  if (process.env.NORNS_BAR_STYLE) config.barStyle = process.env.NORNS_BAR_STYLE as BarStyle;
  if (process.env.NORNS_SHIMMER === 'true') config.shimmer = true;
  if (process.env.NORNS_OAUTH === 'false') config.oauth = false;

  // Layer 3: CLI args (highest priority)
  const cli = parseCliArgs(cliArgs);
  if (cli.theme) config.theme = cli.theme;
  if (cli.style) config.style = cli.style as StyleName;
  if (cli.charset) config.charset = cli.charset as CharsetName;
  if (cli['bar-style']) config.barStyle = cli['bar-style'] as BarStyle;
  if (cli.shimmer === 'true' || cli.shimmer === '') config.shimmer = true;
  if (cli.shimmer === 'false') config.shimmer = false;
  if (cli.oauth === 'false') config.oauth = false;

  // Multi-line layout: --lines=2 (auto) or handled via config file for explicit arrays
  if (cli.lines) {
    const n = parseInt(cli.lines, 10);
    if (!isNaN(n) && n >= 1 && n <= 4) {
      config.lines = n === 1 ? undefined : n;
    }
  }

  // Enable/disable segments via CLI
  // --segment=true enables, --segment=NUMBER enables with priority, --no-segment disables
  for (const key of Object.keys(config.segments) as Array<keyof Config['segments']>) {
    if (cli[`no-${key}`]) {
      config.segments[key] = { ...config.segments[key], enabled: false };
    }
    const val = cli[key];
    if (val === 'true') {
      config.segments[key] = { ...config.segments[key], enabled: true };
    } else if (val && /^\d+$/.test(val)) {
      config.segments[key] = { ...config.segments[key], enabled: true, priority: parseInt(val, 10) };
    }
  }

  return config;
}
