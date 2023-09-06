import { describe, expect, it } from 'vitest';

import { getComponentSize } from './helpers.js';

describe('getComponentSize', () => {
  it('should output correct size, not hosting', () => {
    expect(getComponentSize('db', 'Google SQL')).toStrictEqual({
      height: 40,
      width: 140,
    });
  });
  it('should output correct size, hosting', () => {
    expect(getComponentSize('hosting', 'Kubernetes')).toStrictEqual({
      height: 72,
      width: 140,
    });
  });
});
