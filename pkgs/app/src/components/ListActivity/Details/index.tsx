import cls from './index.module.scss';

import type { ReactNode } from 'react';

export const ActivityCard: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  return <div className={cls.card}>{children}</div>;
};
