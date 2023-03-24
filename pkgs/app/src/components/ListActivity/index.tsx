import { Skeleton, Typography } from 'antd';
import type { ApiActivity } from 'api/src/types/api';
import type { Duration } from 'luxon';
import { DateTime } from 'luxon';
import { useEffect, useState } from 'react';

import { useListActivities } from '../../api/activities';

import { RowActivity } from './RowActivity';
import cls from './index.module.scss';

function diffToGroup(diff: Duration): string {
  const days = diff.as('days');
  if (days > -1) return 'Today';
  else if (days > -2) return 'Yesterday';
  else if (days > -7) return 'Last 7 days';
  else if (days > -28) return 'Last month';
  else return `Last ${diff.as('month')} month`;
}

export const ListActivity: React.FC<{
  orgId: string;
  projectId?: string;
}> = ({ orgId, projectId }) => {
  const [initLoading, setInitLoading] = useState(true);
  const [group, setGroup] = useState<Array<[string, ApiActivity[]]>>([]);
  const res = useListActivities({
    org_id: orgId,
    project_id: projectId,
  });

  useEffect(() => {
    if (!res.data?.data) {
      return;
    }

    setInitLoading(false);

    const grouped: Record<string, ApiActivity[]> = {};

    for (const act of res.data.data) {
      const diff = DateTime.fromISO(act.createdAt).diffNow();
      const name = diffToGroup(diff);
      if (!grouped[name]) {
        grouped[name] = [];
      }
      grouped[name].push(act);
    }
    setGroup(Object.entries(grouped));
  }, [res.data]);

  return (
    <div>
      {initLoading && (
        <div>
          <Skeleton paragraph={{ rows: 0 }} active />
          <Skeleton paragraph={{ rows: 0 }} active />
          <Skeleton paragraph={{ rows: 0 }} active />
        </div>
      )}
      <div className={cls.groups}>
        {group.map(([name, acts]) => {
          return (
            <div key={name}>
              <Typography.Title level={4}>{name}</Typography.Title>
              <div className={cls.list}>
                {acts.map((act) => {
                  return <RowActivity key={act.id} act={act} orgId={orgId} />;
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
