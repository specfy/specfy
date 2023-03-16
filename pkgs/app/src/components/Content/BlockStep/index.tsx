import { IconCaretDown, IconCaretRight } from '@tabler/icons-react';
import type { ApiDocument, BlockDocument, BlockStep } from 'api/src/types/api';
import classnames from 'classnames';
import { useEffect, useRef, useState } from 'react';

import { ContentBlockDocument } from '../BlockDocument';
import type { Payload } from '../helpers';
import { map } from '../helpers';

import cls from './index.module.scss';

export const ContentBlockStep: React.FC<{ block: BlockStep; pl: Payload }> = ({
  block,
  pl,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(true);
  const [title, setTitle] = useState(() => block.attrs.title);
  const [hasDocument] = useState(
    () =>
      block.content.length === 1 && block.content[0].type === 'blockDocument'
  );

  const handleKey: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.code !== 'Enter' && e.code !== 'Space') {
      return;
    }

    e.preventDefault();
    setOpen(!open);
  };

  useEffect(() => {
    if (!ref.current) {
      return;
    }
    if (ref.current.children.length <= 0) {
      return;
    }

    const tmp = (ref.current?.children[0] as HTMLElement).dataset.title;
    if (!tmp) {
      return;
    }

    setTitle(tmp);
  }, [ref]);

  const handleSubRender = (doc: ApiDocument) => {
    setTimeout(() => setTitle(doc.name), 1);
  };

  return (
    <div className={cls.block}>
      <div
        className={cls.header}
        onClick={() => setOpen(!open)}
        onKeyUpCapture={handleKey}
        tabIndex={0}
        role="group"
      >
        {open ? <IconCaretDown /> : <IconCaretRight />}
        {title}
      </div>
      <div className={classnames(cls.content, !open && cls.close)} ref={ref}>
        {hasDocument ? (
          <ContentBlockDocument
            block={block.content[0] as BlockDocument}
            pl={pl}
            onRender={handleSubRender}
          />
        ) : (
          map(block, pl)
        )}
      </div>
    </div>
  );
};
