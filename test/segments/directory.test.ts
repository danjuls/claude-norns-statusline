import { describe, it, expect, vi } from 'vitest';
import { DirectorySegment } from '../../src/segments/directory.js';
import { DEFAULT_CONFIG } from '../../src/config/defaults.js';
import type { HookData } from '../../src/types.js';

vi.mock('os', () => ({ homedir: () => '/home/testuser' }));

const segment = new DirectorySegment();

describe('DirectorySegment', () => {
  it('shows abbreviated workspace path', async () => {
    const data: HookData = { workspace: { current_dir: '/home/testuser/Work/project' } };
    const result = await segment.gather(data, DEFAULT_CONFIG);
    expect(result).not.toBeNull();
    expect(result!.content).toContain('~/Work/project');
  });

  it('falls back to cwd field', async () => {
    const data: HookData = { cwd: '/home/testuser/code' };
    const result = await segment.gather(data, DEFAULT_CONFIG);
    expect(result!.content).toContain('~/code');
  });

  it('uses text charset', async () => {
    const data: HookData = { workspace: { current_dir: '/tmp/test' } };
    const config = { ...DEFAULT_CONFIG, charset: 'text' as const };
    const result = await segment.gather(data, config);
    expect(result!.content).toBe('/tmp/test');
  });
});
