import { Breadcrumb, Skeleton, Space, Typography } from 'antd';
import { Link } from 'react-router-dom';

import { AvatarAuto } from '../AvatarAuto';

import cls from './index.module.scss';

export const BigHeading: React.FC<{
  title: string;
  avatar?: React.ReactNode;
  breadcrumb?: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
}> = ({ title, avatar, actions, breadcrumb, subtitle }) => {
  return (
    <div>
      <Breadcrumb style={{ margin: '0 0 4px 4px' }}>
        <Breadcrumb.Item>
          <Link to="/">Home</Link>
        </Breadcrumb.Item>
        {breadcrumb}
      </Breadcrumb>

      <div className={cls.header}>
        <Space size={'middle'}>
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
              <div className={cls.subtitle}>{subtitle}</div>
            </Space>
          </div>
        </Space>
        <div className={cls.actions}>{actions}</div>
      </div>
    </div>
  );
};

export const BigHeadingLoading: React.FC = () => {
  return (
    <div className={cls.header}>
      <Space size={'middle'}>
        <Skeleton.Avatar active className={cls.skeletonAvatar} />
        <Skeleton active paragraph={false} className={cls.skeletonTitle} />
      </Space>
    </div>
  );
};
