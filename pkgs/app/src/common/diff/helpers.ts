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
