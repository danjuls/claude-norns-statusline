Enable the following claude-norns-statusline segments: $ARGUMENTS

Available segments: model, git, context, session, usage, block, daily, metrics, version, tmux, directory, custom

Instructions:
1. Read the config file at `~/.config/claude-norns-statusline/config.json` (if it exists)
2. If the file or directory doesn't exist, create it with the appropriate segments enabled
3. For each segment name provided, set `segments.<name>.enabled` to `true`
4. Preserve all other settings (theme, style, other segments, etc.)
5. Write the updated JSON back (pretty-printed with 2-space indent)
6. Confirm which segments were enabled

Example: if the user says "metrics directory", the config should include:
```json
{
  "segments": {
    "metrics": { "enabled": true },
    "directory": { "enabled": true }
  }
}
```

The change takes effect immediately on the next statusline refresh (no restart needed).

If a segment name is not recognized, mention it and show the available options.
