export function isDiffSimple(
  a: Record<string, any> | string[] | string | null,
  b: Record<string, any> | string[] | string | null
): boolean {
  return JSON.stringify(a) !== JSON.stringify(b);
}
