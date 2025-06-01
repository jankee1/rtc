import { describe, it, expect } from 'vitest';
import { sleep } from '../../../src/consumer/utils';

describe('sleep', () => {
  it('should delay execution for at least the specified time', async () => {
    const delay = 500;
    const start = Date.now();

    await sleep(delay);

    const elapsed = Date.now() - start;

    expect(elapsed).toBeGreaterThanOrEqual(delay - 10);
  });

  it('should return a Promise that resolves', async () => {
    await expect(sleep(100)).resolves.toBeUndefined();
  });
});