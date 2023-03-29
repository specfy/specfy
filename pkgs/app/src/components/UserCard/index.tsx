import { AutoComplete, Space } from 'antd';
import type { DefaultOptionType } from 'antd/es/select';
import type { ApiUser, ReqListUsers } from 'api/src/types/api';
import classnames from 'classnames';
import { useEffect, useState } from 'react';
import { useDebounce } from 'react-use';

import { useListUser } from '../../api/users';
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
  params: ReqListUsers;
  onAdd: (user: ApiUser) => void;
  size?: 'default' | 'small';
  excludeIds?: string[];
}> = ({ onAdd, params, size, excludeIds }) => {
  const [options, setOptions] = useState<DefaultOptionType[]>([]);
  const [search, setSearch] = useState<string>();
  const [searchDebounced, setSearchDebounced] = useState<string>();

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

    let tmp =
      res.data?.data.map((user) => {
        return { label: user.name, value: user.id };
      }) || [];
    if (excludeIds) {
      tmp = tmp.filter((user) => !excludeIds.includes(user.value));
    }
    setOptions(tmp);
  }, [res.isLoading, searchDebounced]);

  const onSelect = (id: string) => {
    onAdd(res.data!.data.find((user) => user.id === id)!);
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
