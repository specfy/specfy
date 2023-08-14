import type { ApiUser } from '@specfy/models';
import classnames from 'classnames';

import { AvatarAuto } from '../AvatarAuto';
import { Flex } from '../Flex';

import cls from './index.module.scss';

export const UserCard: React.FC<{
  user: ApiUser;
  size?: 'default' | 'small';
}> = ({ user, size }) => {
  return (
    <Flex gap="l" className={classnames(cls.userCard, size && cls[size])}>
      <AvatarAuto
        name={user.name}
        size={size}
        src={user.avatarUrl}
        colored={false}
      />
      {user.name}
    </Flex>
  );
};
