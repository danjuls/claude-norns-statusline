import { describe, it, expect } from 'vitest';
import { formatCost, formatTokens, formatDuration, formatPercent, formatModelName } from '../../src/utils/format.js';

describe('formatCost', () => {
  it('shows $0.00 for tiny amounts', () => {
    expect(formatCost(0.001)).toBe('$0.00');
    expect(formatCost(0.009)).toBe('$0.00');
  });

  it('shows two decimal places under $10', () => {
    expect(formatCost(0.42)).toBe('$0.42');
    expect(formatCost(1.23)).toBe('$1.23');
    expect(formatCost(9.99)).toBe('$9.99');
  });

  it('shows one decimal for $10+', () => {
    expect(formatCost(10.5)).toBe('$10.5');
    expect(formatCost(42.0)).toBe('$42.0');
  });
});

describe('formatTokens', () => {
  it('shows raw count under 1K', () => {
    expect(formatTokens(0)).toBe('0');
    expect(formatTokens(999)).toBe('999');
  });

  it('shows K format for thousands', () => {
    expect(formatTokens(1000)).toBe('1.0K');
    expect(formatTokens(42500)).toBe('42.5K');
    expect(formatTokens(99999)).toBe('100.0K');
  });

  it('shows rounded K for 100K+', () => {
    expect(formatTokens(100000)).toBe('100K');
    expect(formatTokens(500000)).toBe('500K');
  });

  it('shows M format for millions', () => {
    expect(formatTokens(1000000)).toBe('1.0M');
    expect(formatTokens(2500000)).toBe('2.5M');
  });
});

describe('formatDuration', () => {
  it('shows seconds for < 60s', () => {
    expect(formatDuration(5)).toBe('5s');
    expect(formatDuration(59)).toBe('59s');
  });

  it('shows minutes for < 60m', () => {
    expect(formatDuration(60)).toBe('1m');
    expect(formatDuration(300)).toBe('5m');
  });

  it('shows hours and minutes', () => {
    expect(formatDuration(3600)).toBe('1h');
    expect(formatDuration(3720)).toBe('1h02m');
    expect(formatDuration(7500)).toBe('2h05m');
  });
});

describe('formatPercent', () => {
  it('rounds to nearest integer', () => {
    expect(formatPercent(42.3)).toBe('42%');
    expect(formatPercent(42.7)).toBe('43%');
    expect(formatPercent(0)).toBe('0%');
    expect(formatPercent(100)).toBe('100%');
  });
});

describe('formatModelName', () => {
  it('returns displayName if provided', () => {
    expect(formatModelName('claude-opus-4-6', 'Opus 4.6')).toBe('Opus 4.6');
  });

  it('parses opus model IDs', () => {
    expect(formatModelName('claude-opus-4-6')).toBe('Opus 4');
  });

  it('parses sonnet model IDs', () => {
    expect(formatModelName('claude-sonnet-4-6')).toBe('Sonnet 4');
  });

  it('parses haiku model IDs', () => {
    expect(formatModelName('claude-haiku-4-5-20251001')).toBe('Haiku 4');
  });

  it('returns raw ID for unknown models', () => {
    expect(formatModelName('some-unknown-model')).toBe('some-unknown-model');
  });
});
