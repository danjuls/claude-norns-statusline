// ── Git Operations ──
// Parallel git commands with timeouts

import { execFile } from 'child_process';
import type { GitInfo } from '../types.js';

const TIMEOUT = 2000;

function gitCmd(args: string[], cwd?: string): Promise<string> {
  return new Promise(resolve => {
    execFile('git', args, { timeout: TIMEOUT, cwd, encoding: 'utf-8' }, (err, stdout) => {
      resolve(err ? '' : stdout.trim());
    });
  });
}

export async function getGitInfo(cwd?: string): Promise<GitInfo | null> {
  // First check if we're in a repo at all
  const isRepo = await gitCmd(['rev-parse', '--is-inside-work-tree'], cwd);
  if (isRepo !== 'true') return null;

  // Run remaining commands in parallel
  const [branch, status, stash, upstream] = await Promise.all([
    gitCmd(['rev-parse', '--abbrev-ref', 'HEAD'], cwd),
    gitCmd(['status', '--porcelain', '-uno'], cwd).then(s => s || '').then(s => {
      // Also get untracked
      return gitCmd(['status', '--porcelain'], cwd);
    }),
    gitCmd(['stash', 'list'], cwd),
    gitCmd(['rev-list', '--left-right', '--count', 'HEAD...@{upstream}'], cwd),
  ]);

  const statusLines = status.split('\n').filter(Boolean);
  const staged = statusLines.filter(l => /^[MADRC]/.test(l)).length;
  const unstaged = statusLines.filter(l => /^.[MD]/.test(l)).length;
  const untracked = statusLines.filter(l => l.startsWith('??')).length;

  let ahead = 0;
  let behind = 0;
  if (upstream) {
    const parts = upstream.split('\t');
    ahead = parseInt(parts[0]) || 0;
    behind = parseInt(parts[1]) || 0;
  }

  const stashCount = stash ? stash.split('\n').filter(Boolean).length : 0;

  return {
    branch: branch || 'HEAD',
    dirty: staged > 0 || unstaged > 0 || untracked > 0,
    staged,
    unstaged,
    untracked,
    ahead,
    behind,
    stashCount,
    isRepo: true,
  };
}
