// import { IconFold } from '@tabler/icons-react';
// import { Button } from 'antd';
import { Typography } from 'antd';
import type { BlockLevelZero, BlockWithDiff } from 'api/src/types/api';
import classnames from 'classnames';
import { useMemo, useState } from 'react';

import type { Payload } from '../../../common/content';
import { ContentBlock } from '../../Content';

import cls from './content.module.scss';

const Unchanged: React.FC<{ children: React.ReactElement[] }> = ({
  children,
}) => {
  // Actions
  const [hide] = useState<boolean>(false);
  // const handleHideShow = () => {
  //   setHide(!hide);
  // };

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

export const UnifiedContent: React.FC<{ doc: BlockLevelZero; id: string }> = ({
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
    // eslint-disable-next-line no-constant-condition
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
