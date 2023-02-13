/* eslint-disable @typescript-eslint/no-empty-function */
import { useMemo, useState, createContext, useContext } from 'react';

export interface EditContextSub<T extends Record<string, any>> {
  edits: Partial<T>;
  set: <TField extends string>(field: TField, value: T[TField]) => void;
  remove: <TField extends string>(field: TField) => void;
}
export interface EditContextInterface {
  isEnabled: boolean;
  lastUpdate: number;
  edits: Record<string, Record<string, any>>;
  setEdits: (bag: Record<string, Record<string, any>>) => void;
  getNumberOfUpdates: () => number;
  getOriginals: () => Record<string, Record<string, any>>;
  enable: (val: boolean) => void;
  get: <T extends Record<string, any>>(
    type: string,
    id: string,
    original: T
  ) => EditContextSub<T>;
}

const EditContext = createContext<EditContextInterface>({
  isEnabled: false,
  lastUpdate: -1,
  edits: {},
  setEdits: () => {},
  getOriginals: () => {
    return {};
  },
  getNumberOfUpdates: () => 0,
  enable() {},
  get() {
    return { edits: {}, set() {}, remove() {} };
  },
});

export function isDiff(a: any, b: any): boolean {
  return JSON.stringify(a) !== JSON.stringify(b);
}

export const EditProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [enabled, setEnabled] = useState<boolean>(false);
  const [edits, setEdits] = useState<EditContextInterface['edits']>({});
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());
  const [originals, setOriginals] = useState<Record<string, any>>({});

  const memoized = useMemo<EditContextInterface>(
    () => ({
      isEnabled: enabled,
      lastUpdate,
      edits,
      getOriginals: () => originals,
      getNumberOfUpdates: () => {
        return Object.entries(edits).reduce((updates, [key, curr]) => {
          return Object.entries(curr).reduce((_, [k, v]) => {
            return isDiff(originals[key][k], v) ? updates + 1 : updates;
          }, updates);
        }, 0);
      },
      enable: (val) => {
        setEnabled(val);
      },
      setEdits: (bag) => {
        setEdits(bag);
      },
      get(type, id, original) {
        const key = `${type}_${id}`;
        setOriginals({ ...originals, [key]: original });
        if (typeof edits[key] === 'undefined') {
          edits[key] = {};
        }
        return {
          edits: edits[key] as any,
          set: (field, value) => {
            edits[key][field] = value;
            setEdits({ ...edits });
            setLastUpdate(Date.now());
          },
          remove: (field) => {
            delete edits[key][field];
            setEdits({ ...edits });
          },
        };
      },
    }),
    [edits, enabled]
  );

  return (
    <EditContext.Provider value={memoized}>{children}</EditContext.Provider>
  );
};

export const useEdit = (): EditContextInterface => {
  return useContext(EditContext);
};
