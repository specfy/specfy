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

export const UserCardAdd: React.FC<{
  onAdd: (id: string) => void;
  size?: 'default' | 'small';
}> = ({ onAdd, size }) => {
  return (
    <Space
      className={classnames(cls.userCard, cls.userCardAdd, size && cls[size])}
    >
      <div className={cls.avatarEmpty}></div>
      Add user...
    </Space>
  );
};
