import { DateTime } from 'luxon';
import { useMemo } from 'react';

import { TooltipFull } from '../Tooltip';

export const Time: React.FC<{ time: string }> = ({ time }) => {
  const dt = useMemo(() => {
    return DateTime.fromISO(time);
  }, [time]);

  return (
    <TooltipFull msg={dt.toLocaleString(DateTime.DATETIME_SHORT)} side="bottom">
      {dt.toRelative({
        style: 'narrow',
      })}
    </TooltipFull>
  );
};
