import { describe, expect, it } from 'vitest';

import { getBlobComponent } from '../components/test.utils.js';

import { getAbsolutePosition, placeInsideHost } from './transform.js';

import type { DBComponent } from '../components/index.js';

describe('getAbsolutePosition', () => {
  it('should output same position when at the root', () => {
    const a = getBlobComponent({ id: 'a', orgId: 'b' });
    const res = getAbsolutePosition(a, [a]);
    expect(res).toStrictEqual({ x: 0, y: 0 });
  });

  it('should output same position when at the root (not 0)', () => {
    const def = getBlobComponent({ id: 'a', orgId: 'b' });
    const a: DBComponent = {
      ...def,
      display: { ...def.display, pos: { x: 10, y: 10 } },
    };
    const res = getAbsolutePosition(a, [a]);
    expect(res).toStrictEqual({ x: 10, y: 10 });
  });

  it('should output good position within one host', () => {
    const def = getBlobComponent({ id: 'a', orgId: 'b' });
    const a: DBComponent = {
      ...def,
      display: { ...def.display, pos: { x: 20, y: 20 } },
    };
    const b: DBComponent = {
      ...def,
      id: 'b',
      display: { ...def.display, pos: { x: 10, y: 10 } },
      inComponent: { id: a.id },
    };
    const res = getAbsolutePosition(b, [a, b]);
    expect(res).toStrictEqual({ x: 30, y: 30 });
  });

  it('should output good position within two host', () => {
    const def = getBlobComponent({ id: 'a', orgId: 'b' });
    const a: DBComponent = {
      ...def,
      display: { ...def.display, pos: { x: 20, y: 20 } },
    };
    const b: DBComponent = {
      ...def,
      id: 'b',
      display: { ...def.display, pos: { x: 30, y: 30 } },
      inComponent: { id: a.id },
    };
    const c: DBComponent = {
      ...def,
      id: 'c',
      display: { ...def.display, pos: { x: 10, y: 10 } },
      inComponent: { id: b.id },
    };
    const res = getAbsolutePosition(c, [a, b, c]);
    expect(res).toStrictEqual({ x: 60, y: 60 });
  });
});

describe('placeInsideHost', () => {
  it('should place inside a host (single level)', () => {
    const def = getBlobComponent({ id: 'a', orgId: 'b' });
    const a: DBComponent = {
      ...def,
      display: { ...def.display, pos: { x: 20, y: 20 } },
    };
    const b: DBComponent = {
      ...def,
      id: 'b',
      display: { ...def.display, pos: { x: 40, y: 40 } },
    };
    const res = placeInsideHost(b, a.id, [a, b]);
    expect(res).toStrictEqual({ x: 20, y: 20 });
  });

  it('should place inside a host (two level)', () => {
    const def = getBlobComponent({ id: 'a', orgId: 'b' });
    const a: DBComponent = {
      ...def,
      display: { ...def.display, pos: { x: 20, y: 20 } },
    };
    const b: DBComponent = {
      ...def,
      id: 'b',
      display: { ...def.display, pos: { x: 20, y: 20 } },
      inComponent: { id: a.id },
    };
    const c: DBComponent = {
      ...def,
      id: 'c',
      display: { ...def.display, pos: { x: 50, y: 50 } },
    };
    const res = placeInsideHost(c, b.id, [a, b, c]);
    expect(res).toStrictEqual({ x: 10, y: 10 });
  });
});
