// ── Renderer ──
// Core pipeline: segments → styled output

import type { Config, HookData, RenderedSegment, Segment, ThemeColors } from './types.js';
import { getTheme, getAllThemes } from './themes/index.js';
import { getStyle } from './styles/index.js';
import { powerline as powerlineStyle } from './styles/powerline.js';
import { createSegmentMap } from './segments/index.js';
import { visibleLength, truncate, fg, bg, fgBg, reset } from './utils/ansi.js';
import { getTerminalWidth } from './utils/terminal.js';
import { buildBar } from './utils/bar.js';
import { applyShimmer } from './utils/shimmer.js';

export async function render(hookData: HookData, config: Config): Promise<string> {
  const theme = getTheme(config);
  const style = getStyle(config.style);
  const segmentMap = createSegmentMap();

  // Only gather enabled segments
  const enabledNames = (Object.keys(config.segments) as Array<keyof Config['segments']>)
    .filter(name => config.segments[name].enabled);

  // Gather all segment data in parallel
  const results = await Promise.all(
    enabledNames.map(async name => {
      const segment = segmentMap[name];
      if (!segment) return null;
      try {
        return await segment.gather(hookData, config);
      } catch {
        return null;
      }
    })
  );

  // Filter nulls and map to rendered segments with theme colors
  const rendered: RenderedSegment[] = results
    .filter((r): r is NonNullable<typeof r> => r !== null)
    .map(r => {
      const segColors = theme.colors.segments[r.name as keyof ThemeColors['segments']]
        || { bg: theme.colors.bg, fg: theme.colors.fg };
      return {
        name: r.name,
        content: r.content,
        bg: segColors.bg,
        fg: segColors.fg,
        priority: config.segments[r.name as keyof Config['segments']]?.priority ?? r.priority,
      };
    })
    // Sort by priority (highest first)
    .sort((a, b) => b.priority - a.priority);

  if (rendered.length === 0) return '';

  // Render with style
  let output = style.render(rendered, config.charset);

  // Truncate to terminal width with priority-based segment dropping
  const termWidth = getTerminalWidth();
  if (visibleLength(output) > termWidth) {
    // Try removing lowest-priority segments until it fits
    const sorted = [...rendered].sort((a, b) => a.priority - b.priority);
    let trimmed = [...rendered];

    while (visibleLength(style.render(trimmed, config.charset)) > termWidth && sorted.length > 1) {
      const lowest = sorted.shift();
      if (lowest) {
        trimmed = trimmed.filter(s => s.name !== lowest.name);
      }
    }

    output = style.render(trimmed, config.charset);

    // Final truncation if still too wide
    if (visibleLength(output) > termWidth) {
      output = truncate(output, termWidth);
    }
  }

  // Apply shimmer effect if enabled
  if (config.shimmer) {
    output = applyShimmer(output);
  }

  return output;
}

// Preview all themes with sample data
export function renderThemePreview(): string {
  const themes = getAllThemes();
  const sampleSegments: RenderedSegment[] = [
    { name: 'model', content: '\uDB80\uDE9B Opus 4.6', bg: '', fg: '', priority: 100 },
    { name: 'git', content: '\uE0A0 main', bg: '', fg: '', priority: 90 },
    { name: 'context', content: '\uF0D0 \u2588\u2588\u2588\u2588\u2588\u2588\u2591\u2591\u2591\u2591 62%', bg: '', fg: '', priority: 80 },
    { name: 'session', content: '\uDB80\uDCC7 $1.23 \u00B7 45K tok', bg: '', fg: '', priority: 70 },
    { name: 'usage', content: '\uDB80\uDF26 S:42% 3h12m \u00B7 W:67%', bg: '', fg: '', priority: 60 },
  ];

  const lines: string[] = [
    '',
    `${fg('#d4a847')}  \u2584\u2584\u2584   claude-norns-statusline   \u2584\u2584\u2584${reset()}`,
    `${fg('#7c9a5e')}  \u2588\u2588\u2588   Theme Preview             \u2588\u2588\u2588${reset()}`,
    '',
  ];

  for (const theme of themes) {
    // Apply theme colors to sample segments
    const themed = sampleSegments.map(s => ({
      ...s,
      bg: theme.colors.segments[s.name as keyof ThemeColors['segments']]?.bg || theme.colors.bg,
      fg: theme.colors.segments[s.name as keyof ThemeColors['segments']]?.fg || theme.colors.fg,
    }));

    const rendered = powerlineStyle.render(themed, 'nerd' as const);

    lines.push(`  ${fg(theme.colors.accent)}${theme.name}${reset()} ${fg(theme.colors.dim)}\u2014 ${theme.description}${reset()}`);
    lines.push(`  ${rendered}`);
    lines.push('');
  }

  return lines.join('\n');
}
