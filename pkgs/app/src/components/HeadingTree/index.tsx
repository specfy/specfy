import { Anchor } from 'antd';
import type { BlockLevelOne } from 'api/src/types/api';
import { useMemo } from 'react';

import { slugify } from '../../common/string';

import cls from './index.module.scss';

export const HeadingTree: React.FC<{ blocks: BlockLevelOne[] }> = ({
  blocks,
}) => {
  const headings = useMemo(() => {
    const tmp = [];
    for (let index = 0; index < blocks.length; index++) {
      const blk = blocks[index];
      if (blk.type !== 'heading' || blk.attrs.level > 1) {
        continue;
      }

      const text = blk.content.map((e) => e.text).join('');

      tmp.push({
        key: index,
        href: `#h-${slugify(text)}`,
        title: text,
      });
    }

    return tmp;
  }, [blocks]);

  return (
    <div className={cls.tree}>
      <Anchor items={headings} targetOffset={20} />
    </div>
  );
};
