export type FilterObjWithKey<
  TObj extends Record<any, any>,
  TKey extends string
> = TObj extends Record<TKey, any> ? TObj : never;

export type FilterObjObjWithKey<
  TObj extends Record<any, any>,
  TKey extends string
> = {
  [T in keyof TObj as FilterObjWithKey<TObj[T], TKey> extends never
    ? never
    : T]: any;
};

export type PartialUndefined<TType> = {
  [Properties in keyof TType]?: TType[Properties] | undefined;
};
