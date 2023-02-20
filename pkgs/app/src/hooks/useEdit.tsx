/* eslint-disable @typescript-eslint/no-empty-function */
import type { ApiBlob } from 'api/src/types/api/blob';
import { useMemo, useState, createContext, useContext } from 'react';

export interface EditContextSub<T extends Record<string, any>> {
  changes: Partial<T>;
  set: <TField extends string>(key: TField, value: T[TField]) => void;
  revert: <TField extends string>(key: TField) => void;
}

export interface EditChange {
  type: ApiBlob['type'];
  id: string;
  original: Record<string, any>;
  values: Record<string, any>;
}

export interface EditContextInterface {
  isEnabled: boolean;
  lastUpdate: Date | null;
  changes: EditChange[];
  setChanges: (bag: EditChange[]) => void;
  getNumberOfChanges: () => number;
  enable: (val: boolean) => void;
  revert: <TField extends string>(
    type: string,
    id: string,
    key: TField
  ) => void;
  get: <T extends Record<string, any>>(
    type: string,
    id: string,
    original: T
  ) => EditContextSub<T>;
}

const EditContext = createContext<EditContextInterface>({
  isEnabled: false,
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
      isEnabled: enabled,
      lastUpdate,
      // Changes is not reactive when using get();
      changes,
      getNumberOfChanges: () => {
        let count = 0;
        for (const change of changes) {
          for (const [key, val] of Object.entries(change.values)) {
            count += isDiff(change.original[key], val) ? 1 : 0;
          }
        }

        return count;
      },
      enable: (val) => {
        setEnabled(val);
      },
      setChanges: (bag) => {
        setChanges(bag);
      },
      revert(type, id, key) {
        setChanges(
          changes.map((change) => {
            if (change.type !== type && change.id !== id) return change;
            delete change.values[key];
            return change;
          })
        );
        setLastUpdate(new Date());
      },
      get(type, id, original) {
        let has = changes.find((c) => c.type === type && c.id === id);
        if (!has) {
          has = { type, id, original, values: {} };
          setChanges([...changes, has]);
        }

        return {
          changes: has.values as any,
          set: (key, value) => {
            has!.values[key] = value;
            setLastUpdate(new Date());
          },
          revert: (key) => {
            delete has?.values[key];
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
