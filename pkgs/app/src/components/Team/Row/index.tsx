import type { ApiPerm, ApiUser } from '@specfy/api/src/types/api';
import { IconCheck, IconPlus, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';

import { removePerm, updatePerm } from '../../../api';
import { isError } from '../../../api/helpers';
import { i18n } from '../../../common/i18n';
import { selectPerms } from '../../../common/perms';
import { AvatarAuto } from '../../../components/AvatarAuto';
import { useToast } from '../../../hooks/useToast';
import { Button } from '../../Form/Button';
import { SelectFull } from '../../Form/Select';
import { Loading } from '../../Loading';

import cls from './index.module.scss';

interface RowProps {
  params: { org_id: string; project_id?: string };
  user: ApiUser;
  me: string;
  fromSearch?: boolean;
  perm?: ApiPerm;
  canUpdate: boolean;
  onUpdated: () => void;
}

export const Row: React.FC<RowProps> = ({
  params,
  user,
  me,
  fromSearch,
  perm,
  canUpdate,
  onUpdated,
}) => {
  const toast = useToast();
  const [role, setRole] = useState(() => perm?.role || 'viewer');
  const [loading, setLoading] = useState<boolean>(false);

  const onUpdate = async (
    userId: string,
    action: 'add' | 'update',
    newRole: ApiPerm['role']
  ) => {
    setLoading(true);
    const res = await updatePerm({
      ...params,
      role: newRole,
      userId,
    });
    setLoading(false);
    if (isError(res)) {
      toast.add({ title: i18n.errorOccurred, status: 'error' });
      setRole(perm?.role || 'viewer');
      return;
    }

    toast.add({
      title: `User ${action === 'add' ? 'added' : 'updated'}`,
      status: 'success',
    });

    setTimeout(() => setLoading(false), 250);
    onUpdated();
  };

  const onRemove = async (userId: string) => {
    setLoading(true);

    await removePerm({
      ...params,
      userId,
    });
    toast.add({ title: 'User removed', status: 'success' });

    setTimeout(() => {
      setLoading(false);
    }, 250);
    onUpdated();
  };

  return (
    <div className={cls.line}>
      <div className={cls.left}>
        <AvatarAuto name={user.name} size="large" src={user.avatarUrl} />
        <div className={cls.info}>
          <div>{user.name}</div>
          <div className={cls.sub}>{user.email}</div>
        </div>
      </div>
      <div className={cls.right}>
        {perm && fromSearch && <IconCheck />}
        {loading && <Loading />}

        <SelectFull
          value={role}
          defaultValue="viewer"
          placeholder="Select a role"
          options={selectPerms}
          onValueChange={(v: any) => {
            setRole(v);
            if (perm) {
              onUpdate(user.id, 'update', v);
            }
          }}
          disabled={perm && user.id === me ? true : !canUpdate}
        />

        {canUpdate && perm && (
          <Button
            danger
            disabled={perm && user.id === me}
            onClick={() => onRemove(user.id)}
          >
            <IconTrash />
          </Button>
        )}

        {canUpdate && !perm && (
          <Button onClick={() => onUpdate(user.id, 'add', role)}>
            <IconPlus />
            Add
          </Button>
        )}
      </div>
    </div>
  );
};
