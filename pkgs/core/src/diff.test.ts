import { describe, it, expect } from 'vitest';

import { isDiffObjSimple, isDiffSimple } from './diff.js';

describe('isDiffSimple', () => {
  it('should find no diff', () => {
    const res = isDiffSimple('bar', 'bar');
    expect(res).toBe(false);
  });
});

describe('isDiffObjSimple', () => {
  it('should find no diff', () => {
    const res = isDiffObjSimple({ foo: 'bar' }, { foo: 'bar' });
    expect(res).toBe(false);
  });

  it('should find a diff (value)', () => {
    const res = isDiffObjSimple({ foo: 'bar' }, { foo: 'a' });
    expect(res).toBe(true);
  });

  it('should find a diff (missing)', () => {
    const res = isDiffObjSimple({ foo: 'bar' }, {});
    expect(res).toBe(true);
  });

  it('should find a diff (new)', () => {
    const res = isDiffObjSimple({}, { foo: 'bar' });
    expect(res).toBe(true);
  });

  it('should find a diff (value type)', () => {
    const res = isDiffObjSimple({ foo: 'bar' }, { foo: true });
    expect(res).toBe(true);
  });

  it('should find a no diff (unordered)', () => {
    const res = isDiffObjSimple(
      { foo: 'bar', hello: true },
      { hello: true, foo: 'bar' }
    );
    expect(res).toBe(false);
  });
});
