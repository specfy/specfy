/* eslint-disable @typescript-eslint/no-empty-function */
import type { ApiBlob } from 'api/src/types/api';
import { useMemo, useState, createContext, useContext } from 'react';

export interface EditContextSub<T extends Record<string, any>> {
  changes: Partial<T>;
  set: <TField extends keyof TmpBlob['blob']>(
    key: TField,
    value: T[TField]
  ) => void;
  revert: <TField extends keyof TmpBlob['blob']>(key: TField) => void;
}

export type TmpBlob<T extends Record<string, any> = Record<string, any>> = Pick<
  ApiBlob,
  'blob' | 'type' | 'typeId'
> & {
  previous: T;
};

export interface EditContextInterface {
  isEnabled: () => boolean;
  lastUpdate: Date | null;
  changes: TmpBlob[];
  hasChange: <TField extends keyof TmpBlob['blob']>(
    type: ApiBlob['type'],
    typeId: string,
    key: TField
  ) => boolean;
  setChanges: (bag: TmpBlob[], time: Date) => void;
  getNumberOfChanges: () => number;
  enable: (val: boolean) => void;
  revert: <TField extends keyof TmpBlob['blob']>(
    type: ApiBlob['type'],
    typeId: string,
    key: TField
  ) => void;
  get: <T extends Record<string, any>>(
    type: ApiBlob['type'],
    typeId: string,
    previous: T
  ) => EditContextSub<T>;
}

const EditContext = createContext<EditContextInterface>(
  {} as EditContextInterface
);

export function isDiff(a: any, b: any): boolean {
  return JSON.stringify(a) !== JSON.stringify(b);
}

export const store: EditContextInterface['changes'] = [];

export function getOrCreate<T extends Record<string, any>>(
  type: ApiBlob['type'],
  typeId: string,
  previous: T
): TmpBlob<T> {
  let has = store.find<TmpBlob<T>>(
    (c): c is TmpBlob<T> => c.type === type && c.typeId === typeId
  );
  if (!has) {
    has = { type, typeId, previous, blob: {} as any };
    store.push(has);
  }

  return has;
}

export const EditProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [enabled, setEnabled] = useState<boolean>(false);
  // const [changes, setChanges] = useState<EditContextInterface['changes']>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const memoized = useMemo<EditContextInterface>(
    () => ({
      isEnabled: () => enabled,
      lastUpdate,
      changes: store,
      getNumberOfChanges: () => {
        let count = 0;
        for (const change of store) {
          count += Object.keys(change.blob).length;
        }

        return count;
      },
      enable: (val) => {
        setEnabled(val);
      },
      hasChange(type, typeId, key) {
        const has = store.find((c) => c.type === type && c.typeId === typeId);

        return Boolean(has && key in has.blob);
      },
      setChanges: (bag, time) => {
        store.splice(0, store.length);
        store.push(...bag);
        setLastUpdate(time);
      },
      revert(type, typeId, key) {
        store.forEach((change) => {
          if (change.type !== type || change.typeId !== typeId) return change;
          delete change.blob[key];
          return change;
        });
        setLastUpdate(new Date());
      },
      get(type, typeId, previous) {
        const has = getOrCreate(type, typeId, previous);

        return {
          changes: has.blob as any,
          set: (key, value) => {
            if (!isDiff(previous[key], value)) {
              delete has!.blob[key];
            } else {
              has!.blob[key] = value;
            }
            setLastUpdate(new Date());
          },
          revert: (key) => {
            delete has?.blob[key];
            setLastUpdate(new Date());
          },
        };
      },
    }),
    [enabled, lastUpdate]
  );

  return (
    <EditContext.Provider value={memoized}>{children}</EditContext.Provider>
  );
};

export const useEdit = (): EditContextInterface => {
  return useContext(EditContext);
};
