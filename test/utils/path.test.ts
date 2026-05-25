import { describe, it, expect, vi } from 'vitest';
import { abbreviatePath } from '../../src/utils/path.js';

vi.mock('os', () => ({ homedir: () => '/home/testuser' }));

describe('abbreviatePath', () => {
  it('replaces home dir with ~', () => {
    expect(abbreviatePath('/home/testuser/projects')).toBe('~/projects');
  });

  it('keeps short paths intact', () => {
    expect(abbreviatePath('/home/testuser/Work/foo', 3)).toBe('~/Work/foo');
  });

  it('abbreviates intermediate directories', () => {
    expect(abbreviatePath('/home/testuser/Work/deep/nested/project', 3)).toBe('~/W/d/nested/project');
  });

  it('handles non-home paths', () => {
    expect(abbreviatePath('/var/log', 3)).toBe('/var/log');
  });

  it('abbreviates non-home deep paths', () => {
    expect(abbreviatePath('/var/lib/very/deep/path', 3)).toBe('/v/l/v/deep/path');
  });

  it('respects maxSegments parameter', () => {
    const result = abbreviatePath('/home/testuser/a/b/c/d', 2);
    // Should abbreviate more aggressively with fewer segments
    expect(result.split('/').length).toBeGreaterThan(2);
  });
});
