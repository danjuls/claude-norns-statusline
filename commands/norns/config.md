Show the current claude-norns-statusline configuration.

Instructions:
1. Read the config file at `~/.config/claude-norns-statusline/config.json`
2. If the file exists, display its contents in a formatted way
3. If the file doesn't exist, say "No custom config found. Using defaults."
4. Show the defaults for reference:
   - Theme: yggdrasil
   - Style: powerline
   - Charset: nerd
   - Bar style: block
   - Lines: 1 (single line)
   - Enabled segments: model, git, context, session, usage
   - Disabled segments: block, daily, metrics, version, tmux, directory, custom
5. Also check if there's a project-level config at `./.claude-norns-statusline.json` and mention it if found
6. Mention the config file path so the user knows where to find it
