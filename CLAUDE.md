# claude-norns-statusline

Norse-themed statusline plugin for Claude Code. TypeScript, zero runtime dependencies, single bundled output via tsup.

## Quick Reference

```bash
npm run build          # Build to dist/index.js (single ~25KB file)
npm run dev            # Watch mode

# Test manually
echo '{"model":{"id":"claude-opus-4-6","display_name":"Opus"},"cost":{"total_cost_usd":0.42},"context_window":{"used_percentage":22,"total_input_tokens":35000,"total_output_tokens":8000}}' | node dist/index.js --oauth=false

# Multi-line
echo '{"model":{"id":"claude-opus-4-6","display_name":"Opus 4.6"},"cost":{"total_cost_usd":1.23},"context_window":{"used_percentage":62,"total_input_tokens":35000,"total_output_tokens":8000}}' | node dist/index.js --lines=2 --oauth=false

# Preview all themes
echo '{}' | node dist/index.js --show-themes

# Test specific options
echo '{"model":{"id":"claude-opus-4-6"}}' | node dist/index.js --theme=bifrost --style=capsule --charset=text --no-git --oauth=false

# Install slash commands
node dist/index.js --install-commands
```

## Architecture

```
commands/norns/           # Slash command prompts (installed to ~/.claude/commands/norns/)
├── theme.md              # /norns:theme — switch theme
├── style.md              # /norns:style — switch style
├── show.md               # /norns:show — enable segments
├── hide.md               # /norns:hide — disable segments
├── lines.md              # /norns:lines — set line count
├── config.md             # /norns:config — show config
└── reset.md              # /norns:reset — reset to defaults
src/
├── index.ts              # Entry: sync stdin read, CLI args, --install-commands
├── renderer.ts           # Segments → styled output, multi-line split, priority truncation
├── types.ts              # All shared interfaces
├── config/
│   ├── defaults.ts       # Default config values
│   └── loader.ts         # CLI > env > project > user > XDG hierarchy
├── segments/             # Each extends BaseSegment
│   ├── base.ts           # Abstract class with gather() pattern
│   ├── model.ts          # Active Claude model name
│   ├── git.ts            # Branch, dirty status, ahead/behind
│   ├── context.ts        # Context window % with progress bar
│   ├── session.ts        # Cost + token counts
│   ├── usage.ts          # OAuth API session/weekly usage
│   ├── block.ts          # 5-hour block tracking
│   ├── daily.ts          # Daily aggregate
│   ├── metrics.ts        # Message count, duration
│   ├── version.ts        # Claude Code version
│   ├── tmux.ts           # Tmux session name
│   ├── directory.ts      # CWD with fish-style abbreviation
│   └── custom.ts         # User shell command
├── themes/               # 6 Norse themes
│   ├── yggdrasil.ts      # Default: deep forest
│   ├── bifrost.ts        # Aurora borealis
│   ├── ragnarok.ts       # Fire and twilight
│   ├── valhalla.ts       # Noble light
│   ├── mist.ts           # Niflheim fog
│   └── jotunheim.ts      # Frozen realm
├── styles/               # 3 rendering styles
│   ├── minimal.ts        # Pipe separators
│   ├── powerline.ts      # Arrow glyphs (default)
│   └── capsule.ts        # Rounded pills
└── utils/
    ├── ansi.ts           # Hex→truecolor, strip, truncate
    ├── terminal.ts       # Width + color depth detection
    ├── cache.ts          # File-based cache with TTL
    ├── oauth.ts          # OAuth token discovery (file + Keychain + env) + usage API
    ├── shimmer.ts        # Rainbow HSV animation effect
    ├── git-ops.ts        # Parallel git commands, 2s timeouts
    ├── format.ts         # Number/duration/cost formatters
    ├── bar.ts            # 5 progress bar styles
    ├── path.ts           # Fish-style path abbreviation
    └── transcript.ts     # JSONL transcript parser
```

## Slash Commands

Files in `commands/norns/` — installed to `~/.claude/commands/norns/` via `--install-commands`.
Claude Code surfaces them as `/norns:theme`, `/norns:style`, `/norns:show`, `/norns:hide`, `/norns:lines`, `/norns:config`, `/norns:reset`.
Each is a markdown prompt that tells Claude to edit `~/.config/claude-norns-statusline/config.json`.
Changes apply instantly — config is read from disk on every render.

## Multi-line

`config.lines` can be:
- `undefined` or `1` — single line (default)
- `2`, `3`, `4` — auto-split segments across N lines by priority
- `[["model","git"],["session","usage"]]` — explicit layout (array of segment name arrays)

Unassigned segments get appended to the last line. Each line truncates independently.

## Key Patterns

- **Sync stdin**: Uses `readFileSync(0, 'utf-8')` — never async stdin (causes 1-3s delays)
- **ESM only**: Never use `require()` — tsup bundles to ESM, require fails silently
- **Segments**: Each is a class extending `BaseSegment`, returns `SegmentResult | null` from `gather()`
- **Themes**: Object with `colors.segments[name].{bg, fg}` per segment
- **Parallel I/O**: Git + OAuth + transcripts gathered via `Promise.all`
- **Priority truncation**: When output exceeds terminal width, lowest-priority segments are dropped first
- **Shimmer**: Time-based HSV cycling — each refresh is a new frame, no background processes
- **OAuth discovery**: Credentials file → macOS Keychain → env var (in that order)
- **Stdin format**: Uses real Claude Code fields (`cost.total_cost_usd`, `context_window.*`) with legacy fallback

## Claude Code Stdin Fields

Real fields: `model.{id,display_name}`, `cost.{total_cost_usd,total_duration_ms}`, `context_window.{used_percentage,remaining_percentage,total_input_tokens,total_output_tokens}`, `version`, `workspace.{current_dir,project_dir}`, `cwd`

Debug with `--debug-stdin` to dump stdin to `~/.cache/claude-norns-statusline/debug-stdin.json`

## Integration

```json
// ~/.claude/settings.json
{
  "statusLine": {
    "type": "command",
    "command": "npx claude-norns-statusline@latest --theme=yggdrasil --style=powerline"
  }
}
```

## Default Enabled Segments

model (100) → git (90) → context (80) → session (70) → usage (60)

Disabled by default: block, daily, metrics, version, tmux, directory, custom
