import classnames from 'classnames';
import type { Change } from 'diff';
import { useMemo } from 'react';

import type { ComputedForDiff } from '../../../types/blobs';

import cls from './index.module.scss';

const LABEL_MAP: Record<string, string> = {
  content: 'Content',
  description: 'Description',
};

export const Split: React.FC<{
  diff: ComputedForDiff;
  created: boolean;
  hideLabel?: true;
}> = ({ diff, hideLabel, created }) => {
  // Compute diff
  const left = useMemo(() => {
    return (diff.diff as Change[])
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
    return (diff.diff as Change[])
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

  const key = diff.key as string;

  return (
    <div>
      <div
        className={classnames(
          cls.split,
          !hideLabel && cls.withLabel,
          created && cls.isCreated
        )}
      >
        <div className={cls.left}>
          {!created && (
            <>
              {!hideLabel && !created && (
                <div className={cls.label}>
                  {key in LABEL_MAP ? LABEL_MAP[key] : key}
                </div>
              )}
              {!left.length ? (
                <span className={cls.empty}>Empty...</span>
              ) : (
                <>{left}</>
              )}
            </>
          )}
        </div>
        <div className={cls.right}>
          {!hideLabel && created && (
            <div className={cls.label}>
              {key in LABEL_MAP ? LABEL_MAP[key] : key}
            </div>
          )}
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
    </div>
  );
};
