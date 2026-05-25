// ── Sparkline Renderer ──
// Converts an array of numbers to a unicode sparkline string

const TICKS = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];

export function sparkline(values: number[], width = 8): string {
  if (values.length === 0) return '';

  // Resample to fit width
  const resampled = resample(values, width);

  const min = Math.min(...resampled);
  const max = Math.max(...resampled);
  const range = max - min;

  if (range === 0) {
    // Flat line — use middle tick
    return TICKS[1].repeat(resampled.length);
  }

  return resampled
    .map(v => {
      const idx = Math.round(((v - min) / range) * (TICKS.length - 1));
      return TICKS[Math.min(idx, TICKS.length - 1)];
    })
    .join('');
}

function resample(values: number[], targetLen: number): number[] {
  if (values.length <= targetLen) return values;

  const result: number[] = [];
  const step = values.length / targetLen;

  for (let i = 0; i < targetLen; i++) {
    const start = Math.floor(i * step);
    const end = Math.floor((i + 1) * step);
    // Average the values in this bucket
    let sum = 0;
    let count = 0;
    for (let j = start; j < end && j < values.length; j++) {
      sum += values[j];
      count++;
    }
    result.push(count > 0 ? sum / count : 0);
  }

  return result;
}
