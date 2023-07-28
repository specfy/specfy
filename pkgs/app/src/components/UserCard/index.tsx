import type { ApiUser, ListUsers } from '@specfy/api/src/types/api';
import { AutoComplete, Space } from 'antd';
import type { DefaultOptionType } from 'antd/es/select';
import classnames from 'classnames';
import { useEffect, useState } from 'react';
import { useDebounce } from 'react-use';

import { useListUser } from '../../api';
import { AvatarAuto } from '../AvatarAuto';

import cls from './index.module.scss';

export const UserCard: React.FC<{
  user: ApiUser;
  size?: 'default' | 'small';
}> = ({ user, size }) => {
  return (
    <Space className={classnames(cls.userCard, size && cls[size])}>
      <AvatarAuto
        name={user.name}
        size={size}
        src={user.avatarUrl}
        colored={false}
      />
      {user.name}
    </Space>
  );
};

export const UserCardAdd: React.FC<{
  params: ListUsers['Querystring'];
  onAdd: (user: ApiUser) => void;
  size?: 'default' | 'small';
  excludeIds?: string[];
}> = ({ onAdd, params, size, excludeIds }) => {
  const [options, setOptions] = useState<DefaultOptionType[]>([]);
  const [search, setSearch] = useState<string>();
  const [searchDebounced, setSearchDebounced] = useState<string>();
  const [list, setList] = useState<ListUsers['Success']['data']>();

  const res = useListUser({ ...params, search: searchDebounced });
  useDebounce(
    () => {
      setSearchDebounced(search);
    },
    250,
    [search]
  );

  useEffect(() => {
    if (!res || !search) {
      setOptions([]);
      return;
    }
    if (res.isLoading) {
      return;
    }

    setList(res.data?.data);
  }, [res.isLoading, searchDebounced]);

  useEffect(() => {
    if (!list) {
      return;
    }

    let tmp =
      list.map((user) => {
        return { label: user.name, value: user.id };
      }) || [];
    if (excludeIds) {
      tmp = tmp.filter((user) => !excludeIds.includes(user.value));
    }
    setOptions(tmp);
  }, [list]);

  const onSelect = (id: string) => {
    onAdd(list!.find((user) => user.id === id)!);
    setSearch('');
    setOptions([]);
  };

  return (
    <Space
      className={classnames(cls.userCard, cls.userCardAdd, size && cls[size])}
    >
      <div className={cls.avatarEmpty}></div>
      <AutoComplete
        placeholder="Add user..."
        allowClear
        size="small"
        value={search}
        options={options}
        onSearch={setSearch}
        onSelect={onSelect}
        className={cls.search}
      />
    </Space>
  );
};
