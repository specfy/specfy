export function omit<
  TObj extends Record<string, any>,
  TKeys extends string = string,
  TRes extends Omit<TObj, TKeys> = Omit<TObj, TKeys>
>(obj: TObj, keys: TKeys[] | readonly TKeys[]): TRes {
  const copy: TRes = {} as any;
  for (const [key, value] of Object.entries(obj)) {
    if (keys.includes(key as TKeys)) {
      continue;
    }

    // @ts-expect-error (VScode report no error but tsc yes)
    copy[key] = value;
  }

  return copy;
}

export function pick<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  return Object.fromEntries(
    keys.filter((key) => key in obj).map((key) => [key, obj[key]])
  ) as Pick<T, K>;
}
