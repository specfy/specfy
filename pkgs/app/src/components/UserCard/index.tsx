import { Space } from 'antd';
import classnames from 'classnames';

import { AvatarAuto } from '../AvatarAuto';

import cls from './index.module.scss';

export const UserCard: React.FC<{
  name: string;
  size?: 'default' | 'small';
}> = ({ name, size }) => {
  return (
    <Space className={classnames(cls.userCard, size && cls[size])}>
      <AvatarAuto name={name} size={size} />
      {name}
    </Space>
  );
};
