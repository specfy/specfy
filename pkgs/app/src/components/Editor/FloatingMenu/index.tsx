import {
  IconQuote,
  IconTextSize,
  IconList,
  IconSeparator,
} from '@tabler/icons-react';
import type { Editor } from '@tiptap/core';
import { FloatingMenu as FM } from '@tiptap/react';

import cls from './index.module.scss';

export const FloatingMenu: React.FC<{ editor: Editor }> = ({ editor }) => {
  return (
    <FM
      editor={editor}
      tippyOptions={{ duration: 250, offset: [0, -40] }}
      className={cls.menu}
    >
      <div
        className={cls.item}
        onClick={() => editor.chain().focus().setParagraph().run()} // TODO: make this work
      >
        <div className={cls.icon}>
          <IconTextSize size="1em" />
        </div>
        <div>Text</div>
      </div>
      <div
        className={cls.item}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <div className={cls.icon}>
          <IconList size="1em" />
        </div>
        <div>List</div>
      </div>
      <div
        className={cls.item}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <div className={cls.icon}>
          <IconQuote size="1em" />
        </div>
        <div>Quote</div>
      </div>
      <div
        className={cls.item}
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        <div className={cls.icon}>
          <IconSeparator size="1em" />
        </div>
        <div>Divider</div>
      </div>
    </FM>
  );
};
