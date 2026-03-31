import { describe, it, expect, vi } from 'vitest';
import { render } from '../src/renderer.js';
import { DEFAULT_CONFIG } from '../src/config/defaults.js';
import { visibleLength, stripAnsi } from '../src/utils/ansi.js';
import type { HookData, Config } from '../src/types.js';

// Stub terminal width to something reasonable
vi.mock('../src/utils/terminal.js', () => ({
  getTerminalWidth: () => 120,
  getColorDepth: () => 24,
}));

// Disable git and oauth for renderer tests to avoid I/O
function testConfig(overrides: Partial<Config> = {}): Config {
  return {
    ...DEFAULT_CONFIG,
    oauth: false,
    segments: {
      ...DEFAULT_CONFIG.segments,
      git: { ...DEFAULT_CONFIG.segments.git, enabled: false },
      usage: { ...DEFAULT_CONFIG.segments.usage, enabled: false },
    },
    ...overrides,
  };
}

describe('render', () => {
  it('returns empty string for no data', async () => {
    const config = testConfig({
      segments: {
        ...DEFAULT_CONFIG.segments,
        model: { enabled: false },
        git: { enabled: false },
        context: { enabled: false },
        session: { enabled: false },
        usage: { enabled: false },
        block: { enabled: false },
        daily: { enabled: false },
        metrics: { enabled: false },
        version: { enabled: false },
        tmux: { enabled: false },
        directory: { enabled: false },
        custom: { enabled: false },
      },
    });
    const output = await render({}, config);
    expect(output).toBe('');
  });

  it('renders model segment', async () => {
    const data: HookData = { model: { id: 'claude-opus-4-6', display_name: 'Opus 4.6' } };
    const output = await render(data, testConfig());
    expect(stripAnsi(output)).toContain('Opus 4.6');
  });

  it('renders multiple segments', async () => {
    const data: HookData = {
      model: { id: 'claude-opus-4-6', display_name: 'Opus 4.6' },
      cost: { total_cost_usd: 0.42 },
      context_window: { used_percentage: 50, total_input_tokens: 30000, total_output_tokens: 5000 },
    };
    const output = await render(data, testConfig());
    const visible = stripAnsi(output);
    expect(visible).toContain('Opus 4.6');
    expect(visible).toContain('$0.42');
  });

  it('respects segment ordering by priority', async () => {
    const data: HookData = {
      model: { id: 'claude-opus-4-6', display_name: 'Opus' },
      cost: { total_cost_usd: 0.42 },
    };
    const output = stripAnsi(await render(data, testConfig()));
    const modelIdx = output.indexOf('Opus');
    const costIdx = output.indexOf('$0.42');
    // Model (priority 100) should come before session (priority 70)
    expect(modelIdx).toBeLessThan(costIdx);
  });

  it('supports multi-line output', async () => {
    const data: HookData = {
      model: { id: 'claude-opus-4-6', display_name: 'Opus' },
      cost: { total_cost_usd: 0.42 },
      context_window: { used_percentage: 50, total_input_tokens: 30000, total_output_tokens: 5000 },
    };
    const config = testConfig({ lines: 2 });
    const output = await render(data, config);
    const lines = output.split('\n');
    expect(lines.length).toBeGreaterThanOrEqual(2);
  });
});
