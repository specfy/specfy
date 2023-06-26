import type { ReactNode } from 'react';

import cls from './index.module.scss';
export const ActivityCard: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  return <div className={cls.card}>{children}</div>;
};
