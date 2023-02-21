/* eslint-disable @typescript-eslint/no-empty-function */
import type { ApiBlob } from 'api/src/types/api/blob';
import { useMemo, useState, createContext, useContext } from 'react';

export interface EditContextSub<T extends Record<string, any>> {
  changes: Partial<T>;
  set: <TField extends keyof TmpBlob['blob']>(
    key: TField,
    value: T[TField]
  ) => void;
  revert: <TField extends keyof TmpBlob['blob']>(key: TField) => void;
}

export type TmpBlob = Pick<ApiBlob, 'blob' | 'type' | 'typeId'> & {
  previous: Record<string, any>;
};

export interface EditContextInterface {
  isEnabled: () => boolean;
  lastUpdate: Date | null;
  changes: TmpBlob[];
  setChanges: (bag: TmpBlob[]) => void;
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

const EditContext = createContext<EditContextInterface>({
  isEnabled: () => false,
  lastUpdate: null,
  changes: [],
  setChanges: () => {},
  getNumberOfChanges: () => 0,
  enable() {},
  revert() {},
  get() {
    return { changes: {}, set() {}, revert() {} };
  },
});

export function isDiff(a: any, b: any): boolean {
  return JSON.stringify(a) !== JSON.stringify(b);
}

export const EditProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [enabled, setEnabled] = useState<boolean>(false);
  const [changes, setChanges] = useState<EditContextInterface['changes']>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const memoized = useMemo<EditContextInterface>(
    () => ({
      isEnabled: () => enabled,
      lastUpdate,
      // Changes is not reactive when using get();
      changes,
      getNumberOfChanges: () => {
        let count = 0;
        for (const change of changes) {
          for (const [key, val] of Object.entries(change.blob)) {
            count += isDiff(change.previous[key], val) ? 1 : 0;
          }
        }

        return count;
      },
      enable: (val) => {
        setEnabled(val);
      },
      setChanges: (bag) => {
        setChanges(bag);
        setLastUpdate(new Date());
      },
      revert(type, typeId, key) {
        setChanges(
          changes.map((change) => {
            if (change.type !== type && change.typeId !== typeId) return change;
            delete change.blob[key];
            return change;
          })
        );
        setLastUpdate(new Date());
      },
      get(type, typeId, previous) {
        let has = changes.find((c) => c.type === type && c.typeId === typeId);
        if (!has) {
          has = { type, typeId, previous, blob: {} as any };
          setChanges([...changes, has]);
        }

        return {
          changes: has.blob as any,
          set: (key, value) => {
            has!.blob[key] = value;
            setLastUpdate(new Date());
          },
          revert: (key) => {
            delete has?.blob[key];
            setLastUpdate(new Date());
          },
        };
      },
    }),
    [changes, enabled, lastUpdate]
  );

  return (
    <EditContext.Provider value={memoized}>{children}</EditContext.Provider>
  );
};

export const useEdit = (): EditContextInterface => {
  return useContext(EditContext);
};
