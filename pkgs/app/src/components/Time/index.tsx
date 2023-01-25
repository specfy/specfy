import { Popover } from 'antd';
import { DateTime } from 'luxon';
import { useMemo } from 'react';

export const Time: React.FC<{ time: string }> = ({ time }) => {
  const dt = useMemo(() => {
    return DateTime.fromISO(time);
  }, [time]);

  return (
    <Popover content={dt.toLocaleString(DateTime.DATETIME_SHORT)}>
      Updated {dt.toRelative()}
    </Popover>
  );
};
