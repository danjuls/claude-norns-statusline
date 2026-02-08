#!/usr/bin/env node
/**
 * Generate showcase HTML files from statusline ANSI output for screenshotting.
 * Produces 2 images: all themes in powerline style, all themes in minimal style.
 */
import { execSync } from 'child_process';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const THEMES = ['yggdrasil', 'bifrost', 'ragnarok', 'valhalla', 'mist', 'jotunheim'];
const STYLES = ['powerline', 'minimal'];

const DIST = join(import.meta.dirname, '..', 'dist', 'index.js');
const OUT_DIR = join(import.meta.dirname, '..', 'screenshots');
const CACHE_DIR = join(
  process.env.XDG_CACHE_HOME || join(homedir(), '.cache'),
  'claude-norns-statusline'
);
const CACHE_FILE = join(CACHE_DIR, 'oauth-usage.json');

// Fake OAuth data written fresh before each command
const FAKE_OAUTH = {
  data: {
    sessionUsagePercent: 62,
    weeklyUsagePercent: 38,
    resetSeconds: 8420,
    planTier: 'Max 5x',
  },
  ttl: 9999,
};

function writeFakeCache() {
  mkdirSync(CACHE_DIR, { recursive: true });
  writeFileSync(CACHE_FILE, JSON.stringify({ ...FAKE_OAUTH, timestamp: Date.now() }));
}

// Sample stdin with realistic data
const STDIN_DATA = JSON.stringify({
  model: { id: 'claude-opus-4-6', display_name: 'Opus 4.6' },
  cost: { total_cost_usd: 1.847, total_duration_ms: 342000 },
  context_window: {
    used_percentage: 34,
    remaining_percentage: 66,
    total_input_tokens: 42000,
    total_output_tokens: 12500,
  },
  session: { message_count: 24 },
});

function ansiToHtml(ansiStr) {
  const parts = ansiStr.split(/(\x1b\[[0-9;]*m)/);
  let html = '';
  let fg = null;
  let bg = null;
  let bold = false;
  let spanOpen = false;

  for (const part of parts) {
    const seqMatch = part.match(/^\x1b\[([0-9;]*)m$/);
    if (seqMatch) {
      if (spanOpen) { html += '</span>'; spanOpen = false; }

      const params = seqMatch[1] ? seqMatch[1].split(';').map(Number) : [0];
      let k = 0;
      while (k < params.length) {
        const p = params[k];
        if (p === 0) { fg = null; bg = null; bold = false; }
        else if (p === 1) { bold = true; }
        else if (p === 22) { bold = false; }
        else if (p === 38 && params[k + 1] === 2) {
          fg = `${params[k + 2]}, ${params[k + 3]}, ${params[k + 4]}`;
          k += 4;
        } else if (p === 48 && params[k + 1] === 2) {
          bg = `${params[k + 2]}, ${params[k + 3]}, ${params[k + 4]}`;
          k += 4;
        } else if (p === 39) { fg = null; }
        else if (p === 49) { bg = null; }
        k++;
      }

      const styles = [];
      if (fg) styles.push(`color: rgb(${fg})`);
      if (bg) styles.push(`background-color: rgb(${bg})`);
      if (bold) styles.push('font-weight: bold');
      if (styles.length) { html += `<span style="${styles.join('; ')}">`; spanOpen = true; }
    } else {
      html += part.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
  }

  if (spanOpen) html += '</span>';
  return html;
}

function runStatusline(theme, style) {
  writeFakeCache();
  const cmd = `echo '${STDIN_DATA}' | node ${DIST} --theme=${theme} --style=${style} --no-shimmer`;
  return execSync(cmd, { encoding: 'utf-8', env: { ...process.env, COLUMNS: '160' } }).trim();
}

function generateShowcase(style, rows) {
  const styleName = style.charAt(0).toUpperCase() + style.slice(1);
  const rowsHtml = rows.map(({ theme, html }) => `
    <div class="row">
      <div class="theme-name">${theme}</div>
      <div class="statusline">${html}</div>
    </div>`).join('');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @font-face {
    font-family: 'JetBrainsMono NF';
    src: url('/JetBrainsMonoNerdFont-Regular.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
  }
  @font-face {
    font-family: 'JetBrainsMono NF';
    src: url('/JetBrainsMonoNerdFont-Bold.ttf') format('truetype');
    font-weight: bold;
    font-style: normal;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: #1a1b26;
    padding: 32px 40px;
    font-family: 'JetBrainsMono NF', 'SF Mono', monospace;
  }
  .header {
    display: flex;
    align-items: baseline;
    gap: 12px;
    margin-bottom: 24px;
  }
  h1 {
    color: #c0caf5;
    font-size: 16px;
    font-weight: 600;
    letter-spacing: -0.3px;
  }
  .badge {
    color: #7aa2f7;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 1px;
    background: #1e2030;
    padding: 3px 8px;
    border-radius: 4px;
  }
  .row {
    display: flex;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid #1e2030;
  }
  .row:last-child { border-bottom: none; }
  .theme-name {
    color: #bb9af7;
    font-size: 11px;
    width: 90px;
    flex-shrink: 0;
    text-transform: capitalize;
    letter-spacing: 0.3px;
  }
  .statusline {
    font-size: 13px;
    line-height: 1.5;
    white-space: pre;
  }
</style>
</head>
<body>
  <div class="header">
    <h1>claude-norns-statusline</h1>
    <span class="badge">${styleName} style</span>
  </div>
  ${rowsHtml}
</body>
</html>`;
}

mkdirSync(OUT_DIR, { recursive: true });

for (const style of STYLES) {
  const rows = [];
  for (const theme of THEMES) {
    try {
      const output = runStatusline(theme, style);
      rows.push({ theme, html: ansiToHtml(output) });
      console.log(`  ${theme}/${style} ✓`);
    } catch (e) {
      console.error(`  ${theme}/${style} FAILED: ${e.message}`);
    }
  }
  const html = generateShowcase(style, rows);
  writeFileSync(join(OUT_DIR, `themes-${style}.html`), html);
  console.log(`Generated: themes-${style}.html`);
}

console.log(`\nFiles in: ${OUT_DIR}`);
