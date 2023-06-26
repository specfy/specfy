import {
  IconCircleCheckFilled,
  IconExclamationCircle,
  IconInfoCircle,
} from '@tabler/icons-react';
import classnames from 'classnames';

import cls from './index.module.scss';

export const Banner: React.FC<{
  children: React.ReactNode;
  type: 'error' | 'info' | 'success' | 'warning';
}> = ({ children, type }) => {
  return (
    <div className={classnames(cls.banner, cls[type])}>
      <div className={cls.icon}>
        {type === 'success' && <IconCircleCheckFilled />}
        {type === 'warning' && <IconExclamationCircle />}
        {type === 'error' && <IconExclamationCircle />}
        {type === 'info' && <IconInfoCircle />}
      </div>
      <div className={cls.content}>{children}</div>
    </div>
  );
};
