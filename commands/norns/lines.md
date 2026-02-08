Set the number of statusline lines for claude-norns-statusline: $ARGUMENTS

Instructions:
1. Read the config file at `~/.config/claude-norns-statusline/config.json` (if it exists)
2. If the file or directory doesn't exist, create it
3. Parse the argument:
   - If it's a number (1, 2, or 3): set `"lines"` to that number. Segments auto-distribute across lines by priority.
   - If it's an explicit layout like `model,git,context | session,usage`: set `"lines"` to an array of arrays, e.g. `[["model","git","context"],["session","usage"]]`
4. Preserve all other settings
5. Write the updated JSON back (pretty-printed with 2-space indent)
6. Confirm the change

Examples:
- `/norns:lines 2` → auto-splits enabled segments across 2 lines
- `/norns:lines 1` → single line (default)
- `/norns:lines model,git,context | session,usage` → explicit two-line layout

The change takes effect immediately on the next statusline refresh (no restart needed).
