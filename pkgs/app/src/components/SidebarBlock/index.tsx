import { Typography } from 'antd';
import type { ApiUser } from 'api/src/types/api';
import type React from 'react';

import { UserCard } from '../UserCard';

import cls from './index.module.scss';

export const SidebarBlock: React.FC<{
  title: string;
  children: React.ReactElement;
  actions?: React.ReactElement;
}> = ({ children, title, actions }) => {
  return (
    <div className={cls.block}>
      <div className={cls.header}>
        <div className={cls.label}>{title}</div>
        <div className={cls.actions}>{actions}</div>
      </div>
      {children}
    </div>
  );
};

export const SidebarUserList: React.FC<{ list: ApiUser[] }> = ({ list }) => {
  return (
    <ul className={cls.list}>
      {list.map((user) => {
        return (
          <li key={user.id}>
            <UserCard name={user.name} size="small" />
          </li>
        );
      })}
      {list.length <= 0 && (
        <Typography.Text type="secondary">No one assigned</Typography.Text>
      )}
    </ul>
  );
};
