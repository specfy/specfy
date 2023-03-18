import { useMemo } from 'react';

import type { ComputedForDiff } from '../../../common/store';

import cls from './index.module.scss';

export const Split: React.FC<{
  diff: ComputedForDiff;
}> = ({ diff }) => {
  // Compute diff
  const left = useMemo(() => {
    return diff.diff
      .map((d, i) => {
        if (d.added) return null;
        if (d.removed)
          return (
            <span className={cls.removed} key={i}>
              {d.value}
            </span>
          );
        else return d.value;
      })
      .filter((e) => e);
  }, [diff]);

  const right = useMemo(() => {
    return diff.diff
      .map((d, i) => {
        if (d.removed) return null;
        if (d.added)
          return (
            <span className={cls.added} key={i}>
              {d.value}
            </span>
          );
        else return d.value;
      })
      .filter((e): e is string => !!e);
  }, [diff]);

  return (
    <div className={cls.split}>
      <div className={cls.left}>
        {!left.length ? (
          <span className={cls.empty}>Empty...</span>
        ) : (
          <>{left}</>
        )}
      </div>
      <div className={cls.right}>
        {!right.length && left.length > 0 && (
          <span className={cls.empty}>Deleted...</span>
        )}
        {!right.length && !left.length ? (
          <span className={cls.empty}>Empty...</span>
        ) : (
          <>{right}</>
        )}
      </div>
    </div>
  );
};
