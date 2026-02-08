// ── Hook Data from Claude Code stdin ──

export interface HookData {
  // Core fields (always present)
  cwd?: string;
  session_id?: string;
  transcript_path?: string;
  version?: string;

  model?: {
    id: string;
    display_name?: string;
    provider?: string;
  };

  workspace?: {
    current_dir?: string;
    project_dir?: string;
  };

  // Cost data (populated after first API call)
  cost?: {
    total_cost_usd?: number;
    total_duration_ms?: number;
    total_api_duration_ms?: number;
    total_lines_added?: number;
    total_lines_removed?: number;
  };

  // Context window (populated after first API call)
  context_window?: {
    total_input_tokens?: number;
    total_output_tokens?: number;
    context_window_size?: number;
    used_percentage?: number;
    remaining_percentage?: number;
    current_usage?: {
      input_tokens?: number;
      output_tokens?: number;
      cache_creation_input_tokens?: number;
      cache_read_input_tokens?: number;
    };
  };

  exceeds_200k_tokens?: boolean;

  // Optional fields
  vim?: { mode?: string };
  agent?: { name?: string };
  output_style?: { name?: string };

  // Legacy fields (backward compat with manual testing)
  hook_type?: string;
  token_usage?: {
    input_tokens?: number;
    output_tokens?: number;
    cache_read_input_tokens?: number;
    cache_creation_input_tokens?: number;
    total_tokens?: number;
    total_cost?: number;
    percentage_remaining?: number;
  };
  session?: {
    cost?: number;
    duration_ms?: number;
    message_count?: number;
    num_turns?: number;
  };
  context?: {
    used?: number;
    total?: number;
    percentage?: number;
  };
}

// ── Theme ──

export interface ThemeColors {
  bg: string;
  fg: string;
  accent: string;
  accent2: string;
  dim: string;
  warning: string;
  critical: string;
  success: string;
  separator: string;
  segments: {
    model: { bg: string; fg: string };
    git: { bg: string; fg: string };
    context: { bg: string; fg: string };
    session: { bg: string; fg: string };
    usage: { bg: string; fg: string };
    block: { bg: string; fg: string };
    daily: { bg: string; fg: string };
    metrics: { bg: string; fg: string };
    version: { bg: string; fg: string };
    tmux: { bg: string; fg: string };
    directory: { bg: string; fg: string };
    custom: { bg: string; fg: string };
  };
}

export interface Theme {
  name: string;
  description: string;
  colors: ThemeColors;
}

// ── Style ──

export type StyleName = 'minimal' | 'powerline' | 'capsule';
export type CharsetName = 'nerd' | 'text';

export interface RenderedSegment {
  name: string;
  content: string;
  bg: string;
  fg: string;
  priority: number;
}

export interface Style {
  name: StyleName;
  render(segments: RenderedSegment[], charset: CharsetName): string;
}

// ── Segment ──

export interface SegmentConfig {
  enabled: boolean;
  priority?: number;
  options?: Record<string, unknown>;
}

export interface SegmentResult {
  name: string;
  content: string;
  priority: number;
}

export interface Segment {
  name: string;
  defaultPriority: number;
  gather(hookData: HookData, config: Config): Promise<SegmentResult | null>;
}

// ── Config ──

export type BarStyle = 'block' | 'classic' | 'shade' | 'dot' | 'pipe';

export interface Config {
  theme: string;
  style: StyleName;
  charset: CharsetName;
  barStyle: BarStyle;
  barWidth: number;
  segments: {
    model: SegmentConfig;
    git: SegmentConfig;
    context: SegmentConfig;
    session: SegmentConfig;
    usage: SegmentConfig;
    block: SegmentConfig;
    daily: SegmentConfig;
    metrics: SegmentConfig;
    version: SegmentConfig;
    tmux: SegmentConfig;
    directory: SegmentConfig;
    custom: SegmentConfig & { options?: { command?: string } };
  };
  lines?: number | string[][];
  customTheme?: Partial<ThemeColors>;
  shimmer: boolean;
  oauth: boolean;
  cacheTtl: {
    git: number;
    oauth: number;
    transcript: number;
  };
  budget?: {
    daily?: number;
    weekly?: number;
    monthly?: number;
    warnAt?: number;
  };
}

// ── OAuth Usage ──

export interface OAuthUsage {
  sessionUsagePercent: number;
  weeklyUsagePercent: number;
  resetSeconds: number;
  planTier: string;
  bonusCredits?: number;
  cached?: boolean;
  error?: string;
}

// ── Cache ──

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// ── Git ──

export interface GitInfo {
  branch: string;
  dirty: boolean;
  staged: number;
  unstaged: number;
  untracked: number;
  ahead: number;
  behind: number;
  stashCount: number;
  isRepo: boolean;
}
