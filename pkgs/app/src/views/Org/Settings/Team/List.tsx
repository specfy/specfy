import type { ApiPerm, ApiUser } from '@specfy/api/src/types/api';
import { IconSearch } from '@tabler/icons-react';
import { Input, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useDebounce } from 'react-use';

import { useListPerms, useListUser } from '../../../../api';
import { Card } from '../../../../components/Card';
import { Empty } from '../../../../components/Empty';
import { Row } from '../../../../components/Team/Row';
import { useAuth } from '../../../../hooks/useAuth';
import type { RouteOrg } from '../../../../types/routes';

import cls from './list.module.scss';

export const SettingsTeamList: React.FC<{ params: RouteOrg }> = ({
  params,
}) => {
  const { user } = useAuth();
  const p = { org_id: params.org_id };

  const team = useListPerms(p);
  const [owners, setOwners] = useState<ApiPerm[]>([]);
  const [reviewers, setReviewers] = useState<ApiPerm[]>([]);
  const [contributors, setContributors] = useState<ApiPerm[]>([]);
  const [viewers, setViewers] = useState<ApiPerm[]>([]);

  // --- Initial list
  useEffect(() => {
    if (!team.data) {
      return;
    }

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
  const [searchDebounced, setSearchDebounced] = useState<string>();

  const res = useListUser({ ...p, search: searchDebounced });
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
    team.refetch();
  };

  return (
    <div>
      <div className={cls.header}>
        <Input
          prefix={<IconSearch />}
          placeholder="Search..."
          className={cls.search}
          onChange={(e) => setSearch(e.target.value)}
          size="large"
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
                <div className={cls.empty}>Nothing to show...</div>
              )}
            </div>

            {false && (
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
                  <div className={cls.empty}>Nothing to show...</div>
                )}
              </div>
            )}

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
                <div className={cls.empty}>Nothing to show...</div>
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
                <div className={cls.empty}>Nothing to show...</div>
              )}
            </div>
          </div>
        )}

        {searchDebounced && (
          <div>
            {options.map((u) => {
              const perm = team.data?.data.find((i) => i.user.id === u.id);
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
            {options.length <= 0 && <Empty search={search!} />}
          </div>
        )}
      </Card>
    </div>
  );
};
