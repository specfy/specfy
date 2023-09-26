import classnames from 'classnames';
import { useMemo } from 'react';

import cls from '../index.module.scss';
import type { ComputedForDiff } from '@/types/blobs';

import type { Change } from 'diff';

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
