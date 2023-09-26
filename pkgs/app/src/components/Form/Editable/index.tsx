import classNames from 'classnames';

import { useAuth } from '@/hooks/useAuth';
import { useEdit } from '@/hooks/useEdit';

import cls from './index.module.scss';

import type React from 'react';

export const Editable: React.FC<{
  inline?: true;
  padded?: true;
  children?: React.ReactNode;
}> = ({ children, inline, padded }) => {
  const edit = useEdit();
  const { currentPerm } = useAuth();
  if (currentPerm?.role === 'viewer') {
    return <>{children}</>;
  }

  return (
    <div
      className={classNames(
        cls.editable,
        inline && cls.inline,
        padded && cls.padded
      )}
      onClick={() => {
        if (!edit.isEditing) {
          edit.enable(true);
        }
      }}
    >
      {children}
    </div>
  );
};
