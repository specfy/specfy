import { IconX } from '@tabler/icons-react';
import classNames from 'classnames';

import cls from './index.module.scss';

export const Tag: React.FC<{
  children: React.ReactNode;
  className?: string;
  closable?: boolean;
  onClose?: () => void;
}> = ({ children, className, closable, onClose }) => {
  return (
    <div className={classNames(cls.tag, className, closable && cls.closable)}>
      {children}
      {closable && (
        <button onClick={onClose}>
          <IconX />
        </button>
      )}
    </div>
  );
};
