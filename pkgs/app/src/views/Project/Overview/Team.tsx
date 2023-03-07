import { Avatar, Skeleton, Typography } from 'antd';
import type { ApiPerm, ReqListPerms } from 'api/src/types/api';
import { useEffect, useState } from 'react';

import { useListPermsProject } from '../../../api/perms';
import { AvatarAuto } from '../../../components/AvatarAuto';

import cls from './index.module.scss';

export const Team: React.FC<Required<ReqListPerms>> = (opts) => {
  const team = useListPermsProject(opts);
  const [owners, setOwners] = useState<ApiPerm[]>([]);
  const [reviewers, setReviewers] = useState<ApiPerm[]>([]);
  const [contributors, setContributors] = useState<ApiPerm[]>([]);
  const [viewers, setViewers] = useState<ApiPerm[]>([]);

  useEffect(() => {
    if (!team.data) return;

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
  }, [team.isLoading]);

  if (team.isLoading) {
    return (
      <Avatar.Group>
        <Skeleton.Avatar active />
        <Skeleton.Avatar active />
        <Skeleton.Avatar active />
      </Avatar.Group>
    );
  }

  if (!team.data || team.data.data.length <= 0) {
    return <Typography.Text type="secondary">Nothing to show.</Typography.Text>;
  }

  return (
    <div>
      <div className={cls.team}>
        <div>
          <div>Admin</div>
          <Avatar.Group>
            {owners.map((perm) => {
              return <AvatarAuto key={perm.id} name={perm.user.name} />;
            })}
          </Avatar.Group>
        </div>
        {reviewers.length > 0 && (
          <div>
            <div>Reviewers</div>
            <Avatar.Group>
              {reviewers.map((perm) => {
                return <AvatarAuto key={perm.id} name={perm.user.name} />;
              })}
            </Avatar.Group>
          </div>
        )}
        {contributors.length > 0 && (
          <div>
            <div>Contributors</div>
            <Avatar.Group>
              {contributors.map((perm) => {
                return <AvatarAuto key={perm.id} name={perm.user.name} />;
              })}
            </Avatar.Group>
          </div>
        )}
        {viewers.length > 0 && (
          <div>
            <div>Viewers</div>
            <Avatar.Group>
              {viewers.map((perm) => {
                return <AvatarAuto key={perm.id} name={perm.user.name} />;
              })}
            </Avatar.Group>
          </div>
        )}
      </div>
    </div>
  );
};
