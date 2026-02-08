// ── Formatting Utilities ──

export function formatCost(cost: number): string {
  if (cost < 0.01) return '$0.00';
  if (cost < 1) return `$${cost.toFixed(2)}`;
  if (cost < 10) return `$${cost.toFixed(2)}`;
  return `$${cost.toFixed(1)}`;
}

export function formatTokens(tokens: number): string {
  if (tokens < 1000) return `${tokens}`;
  if (tokens < 100_000) return `${(tokens / 1000).toFixed(1)}K`;
  if (tokens < 1_000_000) return `${Math.round(tokens / 1000)}K`;
  return `${(tokens / 1_000_000).toFixed(1)}M`;
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return remainMins > 0 ? `${hrs}h${remainMins.toString().padStart(2, '0')}m` : `${hrs}h`;
}

export function formatPercent(pct: number): string {
  return `${Math.round(pct)}%`;
}

export function formatModelName(id: string, displayName?: string): string {
  if (displayName) return displayName;

  // Parse model ID to friendly name
  const lower = id.toLowerCase();
  if (lower.includes('opus')) {
    const ver = lower.match(/(\d[\d.]*)/);
    return `Opus ${ver?.[1] || ''}`.trim();
  }
  if (lower.includes('sonnet')) {
    const ver = lower.match(/(\d[\d.]*)/);
    return `Sonnet ${ver?.[1] || ''}`.trim();
  }
  if (lower.includes('haiku')) {
    const ver = lower.match(/(\d[\d.]*)/);
    return `Haiku ${ver?.[1] || ''}`.trim();
  }
  return displayName || id;
}
