# claude-norns-statusline

Norse-themed statusline plugin for Claude Code. TypeScript, zero runtime dependencies, single bundled output via tsup.

## Quick Reference

```bash
npm run build          # Build to dist/index.js (single 20KB file)
npm run dev            # Watch mode

# Test manually
# Real Claude Code format
echo '{"model":{"id":"claude-opus-4-6","display_name":"Opus"},"cost":{"total_cost_usd":0.42},"context_window":{"used_percentage":22,"total_input_tokens":35000,"total_output_tokens":8000}}' | node dist/index.js --oauth=false

# Legacy format (still works)
echo '{"model":{"id":"claude-opus-4-6","display_name":"Opus 4.6"},"token_usage":{"total_tokens":45000,"total_cost":1.23,"percentage_remaining":38},"session":{"cost":1.23,"message_count":12}}' | node dist/index.js --oauth=false

# Preview all themes
echo '{}' | node dist/index.js --show-themes

# Test specific options
echo '{"model":{"id":"claude-opus-4-6"}}' | node dist/index.js --theme=bifrost --style=capsule --charset=text --no-git --oauth=false
```

## Architecture

```
src/
├── index.ts              # Entry: sync stdin read, CLI args, orchestration
├── renderer.ts           # Segments → styled output, priority-based truncation
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
