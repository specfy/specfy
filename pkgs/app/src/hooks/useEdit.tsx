import { useMemo, useState, createContext, useContext } from 'react';

export interface EditContextInterface {
  isEnabled: () => boolean;
  enable: (val: boolean) => void;
  prev: () => boolean;
}

const EditContext = createContext<EditContextInterface>(
  {} as EditContextInterface
);

export const EditProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [enabled, setEnabled] = useState<boolean>(false);
  const [prev, setPrev] = useState<boolean>(false);

  const memoized = useMemo<EditContextInterface>(() => {
    const tmp: EditContextInterface = {
      isEnabled: () => enabled,
      enable: (val) => {
        setPrev(enabled);
        setEnabled(val);
      },
      prev: () => {
        return prev;
      },
    };
    return tmp;
  }, [enabled]);

  return (
    <EditContext.Provider value={memoized}>{children}</EditContext.Provider>
  );
};

export const useEdit = (): EditContextInterface => {
  return useContext(EditContext);
};
