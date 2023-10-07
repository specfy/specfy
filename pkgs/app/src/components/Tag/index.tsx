import { IconX } from '@tabler/icons-react';
import classNames from 'classnames';

import cls from './index.module.scss';

export const Tag: React.FC<{
  children: React.ReactNode;
  className?: string;
  closable?: boolean;
  variant?: 'border' | 'default' | 'light' | 'reverse';
  size?: 'xs' | 's' | 'm';
  onClose?: () => void;
}> = ({
  children,
  className,
  closable,
  size = 'm',
  variant = 'default',
  onClose,
}) => {
  return (
    <div
      className={classNames(
        cls.tag,
        cls[variant],
        cls[size],
        closable && cls.closable,
        className
      )}
    >
      {children}
      {closable && (
        <button onClick={onClose}>
          <IconX />
        </button>
      )}
    </div>
  );
};
