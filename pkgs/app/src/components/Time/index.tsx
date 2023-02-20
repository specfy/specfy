import { Tooltip } from 'antd';
import { DateTime } from 'luxon';
import { useMemo } from 'react';

export const Time: React.FC<{ time: string }> = ({ time }) => {
  const dt = useMemo(() => {
    return DateTime.fromISO(time);
  }, [time]);

  return (
    <Tooltip
      title={dt.toLocaleString(DateTime.DATETIME_SHORT)}
      placement="bottom"
    >
      {dt.toRelative()}
    </Tooltip>
  );
};
