import classnames from 'classnames';
import type { Change } from 'diff';
import { useMemo } from 'react';

import type { ComputedForDiff } from '../../../../types/blobs';
import cls from '../index.module.scss';

export const UnifiedDiff: React.FC<{
  diff: ComputedForDiff;
}> = ({ diff }) => {
  // Compute diff
  const content = useMemo(() => {
    return (diff.diff as Change[]).map((d, i) => {
      if (d.added) {
        return (
          <span className={classnames(cls.added, cls.inline)} key={i}>
            {d.value}
          </span>
        );
      }
      if (d.removed) {
        return (
          <span className={classnames(cls.removed, cls.inline)} key={i}>
            {d.value}
          </span>
        );
      }

      return d.value;
    });
  }, [diff]);

  return <div>{content}</div>;
};
