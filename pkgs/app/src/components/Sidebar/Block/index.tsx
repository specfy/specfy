import cls from './index.module.scss';

import type React from 'react';

export const SidebarBlock: React.FC<{
  title: string;
  children: React.ReactElement;
  actions?: React.ReactElement;
}> = ({ children, title, actions }) => {
  return (
    <div className={cls.block}>
      <div className={cls.header}>
        <div>{title}</div>
        <div>{actions}</div>
      </div>
      {children}
    </div>
  );
};
