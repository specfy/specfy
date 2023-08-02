import type { ApiUser } from '@specfy/api/src/types/api';

import { Subdued } from '../Text';
import { UserCard } from '../UserCard';

import cls from './index.module.scss';

export const UserList: React.FC<{
  list: ApiUser[];
}> = ({ list }) => {
  return (
    <ul className={cls.list}>
      {list.map((user) => {
        return (
          <li key={user.id} className={cls.user}>
            <UserCard user={user} />
          </li>
        );
      })}
      {list.length <= 0 && <Subdued>No one assigned</Subdued>}
    </ul>
  );
};
