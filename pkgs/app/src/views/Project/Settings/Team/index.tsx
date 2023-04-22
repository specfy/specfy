import { Typography, Input } from 'antd';
import type { ApiProject, ApiPerm, ApiUser } from 'api/src/types/api';
import { useState, useEffect } from 'react';
import { useDebounce } from 'react-use';

import { useListPermsProject, useListUser } from '../../../../api';
import { Card } from '../../../../components/Card';
import { Row } from '../../../../components/Team/Row';
import { useAuth } from '../../../../hooks/useAuth';

import cls from './index.module.scss';

export const SettingsTeam: React.FC<{
  proj: ApiProject;
}> = ({ proj }) => {
  const { user } = useAuth();

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
    <>
      <div className={cls.header}>
        <div>
          <Typography.Title level={2}>Team members</Typography.Title>
          <Typography.Text type="secondary">
            Invite or manage your project&apos;s members.
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
                <div className={cls.empty}>Nothing to show...</div>
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
          </div>
        )}
      </Card>
    </>
  );
};
