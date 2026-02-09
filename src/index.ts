// ── claude-norns-statusline ──
// Norse-themed statusline for Claude Code

declare const PKG_VERSION: string;

import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync, copyFileSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { homedir } from 'os';
import { loadConfig } from './config/loader.js';
import { render, renderThemePreview } from './renderer.js';
import type { HookData } from './types.js';

function readStdin(): string {
  // If stdin is a TTY (no pipe), return empty
  if (process.stdin.isTTY) return '{}';

  try {
    return readFileSync(0, 'utf-8') || '{}';
  } catch {
    return '{}';
  }
}

function parseHookData(raw: string): HookData {
  try {
    // Handle multiple JSON objects (take the last complete one)
    const trimmed = raw.trim();
    if (!trimmed) return {};

    // Try parsing as single JSON first
    try {
      return JSON.parse(trimmed);
    } catch {
      // Try finding the last complete JSON object
      const lines = trimmed.split('\n');
      for (let i = lines.length - 1; i >= 0; i--) {
        try {
          return JSON.parse(lines[i]);
        } catch {
          continue;
        }
      }
    }

    return {};
  } catch {
    return {};
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const config = loadConfig(args);

  // Handle special commands
  if (args.includes('--show-themes')) {
    process.stdout.write(renderThemePreview() + '\n');
    process.exit(0);
  }

  if (args.includes('--help')) {
    printHelp();
    process.exit(0);
  }

  if (args.includes('--version')) {
    process.stdout.write(`claude-norns-statusline v${PKG_VERSION}\n`);
    process.exit(0);
  }

  if (args.includes('--install-commands')) {
    installCommands();
    process.exit(0);
  }

  // Read and parse stdin from Claude Code
  const raw = readStdin();
  const hookData = parseHookData(raw);

  // Debug: dump stdin + config + terminal info to file
  if (args.includes('--debug-stdin') || args.includes('--debug')) {
    try {
      const debugDir = join(homedir(), '.cache', 'claude-norns-statusline');
      mkdirSync(debugDir, { recursive: true });
      const debugFile = join(debugDir, 'debug-stdin.json');
      const debugData = {
        stdin: hookData,
        config_segments: config.segments,
        terminal: {
          stdout_columns: process.stdout.columns,
          env_COLUMNS: process.env.COLUMNS,
          cwd: process.cwd(),
        },
        args,
      };
      writeFileSync(debugFile, JSON.stringify(debugData, null, 2) + '\n', { mode: 0o600 });
    } catch { /* never break the statusline */ }
  }

  // Render the statusline
  const output = await render(hookData, config);
  process.stdout.write(output);
}

function installCommands(): void {
  const pkgRoot = dirname(dirname(fileURLToPath(import.meta.url)));
  const commandsDir = join(pkgRoot, 'commands', 'norns');

  if (!existsSync(commandsDir)) {
    process.stderr.write('Error: commands/norns/ directory not found in package.\n');
    process.exit(1);
  }

  const targetDir = join(homedir(), '.claude', 'commands', 'norns');
  mkdirSync(targetDir, { recursive: true });

  const files = readdirSync(commandsDir).filter(f => f.endsWith('.md'));
  let installed = 0;

  for (const file of files) {
    copyFileSync(join(commandsDir, file), join(targetDir, file));
    installed++;
  }

  // Clean up old flat-style commands if present
  const oldDir = join(homedir(), '.claude', 'commands');
  for (const old of ['norns-theme', 'norns-style', 'norns-show', 'norns-hide', 'norns-config', 'norns-reset']) {
    const oldFile = join(oldDir, `${old}.md`);
    if (existsSync(oldFile)) {
      try { unlinkSync(oldFile); } catch {}
    }
  }

  process.stdout.write(`Installed ${installed} slash commands to ${targetDir}/\n`);
  process.stdout.write('\nAvailable commands:\n');
  for (const file of files) {
    const name = file.replace('.md', '');
    process.stdout.write(`  /norns:${name}\n`);
  }
  process.stdout.write('\nChanges take effect immediately (no restart needed).\n');
}

function printHelp(): void {
  const lines = [
    '',
    '  claude-norns-statusline \u2014 Norse-themed statusline for Claude Code',
    '',
    '  Usage: echo \'{"model":...}\' | claude-norns-statusline [options]',
    '',
    '  Options:',
    '    --theme=NAME       Theme: yggdrasil, bifrost, ragnarok, valhalla, mist, jotunheim',
    '    --style=NAME       Style: powerline, minimal, capsule',
    '    --charset=NAME     Charset: nerd (default), text (ASCII fallback)',
    '    --bar-style=NAME   Bar: block, classic, shade, dot, pipe',
    '    --lines=N          Number of statusline rows (1-4, default 1)',
    '    --no-MODEL         Disable segment (e.g. --no-git, --no-usage)',
    '    --shimmer          Rainbow animation while Claude is active',
    '    --oauth=false      Disable OAuth usage tracking',
    '    --show-themes      Preview all themes',
    '    --install-commands Install slash commands to ~/.claude/commands/',
    '    --debug-stdin      Dump stdin JSON to ~/.cache/claude-norns-statusline/debug-stdin.json',
    '    --help             Show this help',
    '    --version          Show version',
    '',
    '  Config files (highest priority first):',
    '    ./.claude-norns-statusline.json',
    '    ~/.claude/claude-norns-statusline.json',
    '    ~/.config/claude-norns-statusline/config.json',
    '',
    '  Integration (add to ~/.claude/settings.json):',
    '    {',
    '      "statusLine": {',
    '        "type": "command",',
    '        "command": "npx claude-norns-statusline@latest"',
    '      }',
    '    }',
    '',
  ];
  process.stdout.write(lines.join('\n') + '\n');
}

main().catch(err => {
  // Silently fail — statusline should never break Claude Code
  process.stderr.write(`norns-statusline error: ${err?.message || err}\n`);
  process.exit(0);
});
