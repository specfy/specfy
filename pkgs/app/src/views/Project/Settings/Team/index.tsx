import type { ApiProject, ApiPerm, ApiUser } from '@specfy/models';
import { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useDebounce } from 'react-use';

import { useListPermsProject, useListUser } from '../../../../api';
import { titleSuffix } from '../../../../common/string';
import { Banner } from '../../../../components/Banner';
import { Card } from '../../../../components/Card';
import { Empty } from '../../../../components/Empty';
import { Input } from '../../../../components/Form/Input';
import { Row } from '../../../../components/Team/Row';
import { Subdued } from '../../../../components/Text';
import { useAuth } from '../../../../hooks/useAuth';

import cls from './index.module.scss';

export const SettingsTeam: React.FC<{
  proj: ApiProject;
}> = ({ proj }) => {
  const { user, currentPerm } = useAuth();

  const p = { org_id: proj.orgId, project_id: proj.id };
  const team = useListPermsProject(p);
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

  const res = useListUser({ org_id: proj.orgId, search: searchDebounced });
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
    <>
      <Helmet title={`Team - ${proj.name} ${titleSuffix}`} />
      <div className={cls.header}>
        <div>
          <h2>Team members</h2>
          <Subdued className={cls.empty}>
            Invite or manage your project&apos;s members.
          </Subdued>
        </div>

        <Input
          placeholder="Search or add user..."
          className={cls.search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {!canUpdate && (
        <Banner>Only the owner can invite new people to the team</Banner>
      )}
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
                <Subdued className={cls.empty}>Nothing to show...</Subdued>
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
                  <Subdued className={cls.empty}>Nothing to show...</Subdued>
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
                <Subdued className={cls.empty}>Nothing to show...</Subdued>
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
                <Subdued className={cls.empty}>Nothing to show...</Subdued>
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
    </>
  );
};
