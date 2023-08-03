import type { ApiPerm, ApiUser } from '@specfy/api/src/types/api';
import { IconSearch } from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import { useDebounce } from 'react-use';

import { useListPerms, useListUser } from '../../../../api';
import { Card } from '../../../../components/Card';
import { Empty } from '../../../../components/Empty';
import { Input } from '../../../../components/Form/Input';
import { Row } from '../../../../components/Team/Row';
import { useAuth } from '../../../../hooks/useAuth';
import type { RouteOrg } from '../../../../types/routes';

import cls from './list.module.scss';

export const SettingsTeamList: React.FC<{ params: RouteOrg }> = ({
  params,
}) => {
  const { user, currentPerm } = useAuth();
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
  const canUpdate = useMemo(() => {
    return currentPerm?.role === 'owner';
  }, [currentPerm]);
  const onUpdate = () => {
    void team.refetch();
  };

  return (
    <div>
      <div className={cls.header}>
        <Input
          before={<IconSearch />}
          seamless
          placeholder="Search..."
          className={cls.search}
          onChange={(e) => setSearch(e.target.value)}
          size="l"
        />
      </div>
      <Card>
        {!searchDebounced && (
          <div className={cls.lines}>
            <div>
              <h5 className={cls.title}>Owners</h5>
              {owners.map((perm) => {
                return (
                  <Row
                    key={perm.id}
                    params={p}
                    user={perm.user}
                    perm={perm}
                    me={user!.id}
                    canUpdate={canUpdate}
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
                <h5 className={cls.title}>Reviewers</h5>
                {reviewers.map((perm) => {
                  return (
                    <Row
                      key={perm.id}
                      params={p}
                      user={perm.user}
                      perm={perm}
                      me={user!.id}
                      canUpdate={canUpdate}
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
              <h5 className={cls.title}>Contributors</h5>
              {contributors.map((perm) => {
                return (
                  <Row
                    key={perm.id}
                    params={p}
                    user={perm.user}
                    perm={perm}
                    me={user!.id}
                    canUpdate={canUpdate}
                    onUpdated={onUpdate}
                  />
                );
              })}
              {contributors.length <= 0 && (
                <div className={cls.empty}>Nothing to show...</div>
              )}
            </div>

            <div>
              <h5 className={cls.title}>Viewers</h5>
              {viewers.map((perm) => {
                return (
                  <Row
                    key={perm.id}
                    params={p}
                    user={perm.user}
                    perm={perm}
                    me={user!.id}
                    canUpdate={canUpdate}
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
                  canUpdate={canUpdate}
                  onUpdated={onUpdate}
                />
              );
            })}
            {options.length <= 0 && <Empty search={search} />}
          </div>
        )}
      </Card>
    </div>
  );
};
