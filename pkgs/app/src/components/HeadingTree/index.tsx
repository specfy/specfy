import { MenuUnfoldOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useState } from 'react';
import { useMount } from 'react-use';

import type { BlockHeading, BlockLevelOne } from '../../types/content';

import cls from './index.module.scss';

export const HeadingTree: React.FC<{ blocks: BlockLevelOne[] }> = ({
  blocks,
}) => {
  const [headings, setHeadings] = useState<BlockHeading[]>([]);
  useMount(() => {
    const tmp = [];
    for (const blk of blocks) {
      if (blk.type !== 'heading') continue;
      tmp.push(blk);
    }
    setHeadings(tmp);
  });

  return (
    <div>
      <Button icon={<MenuUnfoldOutlined />}></Button>
      {headings.map((heading) => {
        return (
          <div key={heading.content} className={cls[`lvl-${heading.level}`]}>
            {heading.content}
          </div>
        );
      })}
    </div>
  );
};
