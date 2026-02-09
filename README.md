# claude-norns-statusline

<p align="center">
  <img src="assets/hero.jpg" alt="Claude Norns Statusline — Norse-themed statusline for Claude Code" width="700">
</p>

A Norse-themed statusline plugin for [Claude Code](https://docs.anthropic.com/en/docs/claude-code). Displays model info, git status, context window usage, session costs, and OAuth usage tracking — all in a beautiful, configurable terminal statusline.

Zero runtime dependencies. Single bundled file. Under 70ms render time.

```
 󰊛 Opus 4.6  main  ██████░░░░ 62%  $1.23 · 45K tok  S:42% 3h12m · W:67%
```

## TL;DR

**Terminal:**

```bash
# 1. Install
npm install -g claude-norns-statusline@latest

# 2. Install slash commands
claude-norns-statusline --install-commands
```

**~/.claude/settings.json:**

```json
{
  "statusLine": {
    "type": "command",
    "command": "claude-norns-statusline"
  }
}
```

**Inside Claude Code** — customize on the fly:

```
/norns:theme bifrost                                → switch theme instantly
/norns:style capsule                                → pill-style separators
/norns:show metrics directory                       → enable extra segments
/norns:lines model,git,directory | context,session  → two-line layout
```

## Features

- **6 Norse themes** — Yggdrasil, Bifrost, Ragnarok, Valhalla, Mist, Jotunheim
- **3 rendering styles** — Powerline arrows, minimal pipes, capsule pills
- **12 segments** — model, git, context, session, usage, block, daily, metrics, version, tmux, directory, custom
- **Multi-line layout** — spread segments across 1-4 rows
- **Slash commands** — `/norns:theme bifrost` to change settings live, no restart needed
- **Smart truncation** — priority-based segment dropping when terminal is narrow
- **Nerd Font + text fallback** — works with or without patched fonts
- **5 progress bar styles** — block `█░`, classic `━─`, shade `▓░`, dot `●○`, pipe `┃┊`
- **Rainbow shimmer** — time-based HSV animation while Claude is active
- **OAuth usage tracking** — session and weekly API usage (auto-discovers credentials)
- **File-based caching** — configurable TTLs for git, OAuth, and transcript data
- **Truecolor support** — 24-bit hex colors with automatic fallback

## Installation

### npm (recommended)

```bash
npm install -g claude-norns-statusline@latest
```

### npx (no install)

Use directly in your Claude Code config — npx will fetch it on first run:

```bash
npx claude-norns-statusline@latest --theme=yggdrasil
```

### From source

```bash
git clone https://github.com/danjuls/claude-norns-statusline.git
cd claude-norns-statusline
npm install && npm run build
```

## Setup

Add to your Claude Code settings at `~/.claude/settings.json`:

```json
{
  "statusLine": {
    "type": "command",
    "command": "npx claude-norns-statusline@latest --theme=yggdrasil --style=powerline"
  }
}
```

Or if installed globally / from source:

```json
{
  "statusLine": {
    "type": "command",
    "command": "claude-norns-statusline --theme=bifrost --style=capsule"
  }
}
```

Restart Claude Code and the statusline should appear at the bottom of your terminal.

## Slash Commands

Control your statusline from inside Claude Code — no manual config editing, no restarts.

### Install slash commands

```bash
npx claude-norns-statusline@latest --install-commands
```

This copies command files to `~/.claude/commands/norns/`. They're available immediately.

### Available commands

| Command | Example | What it does |
|---------|---------|--------------|
| `/norns:theme` | `/norns:theme bifrost` | Switch theme |
| `/norns:style` | `/norns:style capsule` | Switch rendering style |
| `/norns:show` | `/norns:show metrics directory` | Enable one or more segments |
| `/norns:hide` | `/norns:hide git usage` | Disable one or more segments |
| `/norns:lines` | `/norns:lines 2` | Set number of statusline rows |
| `/norns:config` | `/norns:config` | Show current configuration |
| `/norns:reset` | `/norns:reset` | Reset everything to defaults |

All commands edit `~/.config/claude-norns-statusline/config.json`. Changes apply instantly on the next statusline refresh (~150ms while Claude is active).

### Example workflow

```
You:  /norns:theme ragnarok
      → "Switched theme to ragnarok"           (statusline updates immediately)

You:  /norns:show metrics directory
      → "Enabled: metrics, directory"           (new segments appear)

You:  /norns:lines 2
      → "Set to 2 lines"                        (segments split across 2 rows)

You:  /norns:style capsule
      → "Switched style to capsule"             (rounded pill separators)

You:  /norns:reset
      → "Reset to defaults"                     (back to yggdrasil/powerline/1 line)
```

## Multi-line Layout

Spread segments across multiple rows instead of cramming everything on one line.

### Quick — auto-split

```bash
# Via CLI flag
npx claude-norns-statusline@latest --lines=2

# Via slash command (inside Claude Code)
/norns:lines 2
```

Segments auto-distribute by priority: highest-priority segments on line 1, rest on line 2.

### Explicit — choose what goes where

In `~/.config/claude-norns-statusline/config.json`:

```json
{
  "lines": [
    ["model", "git", "context"],
    ["session", "usage", "metrics"]
  ]
}
```

Or via slash command:

```
/norns:lines model,git,context | session,usage,metrics
```

Any enabled segments not assigned to a line get appended to the last line.

## Themes

### Powerline style

<img src="screenshots/themes-powerline.png" alt="All 6 themes in powerline style" width="700">

### Minimal style

<img src="screenshots/themes-minimal.png" alt="All 6 themes in minimal style" width="700">

| Theme | Description | Aesthetic |
|-------|-------------|-----------|
| **yggdrasil** | World Tree (default) | Deep forest bark, moss green, ancient gold |
| **bifrost** | Rainbow Bridge | Aurora cyan, violet, shimmering rose |
| **ragnarok** | Fire & Twilight | Ember orange, blood red, molten gold |
| **valhalla** | Hall of the Chosen | Silver light, ice blue, warm gold |
| **mist** | Niflheim Fog | Deep slate, drifting lavender, pale cyan |
| **jotunheim** | Frozen Realm | Deep navy, glacier cyan, frost white |

Preview all themes in your terminal:

```bash
echo '{}' | npx claude-norns-statusline --show-themes
```

## Styles

| Style | Separators | Example |
|-------|------------|---------|
| **powerline** | Arrow glyphs `` | `segment1segment2` |
| **minimal** | Pipe separators `│` | `segment1 │ segment2` |
| **capsule** | Rounded pills `` | `segment1 segment2` |

Use `--charset=text` for ASCII fallback if your font doesn't support Nerd Font glyphs.

## Reading the Statusline

Here's what each part of the statusline shows:

```
 󰊛 Opus 4.6  HEAD ?9  ██████░░░░ 50%  $4.43 · 138K tok  S:29% · W:26% · Max 5x
 ─────────── ──────── ──────────────── ────────────────── ──────────────────────────
   model       git        context           session                usage
```

| Segment | Example | What it means |
|---------|---------|---------------|
| **model** | `Opus 4.6` | The active Claude model |
| **git** | `main +2 ~1 ?3` | Branch, staged/unstaged/untracked counts (see below) |
| **context** | `██████░░░░ 50%` | How much of Claude's context window (conversation memory) is used. When it hits 100%, older messages get compressed to make room |
| **session** | `$4.43 · 138K tok` | Total API cost and tokens consumed this session |
| **usage** | `S:29% · W:26%` | `S:` = 5-hour usage block consumed, `W:` = 7-day rolling usage. These are your rate limit quotas from Anthropic |

The context bar is the most useful at-a-glance indicator — it tells you how deep into a conversation you are before context compression kicks in.

### Git indicators

| Symbol | Meaning | Example |
|--------|---------|---------|
| `+N` | Staged files (ready to commit) | `+3` = 3 files staged |
| `~N` | Unstaged modifications | `~2` = 2 files modified but not staged |
| `?N` | Untracked files (new, unknown to git) | `?1` = 1 new file |
| `↑N` | Commits ahead of remote | `↑2` = 2 unpushed commits |
| `↓N` | Commits behind remote | `↓3` = 3 commits to pull |
| `⚑N` | Stash entries | `⚑1` = 1 stashed change |
| `●` | Dirty working tree (generic, when no specific counts) | — |

Multiple indicators combine: `main +2 ~1 ?3` means 2 staged, 1 modified, 3 untracked.

## Segments

Segments are the building blocks of the statusline. Each gathers its own data and renders independently.

| Segment | Default | Priority | Description |
|---------|---------|----------|-------------|
| **model** | on | 100 | Active Claude model name |
| **git** | on | 90 | Branch, dirty/staged/untracked counts, ahead/behind |
| **context** | on | 80 | Context window usage with progress bar |
| **session** | on | 70 | Session cost and token count |
| **usage** | on | 60 | OAuth API session/weekly usage percentages |
| **block** | off | 50 | 5-hour usage block tracking |
| **daily** | off | 45 | Daily aggregate cost/tokens |
| **metrics** | off | 40 | Message count and session duration |
| **version** | off | 30 | Claude Code version |
| **tmux** | off | 20 | Tmux session name |
| **directory** | off | 10 | CWD with fish-style path abbreviation |
| **custom** | off | 5 | Output from a user-defined shell command |

Higher priority segments are kept when the terminal is too narrow — lower priority ones are dropped first.

### Enabling/disabling segments

Via slash commands (recommended):

```
/norns:show metrics directory     Enable segments
/norns:hide git usage             Disable segments
```

Via CLI flags:

```bash
--no-git          # Disable
--no-usage        # Disable
--metrics=true    # Enable
--directory=true  # Enable
```

Via config file (`~/.config/claude-norns-statusline/config.json`):

```json
{
  "segments": {
    "git": { "enabled": false },
    "metrics": { "enabled": true },
    "custom": { "enabled": true, "options": { "command": "hostname -s" } }
  }
}
```

## Configuration

Settings are resolved in this order (highest priority first):

1. **CLI flags** — `--theme=ragnarok --style=capsule --no-git`
2. **Environment variables** — `NORNS_THEME`, `NORNS_STYLE`, `NORNS_CHARSET`, `NORNS_BAR_STYLE`, `NORNS_SHIMMER`, `NORNS_OAUTH`
3. **Project config** — `.claude-norns-statusline.json` in current directory
4. **User config** — `~/.config/claude-norns-statusline/config.json` (edited by slash commands)
5. **Defaults**

### Example config file

```json
{
  "theme": "bifrost",
  "style": "powerline",
  "charset": "nerd",
  "barStyle": "block",
  "barWidth": 10,
  "lines": 2,
  "oauth": true,
  "segments": {
    "model": { "enabled": true, "priority": 100 },
    "git": { "enabled": true, "priority": 90 },
    "context": { "enabled": true, "priority": 80 },
    "session": { "enabled": true, "priority": 70 },
    "usage": { "enabled": true, "priority": 60 },
    "metrics": { "enabled": true, "priority": 40 },
    "directory": { "enabled": true, "priority": 10 }
  }
}
```

### CLI reference

| Flag | Description | Default |
|------|-------------|---------|
| `--theme=NAME` | Theme name | `yggdrasil` |
| `--style=NAME` | `powerline`, `minimal`, or `capsule` | `powerline` |
| `--charset=NAME` | `nerd` or `text` | `nerd` |
| `--bar-style=NAME` | `block`, `classic`, `shade`, `dot`, or `pipe` | `block` |
| `--lines=N` | Number of statusline rows (1-4) | `1` |
| `--shimmer` | Rainbow animation while Claude is active | `false` |
| `--oauth=false` | Disable OAuth usage fetching | `true` |
| `--no-SEGMENT` | Disable a segment | — |
| `--SEGMENT=true` | Enable a segment | — |
| `--show-themes` | Preview all themes and exit | — |
| `--install-commands` | Install slash commands to `~/.claude/commands/norns/` | — |
| `--debug-stdin` | Dump stdin JSON to `~/.cache/claude-norns-statusline/` | — |

## Shimmer Effect

Enable a subtle glow animation with `--shimmer`:

```json
{
  "statusLine": {
    "type": "command",
    "command": "npx claude-norns-statusline@latest --theme=bifrost --shimmer"
  }
}
```

Two light bands sweep across the statusline at different speeds, brightening your theme colors as they pass — like a reflection on brushed metal. A gentle background pulse adds a slow "breathing" effect. All theme colors are preserved; the glow just lifts brightness toward white as it passes.

The effect works automatically — Claude Code refreshes the statusline ~every 150ms while active, and each refresh produces the next animation frame. When Claude goes idle, the animation naturally pauses. No background processes needed.

## OAuth Usage Tracking

The usage segment shows your 5-hour session and 7-day rolling API usage percentages. It auto-discovers your OAuth token from three sources (tried in order):

1. **`~/.claude/.credentials.json`** — flat file credentials
2. **macOS Keychain** — `Claude Code-credentials` entry (most common on macOS)
3. **`CLAUDE_CODE_OAUTH_TOKEN` env var** — manual override

If you're logged into Claude Code normally, it should work automatically. Disable with `--oauth=false` if you don't need it or are using an API key.

## Testing Locally

Test the statusline outside of Claude Code by piping JSON to stdin:

```bash
# Basic — just model info
echo '{"model":{"id":"claude-opus-4-6","display_name":"Opus 4.6"}}' | npx claude-norns-statusline --oauth=false

# Full data — model, cost, context window
echo '{"model":{"id":"claude-opus-4-6","display_name":"Opus 4.6"},"cost":{"total_cost_usd":1.23},"context_window":{"used_percentage":62,"total_input_tokens":35000,"total_output_tokens":8000}}' | npx claude-norns-statusline --oauth=false

# Try different themes
echo '{}' | npx claude-norns-statusline --theme=ragnarok --oauth=false
echo '{}' | npx claude-norns-statusline --theme=bifrost --style=capsule --oauth=false

# Multi-line
echo '{"model":{"id":"claude-opus-4-6","display_name":"Opus 4.6"},"cost":{"total_cost_usd":0.42},"context_window":{"used_percentage":22,"total_input_tokens":35000,"total_output_tokens":8000}}' | npx claude-norns-statusline --lines=2 --oauth=false

# ASCII fallback (no Nerd Font needed)
echo '{"model":{"id":"claude-opus-4-6","display_name":"Opus 4.6"}}' | npx claude-norns-statusline --charset=text --oauth=false

# Preview all themes
echo '{}' | npx claude-norns-statusline --show-themes

# Debug — dump what Claude Code sends
echo '{"model":{"id":"claude-opus-4-6"}}' | npx claude-norns-statusline --debug-stdin --oauth=false
cat ~/.cache/claude-norns-statusline/debug-stdin.json
```

If developing from source, replace `npx claude-norns-statusline` with `node dist/index.js`.

## Debugging

If segments aren't showing, add `--debug-stdin` to your command to inspect what Claude Code sends:

```bash
# Add to your statusLine command temporarily
claude-norns-statusline --debug-stdin

# Then check the dump
cat ~/.cache/claude-norns-statusline/debug-stdin.json
```

## Requirements

- **Node.js** >= 18
- **Claude Code** with statusline support
- **Nerd Font** (optional, use `--charset=text` for ASCII fallback)
- **Truecolor terminal** recommended (iTerm2, Ghostty, Kitty, Alacritty, WezTerm)

## License

MIT
