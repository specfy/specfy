import { IconX } from '@tabler/icons-react';
import { Button, Typography } from 'antd';
import type { ApiUser, ListUsers } from 'api/src/types/api';
import { useEffect, useMemo, useState } from 'react';

import { UserCard, UserCardAdd } from '../UserCard';

import cls from './index.module.scss';

export const UserList: React.FC<{
  list: ApiUser[];
  edit?: boolean;
  params?: ListUsers['Querystring'];
  exclude?: ApiUser[];
  onChange?: (list: ApiUser[]) => void;
}> = ({ list, edit, params, exclude, onChange }) => {
  const [copy, setCopy] = useState(() => [...list]);
  const excludeIds = useMemo<string[]>(() => {
    return [
      ...copy.map((user) => user.id),
      ...(exclude?.map((user) => user.id) || []),
    ];
  }, [exclude, copy]);

  const onAdd = (val: ApiUser) => {
    if (list.find((user) => user.id === val.id)) {
      return;
    }

    setCopy([...copy, { ...val }]);
  };
  const onRemove = (userId: string) => {
    setCopy(copy.filter((user) => user.id !== userId));
  };

  useEffect(() => {
    if (onChange) {
      onChange(copy);
    }
  }, [copy]);

  return (
    <ul className={cls.list}>
      {list.map((user) => {
        return (
          <li key={user.id} className={cls.user}>
            <UserCard user={user} />
            {edit && (
              <Button
                className={cls.remove}
                type="text"
                onClick={() => onRemove(user.id)}
                icon={<IconX size={16} />}
              />
            )}
          </li>
        );
      })}
      {list.length <= 0 && (
        <Typography.Text type="secondary">No one assigned</Typography.Text>
      )}
      {edit && params && (
        <UserCardAdd params={params} onAdd={onAdd} excludeIds={excludeIds} />
      )}
    </ul>
  );
};
