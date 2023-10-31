import { describe, expect, it } from 'vitest';

import { scoreUser } from './usage.js';

import type { GetCatalogUser } from './types.api.js';

const def = (): GetCatalogUser => {
  return {
    count: 15,
    firstUpdate: Date.now(),
    lastUpdate: Date.now(),
    score: 0,
    type: 'user',
    profile: {} as any,
    trend: 'bad',
  };
};
describe('score', () => {
  it('should output a perfect score', () => {
    expect(scoreUser({ ...def() }, Date.now(), 15)).toBe(10);
  });

  it.each([
    { day: 1, score: 10 },
    { day: 7, score: 10 },
    { day: 15, score: 7 },
    { day: 30, score: 6 },
    { day: 90, score: 5 },
  ])('should output a lower score based on time', (val) => {
    expect(
      scoreUser(
        { ...def(), lastUpdate: Date.now() - 86400 * 1000 * val.day },
        Date.now(),
        15
      )
    ).toBe(val.score);
  });

  it.each([
    { count: 1, total: 1, be: 5 },
    { count: 15, total: 150, be: 8 },
    { count: 15, total: 500, be: 6 },
    { count: 15, total: 5000, be: 4 },
    { count: 150, total: 500, be: 9 },
  ])('should remove point based on pct', (val) => {
    expect(
      scoreUser({ ...def(), count: val.count }, Date.now(), val.total)
    ).toBe(val.be);
  });
});
