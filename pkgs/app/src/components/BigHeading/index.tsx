import { Space, Typography } from 'antd';

import { AvatarAuto } from '../AvatarAuto';

import cls from './index.module.scss';

export const BigHeading: React.FC<{
  title: string;
  avatar?: React.ReactNode;
  children?: React.ReactNode;
}> = ({ title, avatar, children }) => {
  return (
    <Space>
      {avatar ? (
        <div className={cls.avatarCustom}>{avatar} </div>
      ) : (
        <AvatarAuto name={title} size="large" className={cls.avatar} />
      )}
      <div>
        <Typography.Title level={2} className={cls.title}>
          {title}
        </Typography.Title>
        <Space>
          <div className={cls.subtitle}>{children}</div>
        </Space>
      </div>
    </Space>
  );
};
