/* eslint-disable @typescript-eslint/no-empty-function */
import { useMemo, useState, createContext, useContext } from 'react';

interface EditContextInterface {
  isEnabled: boolean;
  edits: Record<string, Record<string, string | null>>;
  enable: (val: boolean) => void;
  isEdited: (type: string, id: string, field: string) => boolean;
  get: (type: string, id: string, field: string) => string | undefined;
  set: (type: string, id: string, field: string, value: string | null) => void;
}

const EditContext = createContext<EditContextInterface>({
  isEnabled: false,
  edits: {},
  enable() {},
  isEdited() {
    return false;
  },
  get() {
    return '';
  },
  set() {},
});

export const EditProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [enabled, setEnabled] = useState<boolean>(false);
  const [edits, setEdits] = useState<EditContextInterface['edits']>({});

  const v = useMemo<EditContextInterface>(
    () => ({
      isEnabled: enabled,
      edits,
      enable: (val) => {
        setEnabled(val);
      },
      isEdited(type, id, field) {
        return typeof edits[`${type}_${id}`]?.[field] !== 'undefined';
      },
      get(type, id, field) {
        return edits[`${type}_${id}`]?.[field] || undefined;
      },
      set(type, id, field, value) {
        const key = `${type}_${id}`;
        if (!edits[key]) edits[key] = { type, id };
        edits[key][field] = value;
        setEdits({ ...edits });
      },
    }),
    [edits, enabled]
  );

  return <EditContext.Provider value={v}>{children}</EditContext.Provider>;
};

export const useEdit = (): EditContextInterface => {
  return useContext(EditContext);
};
