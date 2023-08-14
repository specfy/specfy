import type { ApiPerm, ListPerms } from '@specfy/models';
import { useEffect, useState } from 'react';
import Skeleton from 'react-loading-skeleton';

import { useListPermsProject } from '../../../api';
import { AvatarAuto, AvatarGroup } from '../../../components/AvatarAuto';
import { Flex } from '../../../components/Flex';

import cls from './index.module.scss';

export const TeamSummary: React.FC<Required<ListPerms['Querystring']>> = (
  opts
) => {
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
      <AvatarGroup>
        <Skeleton circle width={30} height={30} />
        <Skeleton circle width={30} height={30} />
        <Skeleton circle width={30} height={30} />
      </AvatarGroup>
    );
  }

  return (
    <div>
      <div className={cls.team}>
        <Flex column align="flex-start" className={cls.block}>
          <div className={cls.label}>Admin</div>
          <AvatarGroup>
            {owners.map((perm) => {
              return (
                <AvatarAuto
                  key={perm.id}
                  name={perm.user.name}
                  src={perm.user.avatarUrl}
                  colored={false}
                />
              );
            })}
          </AvatarGroup>
        </Flex>
        {false && reviewers.length > 0 && (
          <Flex column align="flex-start" className={cls.block}>
            <div className={cls.label}>Reviewers</div>
            <AvatarGroup>
              {reviewers.map((perm) => {
                return (
                  <AvatarAuto
                    key={perm.id}
                    name={perm.user.name}
                    src={perm.user.avatarUrl}
                    colored={false}
                  />
                );
              })}
            </AvatarGroup>
          </Flex>
        )}
        {contributors.length > 0 && (
          <Flex column align="flex-start" className={cls.block}>
            <div className={cls.label}>Contributors</div>
            <AvatarGroup>
              {contributors.map((perm) => {
                return (
                  <AvatarAuto
                    key={perm.id}
                    name={perm.user.name}
                    src={perm.user.avatarUrl}
                    colored={false}
                  />
                );
              })}
            </AvatarGroup>
          </Flex>
        )}
        {viewers.length > 0 && (
          <Flex column align="flex-start" className={cls.block}>
            <div className={cls.label}>Viewers</div>
            <AvatarGroup>
              {viewers.map((perm) => {
                return (
                  <AvatarAuto
                    key={perm.id}
                    name={perm.user.name}
                    src={perm.user.avatarUrl}
                    colored={false}
                  />
                );
              })}
            </AvatarGroup>
          </Flex>
        )}
      </div>
    </div>
  );
};
