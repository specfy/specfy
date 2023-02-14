import { IconBold, IconItalic, IconLink } from '@tabler/icons-react';
import type { Editor } from '@tiptap/core';
import { BubbleMenu as BM } from '@tiptap/react';
import { useCallback } from 'react';

import cls from './index.module.scss';

export const BubbleMenu: React.FC<{ editor: Editor }> = ({ editor }) => {
  const setLink = useCallback(() => {
    if (!editor || editor.isDestroyed) return;

    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();

      return;
    }

    // update link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  return (
    <BM
      editor={editor}
      tippyOptions={{ duration: 100, arrow: true, placement: 'bottom' }}
      className={cls.menu}
    >
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? cls.isActive : ''}
      >
        <IconBold size="1em" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? cls.isActive : ''}
      >
        <IconItalic size="1em" />
      </button>
      <button
        onClick={setLink}
        className={editor.isActive('link') ? cls.isActive : ''}
      >
        <IconLink size="1em" />
      </button>
    </BM>
  );
};
