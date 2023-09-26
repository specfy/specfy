import { DateTime } from 'luxon';
import { useEffect, useState } from 'react';
import Skeleton from 'react-loading-skeleton';

import type { ApiActivity, ApiActivityGrouped } from '@specfy/models';

import { Flex } from '../Flex';
import { useListActivities } from '@/api';
import { useAuth } from '@/hooks/useAuth';

import { RowActivity } from './RowActivity';
import cls from './index.module.scss';

import type { Duration } from 'luxon';

function diffToGroup(diff: Duration): string {
  const days = diff.as('days');
  if (days > -1) return 'Today';
  else if (days > -2) return 'Yesterday';
  else if (days > -7) return 'Last 7 days';
  else if (days > -29) return 'Last month';
  else return `More than one month ago`;
}

export const ListActivity: React.FC<{
  orgId: string;
  projectId?: string;
  revisionId?: string;
}> = ({ orgId, projectId, revisionId }) => {
  const { user } = useAuth();
  const [byPeriod, setByPeriod] = useState<Array<[string, ApiActivity[]]>>([]);
  const res = useListActivities({
    org_id: orgId,
    project_id: projectId,
    revision_id: revisionId,
  });

  useEffect(() => {
    if (!res.data?.data) {
      return;
    }

    // Group by groupId
    const groups: ApiActivityGrouped[] = [];
    let acc: ApiActivity[] = [];
    for (let index = 0; index < res.data.data.length; index++) {
      const act = res.data.data[index];

      if (!act.activityGroupId) {
        groups.push(act);
        continue;
      }

      // Last item or next one is another group
      if (
        res.data.data[index + 1] === undefined ||
        res.data.data[index + 1].activityGroupId !== act.activityGroupId
      ) {
        const copy: ApiActivityGrouped = { ...act, childrens: [...acc] };
        groups.push(copy);
        acc = [];
      } else {
        acc.push(act);
      }
    }

    // Group by period
    const period: Record<string, ApiActivity[]> = {};
    for (const act of groups) {
      const diff = DateTime.fromISO(act.createdAt).diffNow();
      const name = diffToGroup(diff);
      if (!period[name]) {
        period[name] = [];
      }
      period[name].push(act);
    }

    setByPeriod(Object.entries(period));
  }, [res.data]);

  if (res.isLoading) {
    return (
      <Flex gap="l" column align="flex-start">
        {[1, 2, 3].map((i) => {
          return (
            <Flex key={i} gap="l">
              <Skeleton circle height={20} width={20} />
              <Skeleton height={20} width={150} />
            </Flex>
          );
        })}
      </Flex>
    );
  }

  return (
    <div>
      <div className={cls.groups}>
        {byPeriod.map(([name, acts]) => {
          return (
            <div key={name}>
              {name !== 'Today' && <h5>{name}</h5>}
              <div className={cls.list}>
                {acts.map((act) => {
                  return (
                    <RowActivity
                      key={act.id}
                      me={user!.id}
                      act={act}
                      ctx={{ orgId, projectId, revisionId }}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
