import { Typography } from 'antd';
import type { BlockLevelZero, Blocks } from 'api/src/types/api';
import classnames from 'classnames';
import { useMemo, useState } from 'react';

import type { Payload } from '../../../common/content';
import { ContentBlock } from '../../Content';

import cls from './content.module.scss';

const Unchanged: React.FC<{ children: React.ReactElement[] }> = ({
  children,
}) => {
  return (
    <div className={cls.group}>
      <div className={classnames(cls.accordion)}>
        <div className={cls.unchangedContent}>{children}</div>
      </div>
    </div>
  );
};

export const UnifiedContent: React.FC<{ doc: BlockLevelZero; id: string }> = ({
  doc,
  id,
}) => {
  const [payload] = useState<Payload>(() => {
    return { displayed: [id] };
  });

  const grouped = useMemo(() => {
    const tmp: Array<{ unchanged: boolean; blocks: Blocks[] }> = [];
    let acc: Blocks[] = [];
    const showUnchanged = false;
    const group = true;

    if (!group) {
      return [{ unchanged: false, blocks: doc.content }];
    }

    let i = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const copy = doc.content[i];
      i++;

      // Done
      if (copy) {
        const diffMark = copy.marks?.find((mark) => mark.type === 'diffMark');

        // Unchanged
        if (diffMark && diffMark.attrs.type !== 'unchanged' && !showUnchanged) {
          acc.push(copy);
          continue;
        }
      }

      // Dump accumulated diffs
      if (acc.length > 0) {
        tmp.push({ unchanged: true, blocks: acc });
        acc = [];
      }

      if (copy) {
        tmp.push({ unchanged: false, blocks: [copy] });
      } else {
        // Break after a full iteration to empty the acc
        break;
      }
    }

    return tmp;
  }, [doc]);

  return (
    <Typography>
      {grouped.map(({ blocks, unchanged }, a) => {
        const comp = blocks.map((blk, i) => {
          return <ContentBlock block={blk} key={i} pl={payload} />;
        });
        if (unchanged) {
          return <Unchanged key={a}>{comp}</Unchanged>;
        }
        return <div key={a}>{comp}</div>;
      })}
    </Typography>
  );
};
