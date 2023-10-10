import { describe, expect, it } from 'vitest';

import { componentsToCatalog } from './helpers.js';

describe('componentsToCatalog', () => {
  it('should output nothing', () => {
    const res = componentsToCatalog(
      { id: 'a', orgId: 'b', projectId: 'c' },
      []
    );
    expect(res).toStrictEqual(new Map());
  });

  it('should output nothing if no tech', () => {
    const res = componentsToCatalog({ id: 'a', orgId: 'b', projectId: 'c' }, [
      { name: 'Foobar', techId: null, techs: [], type: 'service' },
    ]);
    expect(res).toStrictEqual(new Map());
  });

  it('should output from techId', () => {
    const res = componentsToCatalog({ id: 'a', orgId: 'b', projectId: 'c' }, [
      { name: 'Foobar', techId: 'algolia', techs: [], type: 'service' },
    ]);
    expect(Array.from(res.values())).toMatchObject([
      { key: 'algolia', name: 'Algolia', type: 'saas' },
    ]);
  });

  it('should output from techId unknown', () => {
    const res = componentsToCatalog({ id: 'a', orgId: 'b', projectId: 'c' }, [
      { name: 'Foobar', techId: 'unknown', techs: [], type: 'api' },
    ]);
    expect(Array.from(res.values())).toMatchObject([
      { key: 'Foobar', name: 'Foobar', type: 'unknown' },
    ]);
  });

  it('should output from techs', () => {
    const res = componentsToCatalog({ id: 'a', orgId: 'b', projectId: 'c' }, [
      {
        name: 'Foobar',
        techId: null,
        techs: [{ id: 'algolia' }, { id: 'Custom' }],
        type: 'api',
      },
    ]);
    expect(Array.from(res.values())).toMatchObject([
      { key: 'algolia', name: 'Algolia', type: 'saas' },
      { key: 'Custom', name: 'Custom', type: 'unknown' },
    ]);
  });
});
