import { IconBold, IconCode, IconItalic, IconLink } from '@tabler/icons-react';
import type { Editor } from '@tiptap/core';
import { useCallback, useEffect, useState } from 'react';

import { BubbleMenuPlugin } from '..';

import cls from './index.module.scss';

export const BubbleMenu: React.FC<{ editor: Editor }> = ({ editor }) => {
  const [element, setElement] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!element) {
      return;
    }

    if (editor.isDestroyed) {
      return;
    }

    const plugin = BubbleMenuPlugin({
      editor,
      element,
      pluginKey: 'BubbleMenu',
    });

    editor.registerPlugin(plugin);
    return () => {
      editor.unregisterPlugin('BubbleMenu');
    };
  }, [editor, element]);

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
    <div className={cls.menu} ref={setElement}>
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
      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={editor.isActive('code') ? cls.isActive : ''}
      >
        <IconCode size="1em" />
      </button>
    </div>
  );
};
