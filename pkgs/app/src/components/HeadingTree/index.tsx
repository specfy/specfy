import type { BlockLevelOne } from '@specfy/models';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { slugify } from '../../common/string';

import cls from './index.module.scss';

interface Item {
  key: number;
  href: string;
  title: string;
}
export const HeadingTree: React.FC<{ blocks: BlockLevelOne[] }> = ({
  blocks,
}) => {
  const headings = useMemo<Item[]>(() => {
    const tmp = [];
    for (let index = 0; index < blocks.length; index++) {
      const blk = blocks[index];
      if (blk.type !== 'heading' || blk.attrs.level > 2) {
        continue;
      }
      if (!blk.content || blk.content.length === 0) {
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

  const onClick = (item: Item) => {
    const id = item.href.substring(1);
    const target = document.getElementById(id);
    if (!target) {
      return;
    }

    target.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => {
      // Should probably update state instead
      window.location.hash = id;
    }, 500);
  };

  return (
    <div className={cls.tree}>
      {headings.map((item) => {
        return (
          <Link
            to={item.href}
            key={item.key}
            className={cls.link}
            onClick={(e) => {
              e.preventDefault();
              onClick(item);
            }}
          >
            {item.title}
          </Link>
        );
      })}
    </div>
  );
};
