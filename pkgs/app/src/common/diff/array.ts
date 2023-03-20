import type { DiffObjectsArray } from '../store';

export function diffObjectsArray<T>(
  arrayA: T[],
  arrayB: T[],
  id: keyof T
): DiffObjectsArray<T> {
  const idsA = arrayA.map((el) => el[id]);
  const idsB = arrayB.map((el) => el[id]);

  const added: T[] = [];
  const deleted: T[] = [];
  const modified: T[] = [];
  const unchanged: T[] = [];

  for (const a of arrayA) {
    if (idsB.includes(a[id])) {
      unchanged.push(a);
      continue;
    }

    deleted.push(a);
  }

  for (const b of arrayB) {
    if (idsA.includes(b[id])) {
      continue;
    }

    added.push(b);
  }

  return {
    added,
    deleted,
    unchanged,
    modified,
    changes: added.length + deleted.length + modified.length,
  };
}

export function diffStringArray<T>(
  arrayA: T[],
  arrayB: T[]
): DiffObjectsArray<T> {
  const added: T[] = [];
  const deleted: T[] = [];
  const unchanged: T[] = [];

  for (const a of arrayA) {
    if (arrayB.includes(a)) {
      unchanged.push(a);
      continue;
    }

    deleted.push(a);
  }

  for (const b of arrayB) {
    if (arrayA.includes(b)) {
      continue;
    }

    added.push(b);
  }

  return {
    added,
    deleted,
    unchanged,
    modified: [],
    changes: added.length + deleted.length,
  };
}
