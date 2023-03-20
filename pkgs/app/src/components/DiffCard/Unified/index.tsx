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
          <span className={cls.addedInline} key={i}>
            {d.value}
          </span>
        );
      }
      if (d.removed) {
        return (
          <span className={cls.removedInline} key={i}>
            {d.value}
          </span>
        );
      }

      return d.value;
    });
  }, [diff]);

  return <div className={classnames(cls.unified)}>{content}</div>;
};
