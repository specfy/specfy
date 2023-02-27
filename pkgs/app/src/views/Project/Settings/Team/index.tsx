import { LoadingOutlined } from '@ant-design/icons';
import { IconCheck, IconPlus, IconTrash } from '@tabler/icons-react';
import { Typography, Button, Input, Select, App } from 'antd';
import type { ApiProject, ApiPerm, ApiUser } from 'api/src/types/api';
import { useState, useEffect, useMemo } from 'react';
import { useDebounce } from 'react-use';

import {
  removePerm,
  updatePerm,
  useListPermsProject,
} from '../../../../api/perms';
import { useListUser } from '../../../../api/users';
import { AvatarAuto } from '../../../../components/AvatarAuto';
import { Card } from '../../../../components/Card';
import { useAuth } from '../../../../hooks/useAuth';
import type { RouteProject } from '../../../../types/routes';

import cls from './index.module.scss';

interface RowProps {
  params: { org_id: string; project_id: string };
  user: ApiUser;
  me: string;
  fromSearch?: boolean;
  perm?: ApiPerm;
  onUpdated: () => void;
}

const Row: React.FC<RowProps> = ({
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
    setTimeout(() => setLoading(false), 250);
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
          disabled={perm && user.id === me}
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

export const SettingsTeam: React.FC<{
  proj: ApiProject;
  params: RouteProject;
}> = ({ proj, params }) => {
  const { user } = useAuth();

  const p = { org_id: proj.orgId, project_id: proj.id };
  const team = useListPermsProject(p);
  const [owners, setOwners] = useState<ApiPerm[]>([]);
  const [reviewers, setReviewers] = useState<ApiPerm[]>([]);
  const [contributors, setContributors] = useState<ApiPerm[]>([]);
  const [viewers, setViewers] = useState<ApiPerm[]>([]);
  const [searchDebounced, setSearchDebounced] = useState<string>();

  // --- Initial list
  useEffect(() => {
    if (!team.data) {
      return;
    }
    console.log('hello?');

    const tmp: Record<ApiPerm['role'], ApiPerm[]> = {
      reviewer: [],
      owner: [],
      contributor: [],
      viewer: [],
    };
    for (const perm of team.data.data) {
      tmp[perm.role].push(perm);
    }
    setOwners(tmp.owner);
    setReviewers(tmp.reviewer);
    setContributors(tmp.contributor);
    setViewers(tmp.viewer);
  }, [team.data]);

  // --- Search
  const [options, setOptions] = useState<ApiUser[]>([]);
  const [search, setSearch] = useState<string>();

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

    const tmp = res.data?.data || [];
    setOptions(tmp);
  }, [res.isLoading, searchDebounced]);

  // --- Actions
  const onUpdate = () => {
    console.log('e?');

    team.refetch();
  };

  return (
    <>
      <div className={cls.header}>
        <div>
          <Typography.Title level={2}>Team members</Typography.Title>
          <Typography.Text type="secondary">
            Invite or manage your project's members.
          </Typography.Text>
        </div>

        <Input
          placeholder="Search or add user..."
          className={cls.search}
          onChange={(e) => setSearch(e.target.value)}
        ></Input>
      </div>
      <Card>
        {!searchDebounced && (
          <div className={cls.lines}>
            <div>
              <Typography.Title level={5} className={cls.title}>
                Owners
              </Typography.Title>
              {owners.map((perm) => {
                return (
                  <Row
                    key={perm.id}
                    params={p}
                    user={perm.user}
                    perm={perm}
                    me={user!.id}
                    onUpdated={onUpdate}
                  />
                );
              })}
              {owners.length <= 0 && (
                <div className={cls.empty}>No match...</div>
              )}
            </div>

            <div>
              <Typography.Title level={5} className={cls.title}>
                Reviewers
              </Typography.Title>
              {reviewers.map((perm) => {
                return (
                  <Row
                    key={perm.id}
                    params={p}
                    user={perm.user}
                    perm={perm}
                    me={user!.id}
                    onUpdated={onUpdate}
                  />
                );
              })}
              {reviewers.length <= 0 && (
                <div className={cls.empty}>No match...</div>
              )}
            </div>

            <div>
              <Typography.Title level={5} className={cls.title}>
                Contributors
              </Typography.Title>
              {contributors.map((perm) => {
                return (
                  <Row
                    key={perm.id}
                    params={p}
                    user={perm.user}
                    perm={perm}
                    me={user!.id}
                    onUpdated={onUpdate}
                  />
                );
              })}
              {contributors.length <= 0 && (
                <div className={cls.empty}>No match...</div>
              )}
            </div>

            <div>
              <Typography.Title level={5} className={cls.title}>
                Viewers
              </Typography.Title>
              {viewers.map((perm) => {
                return (
                  <Row
                    key={perm.id}
                    params={p}
                    user={perm.user}
                    perm={perm}
                    me={user!.id}
                    onUpdated={onUpdate}
                  />
                );
              })}
              {viewers.length <= 0 && (
                <div className={cls.empty}>No match...</div>
              )}
            </div>
          </div>
        )}

        {searchDebounced && (
          <div>
            {options.map((u) => {
              const perm = team.data?.data.find((p) => p.user.id === u.id);
              return (
                <Row
                  key={u.id}
                  params={p}
                  user={u}
                  perm={perm}
                  me={user!.id}
                  fromSearch={true}
                  onUpdated={onUpdate}
                />
              );
            })}
          </div>
        )}
      </Card>
    </>
  );
};
