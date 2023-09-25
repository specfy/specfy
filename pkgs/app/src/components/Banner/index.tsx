import {
  IconCircleCheckFilled,
  IconExclamationCircle,
  IconInfoCircle,
  IconInfoHexagon,
  IconX,
} from '@tabler/icons-react';
import classnames from 'classnames';

import { Flex } from '../Flex';

import cls from './index.module.scss';

export const Banner: React.FC<{
  children: React.ReactNode;
  type?: 'error' | 'info' | 'success' | 'warning' | 'primary';
  size?: 's' | 'm';
  onClose?: () => void;
}> = ({ children, type = 'info', size = 'm', onClose }) => {
  return (
    <div className={classnames(cls.banner, cls[type], cls[size])}>
      <Flex gap="m" grow>
        <div className={cls.icon}>
          {type === 'success' && <IconCircleCheckFilled />}
          {type === 'warning' && <IconExclamationCircle />}
          {type === 'error' && <IconExclamationCircle />}
          {type === 'info' && <IconInfoCircle />}
          {type === 'primary' && <IconInfoHexagon />}
        </div>
        <div className={cls.content}>{children}</div>
      </Flex>
      {onClose && (
        <button onClick={onClose}>
          <IconX />
        </button>
      )}
    </div>
  );
};
