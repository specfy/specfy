export function isDiffSimple(
  a: Record<string, any> | string[] | boolean | number | string | null,
  b: Record<string, any> | string[] | boolean | number | string | null
): boolean {
  const typeA = typeof a;
  const typeB = typeof b;
  if (
    (typeA === 'boolean' && typeB === 'boolean') ||
    (typeA === 'number' && typeB === 'number') ||
    (typeA === 'string' && typeB === 'string')
  ) {
    return a !== b;
  }

  return JSON.stringify(a) !== JSON.stringify(b);
}

export function isDiffObjSimple(
  a: Record<string, any>,
  b: Record<string, any>
): boolean {
  const diff = Object.keys(a).reduce((result, key) => {
    if (!(key in b)) {
      result.push(key);
    } else if (!isDiffSimple(a[key], b[key])) {
      const resultKeyIndex = result.indexOf(key);
      result.splice(resultKeyIndex, 1);
    }
    return result;
  }, Object.keys(b));

  return diff.length > 0;
}
