/* eslint-disable @typescript-eslint/no-empty-function */
import type {
  ApiBlob,
  ApiComponent,
  ApiDocument,
  ApiProject,
} from 'api/src/types/api';
import type {
  DBBlobComponent,
  DBBlobDocument,
  DBBlobProject,
} from 'api/src/types/db/blobs';
import { useMemo, useState, createContext, useContext } from 'react';

export interface EditContextSub<
  TBlob extends
    | DBBlobComponent['blob']
    | DBBlobDocument['blob']
    | DBBlobProject['blob'] =
    | DBBlobComponent['blob']
    | DBBlobDocument['blob']
    | DBBlobProject['blob']
> {
  changes: Partial<TBlob>;
  set: <TKey extends keyof TBlob>(key: TKey, value: TBlob[TKey]) => void;
  revert: <TKey extends keyof TmpBlob['blob']>(key: TKey) => void;
}

export type TmpBlob = TmpBlobComponent | TmpBlobDocument | TmpBlobProject;
export type TmpBlobComponent = DBBlobComponent & {
  typeId: string;
  previous: ApiComponent;
};
export type TmpBlobDocument = DBBlobDocument & {
  typeId: string;
  previous: ApiDocument;
};
export type TmpBlobProject = DBBlobProject & {
  typeId: string;
  previous: ApiProject;
};

export interface GetMethod {
  (type: 'project', typeId: string, previous: ApiProject): EditContextSub<
    DBBlobProject['blob']
  >;
  (type: 'component', typeId: string, previous: ApiComponent): EditContextSub<
    DBBlobComponent['blob']
  >;
  (type: 'document', typeId: string, previous: ApiDocument): EditContextSub<
    DBBlobDocument['blob']
  >;
}

export interface EditContextInterface {
  isEnabled: () => boolean;
  lastUpdate: Date | null;
  changes: TmpBlob[];
  hasChange: (type: ApiBlob['type'], typeId: string) => boolean;
  setChanges: (bag: TmpBlob[], time: Date) => void;
  getNumberOfChanges: () => number;
  enable: (val: boolean) => void;
  revert: <TField extends keyof TmpBlob['blob']>(
    type: ApiBlob['type'],
    typeId: string,
    key: TField
  ) => void;
  get: GetMethod;
}

const EditContext = createContext<EditContextInterface>(
  {} as EditContextInterface
);

export function isDiff(a: any, b: any): boolean {
  return JSON.stringify(a) !== JSON.stringify(b);
}

export const store: EditContextInterface['changes'] = [];

export const EditProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [enabled, setEnabled] = useState<boolean>(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const memoized = useMemo<EditContextInterface>(() => {
    const tmp: EditContextInterface = {
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
      hasChange(type, typeId) {
        const has = store.find((c) => c.type === type && c.typeId === typeId);

        return Boolean(has && Object.keys(has.blob).length > 0);
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
        let has = store.find((c) => c.type === type && c.typeId === typeId);
        if (!has) {
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          has = { type, typeId, previous, blob: {} } as TmpBlob;
          store.push(has!);
        }

        return {
          changes: has!.blob as any,
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
    };
    return tmp;
  }, [enabled, lastUpdate]);

  return (
    <EditContext.Provider value={memoized}>{children}</EditContext.Provider>
  );
};

export const useEdit = (): EditContextInterface => {
  return useContext(EditContext);
};
