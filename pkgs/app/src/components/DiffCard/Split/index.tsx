import { IconFold } from '@tabler/icons-react';
import { Button } from 'antd';
import type { BlockLevelZero, BlockWithDiff } from 'api/src/types/api';
import classnames from 'classnames';
import { useMemo, useState } from 'react';

import type { ComputedForDiff } from '../../../common/store';
import { ContentBlock } from '../../Content';
import type { Payload } from '../../Content/helpers';

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
                  {diff.key in LABEL_MAP ? LABEL_MAP[diff.key] : diff.key}
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
              {diff.key in LABEL_MAP ? LABEL_MAP[diff.key] : diff.key}
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

const Unchanged: React.FC<{ children: React.ReactElement[] }> = ({
  children,
}) => {
  // Actions
  const [hide, setHide] = useState<boolean>(false);
  const handleHideShow = () => {
    setHide(!hide);
  };

  return (
    <div className={cls.group}>
      {/* <div className={cls.unchanged}>
        <Button icon={<IconFold />} onClick={handleHideShow} size="small" />
        {children.length} unchanged elements
      </div> */}
      <div className={classnames(cls.accordion, hide && cls.hide)}>
        <div className={cls.unchangedContent}>{children}</div>
      </div>
    </div>
  );
};

export const SplitContent: React.FC<{ doc: BlockLevelZero; id: string }> = ({
  doc,
  id,
}) => {
  const [payload] = useState<Payload>(() => {
    return { displayed: [id] };
  });

  const grouped = useMemo(() => {
    const tmp: Array<{ unchanged: boolean; blocks: BlockWithDiff[] }> = [];
    let acc: BlockWithDiff[] = [];
    const showUnchanged = false;

    let i = 0;
    while (true) {
      const copy = doc.content[i] as BlockWithDiff;
      i++;

      // Unchanged
      if (copy?.diff?.unchanged && !showUnchanged) {
        acc.push(copy);
        continue;
      }

      // Dump accumulated diffs
      if (acc.length > 0) {
        tmp.push({ unchanged: true, blocks: acc });
        acc = [];
      }

      // Done
      if (i >= doc.content.length) {
        break;
      }

      tmp.push({ unchanged: false, blocks: [copy] });
    }
    return tmp;
  }, [doc]);

  return (
    <div className={cls.content}>
      {grouped.map(({ blocks, unchanged }, a) => {
        const comp = blocks.map((blk, i) => {
          return <ContentBlock block={blk} key={i} pl={payload} />;
        });
        if (unchanged) {
          return <Unchanged key={a}>{comp}</Unchanged>;
        }
        return <div key={a}>{comp}</div>;
      })}
    </div>
  );
};
