import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadConfig } from '../../src/config/loader.js';

describe('loadConfig', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns defaults with no args', () => {
    const config = loadConfig([]);
    expect(config.theme).toBe('yggdrasil');
    expect(config.style).toBe('powerline');
    expect(config.charset).toBe('nerd');
    expect(config.segments.model.enabled).toBe(true);
    expect(config.segments.block.enabled).toBe(false);
  });

  it('parses --theme', () => {
    expect(loadConfig(['--theme=bifrost']).theme).toBe('bifrost');
  });

  it('parses --style', () => {
    expect(loadConfig(['--style=minimal']).style).toBe('minimal');
  });

  it('parses --charset', () => {
    expect(loadConfig(['--charset=text']).charset).toBe('text');
  });

  it('parses --lines as number', () => {
    expect(loadConfig(['--lines=2']).lines).toBe(2);
  });

  it('ignores --lines=1', () => {
    expect(loadConfig(['--lines=1']).lines).toBeUndefined();
  });

  it('disables segment with --no-segment', () => {
    const config = loadConfig(['--no-git']);
    expect(config.segments.git.enabled).toBe(false);
  });

  it('enables segment with --segment=true', () => {
    const config = loadConfig(['--block=true']);
    expect(config.segments.block.enabled).toBe(true);
  });

  it('enables segment with priority via --segment=N', () => {
    const config = loadConfig(['--block=75']);
    expect(config.segments.block.enabled).toBe(true);
    expect(config.segments.block.priority).toBe(75);
  });

  it('parses --shimmer', () => {
    expect(loadConfig(['--shimmer=true']).shimmer).toBe(true);
    expect(loadConfig(['--shimmer=false']).shimmer).toBe(false);
  });

  it('parses --oauth=false', () => {
    expect(loadConfig(['--oauth=false']).oauth).toBe(false);
  });

  it('reads env vars', () => {
    vi.stubEnv('NORNS_THEME', 'ragnarok');
    const config = loadConfig([]);
    expect(config.theme).toBe('ragnarok');
  });

  it('CLI args override env vars', () => {
    vi.stubEnv('NORNS_THEME', 'ragnarok');
    const config = loadConfig(['--theme=mist']);
    expect(config.theme).toBe('mist');
  });
});
