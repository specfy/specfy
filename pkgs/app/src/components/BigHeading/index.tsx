import { Breadcrumb, Skeleton, Space, Typography } from 'antd';
import { Link } from 'react-router-dom';

import { AvatarAuto } from '../AvatarAuto';

import cls from './index.module.scss';

export const BigHeading: React.FC<{
  parent?: string;
  parentLink?: string;
  title: string;
  link: string;
  avatar?: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
}> = ({ title, avatar, actions, subtitle, link, parent, parentLink }) => {
  return (
    <div>
      <div className={cls.header}>
        <Space size={'middle'}>
          {avatar ? (
            <div className={cls.avatarCustom}>{avatar} </div>
          ) : (
            <AvatarAuto name={title} size="large" className={cls.avatar} />
          )}
          <div>
            <Typography.Title level={2} className={cls.title}>
              {parent && (
                <>
                  <Link to={parentLink!}>{parent}</Link>
                  <span className={cls.parentSlash}>/</span>
                </>
              )}
              <Link to={link}>{title}</Link>
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
