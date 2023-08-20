import type { ApiUser } from '@specfy/models';
import classnames from 'classnames';

import { AvatarAuto } from '../AvatarAuto';
import { Flex } from '../Flex';

import cls from './index.module.scss';

export const UserCard: React.FC<{
  user: ApiUser;
  size?: 'd' | 's';
}> = ({ user, size }) => {
  return (
    <Flex gap="l" className={classnames(cls.userCard, size && cls[size])}>
      <AvatarAuto user={user} size={size} />
      {user.name}
    </Flex>
  );
};
