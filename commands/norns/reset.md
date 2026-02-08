Reset claude-norns-statusline to default configuration.

Instructions:
1. Check if `~/.config/claude-norns-statusline/config.json` exists
2. If it exists, delete it (or replace with `{}`)
3. If it doesn't exist, say "Already using defaults -- no custom config found."
4. Confirm the reset and list the default settings:
   - Theme: yggdrasil
   - Style: powerline
   - Charset: nerd
   - Bar style: block
   - Lines: 1 (single line)
   - Enabled segments: model, git, context, session, usage
   - Disabled segments: block, daily, metrics, version, tmux, directory, custom

The change takes effect immediately on the next statusline refresh (no restart needed).
