import classnames from 'classnames';
import { useMemo } from 'react';

import type { ComputedForDiff } from '../../../common/store';
import cls from '../index.module.scss';

export const UnifiedDiff: React.FC<{
  diff: ComputedForDiff;
}> = ({ diff }) => {
  // Compute diff
  const content = useMemo(() => {
    return diff.diff.map((d, i) => {
      if (d.added) {
        return (
          <span className={classnames(cls.added, cls.i)} key={i}>
            {d.value}
          </span>
        );
      }
      if (d.removed) {
        return (
          <span className={classnames(cls.removed, cls.i)} key={i}>
            {d.value}
          </span>
        );
      }

      return d.value;
    });
  }, [diff]);

  return <div>{content}</div>;
};
