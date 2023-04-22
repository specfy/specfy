import { LoadingOutlined } from '@ant-design/icons';
import { IconCheck, IconPlus, IconTrash } from '@tabler/icons-react';
import { App, Button, Select } from 'antd';
import type { ApiPerm, ApiUser } from 'api/src/types/api';
import { useState } from 'react';

import { removePerm, updatePerm } from '../../../api';
import { AvatarAuto } from '../../../components/AvatarAuto';

import cls from './index.module.scss';

interface RowProps {
  params: { org_id: string; project_id?: string };
  user: ApiUser;
  me: string;
  fromSearch?: boolean;
  perm?: ApiPerm;
  onUpdated: () => void;
}

export const Row: React.FC<RowProps> = ({
  params,
  user,
  me,
  fromSearch,
  perm,
  onUpdated,
}) => {
  const { message } = App.useApp();
  const [role, setRole] = useState(() => perm?.role || 'viewer');
  const [loading, setLoading] = useState<boolean>(false);

  const onUpdate = async (
    userId: string,
    action: 'add' | 'update',
    newRole: ApiPerm['role']
  ) => {
    setLoading(true);
    await updatePerm({
      ...params,
      role: newRole,
      userId,
    });
    message.success(`User ${action === 'add' ? 'added' : 'updated'}`);

    setTimeout(() => setLoading(false), 250);
    onUpdated();
  };

  const onRemove = async (userId: string) => {
    setLoading(true);

    await removePerm({
      ...params,
      userId,
    });
    message.success('User removed');

    setTimeout(() => {
      setLoading(false);
    }, 250);
    onUpdated();
  };

  return (
    <div className={cls.line}>
      <div className={cls.left}>
        <AvatarAuto name={user.name} size="large" />
        <div className={cls.info}>
          <div>{user.name}</div>
          <div className={cls.sub}>{user.email}</div>
        </div>
      </div>
      <div className={cls.right}>
        {perm && fromSearch && <IconCheck />}
        {loading && <LoadingOutlined />}
        <Select
          value={role}
          style={{ width: '125px' }}
          onChange={(v) => {
            setRole(v);
            if (perm) {
              onUpdate(user.id, 'update', v);
            }
          }}
          disabled={perm && user.id === me ? true : false}
        >
          <Select.Option key="owner">Owner</Select.Option>
          <Select.Option key="reviewer">Reviewer</Select.Option>
          <Select.Option key="contributor">Contributor</Select.Option>
          <Select.Option key="viewer">Viewer</Select.Option>
        </Select>
        {perm ? (
          <Button
            type="default"
            danger
            icon={<IconTrash />}
            disabled={perm && user.id === me}
            onClick={() => onRemove(user.id)}
          ></Button>
        ) : (
          <Button
            type="default"
            icon={<IconPlus />}
            onClick={() => onUpdate(user.id, 'add', role)}
          >
            Add
          </Button>
        )}
      </div>
    </div>
  );
};
