export function omit<
  TObj extends Record<any, any>,
  TKeys extends string = string,
  TRes extends Omit<TObj, TKeys> = Omit<TObj, TKeys>
>(obj: TObj, keys: TKeys[]): TRes {
  const copy: TRes = {} as any;
  for (const [key, value] of Object.entries(obj)) {
    if (keys.includes(key as any)) {
      continue;
    }

    // @ts-expect-error (VScode report no error but tsc yes)
    copy[key] = value;
  }

  return copy;
}
