import {
  IconQuote,
  IconTextSize,
  IconList,
  IconSeparator,
  IconHeading,
  IconCaretRight,
  IconCheckbox,
  IconTable,
  IconCode,
} from '@tabler/icons-react';
import type { Editor } from '@tiptap/core';
import type { Plugin } from '@tiptap/pm/state';
import classnames from 'classnames';
import { useCallback, useEffect, useState } from 'react';

import { FloatingMenuPlugin } from '../plugin';

import cls from './index.module.scss';

export const FloatingMenu: React.FC<{ editor: Editor }> = ({ editor }) => {
  const [element, setElement] = useState<HTMLDivElement | null>(null);

  // Menu logic
  const [showSub, setShowSub] = useState<string | undefined>();
  const [, setSelected] = useState<boolean>(false);
  const [plugin, setPlugin] = useState<Plugin<any>>();

  useEffect(() => {
    if (!element) {
      return;
    }

    if (editor.isDestroyed) {
      return;
    }

    const tmp = FloatingMenuPlugin({
      pluginKey: 'floatingMenu',
      editor,
      element,
      tippyOptions: { duration: 250, offset: [5, -40] },
      onBlur: () => {
        setShowSub(undefined);
        setSelected(false);
      },
    });

    setPlugin(tmp);
    editor.registerPlugin(tmp);
    return () => {
      editor.unregisterPlugin('floatingMenu');
    };
  }, [editor, element]);

  const select = useCallback(() => {
    // TODO: make this work
    plugin?.spec.getRef().hide();
    setSelected(true);
  }, [editor, plugin]);

  return (
    <div
      ref={setElement}
      className={cls.container}
      style={{ visibility: 'hidden' }}
    >
      <div className={classnames(cls.menu, showSub && cls.hide)}>
        <div
          className={cls.item}
          onClick={() => {
            editor.chain().focus().setParagraph().run();
            select();
          }}
        >
          <div className={cls.icon}>
            <IconTextSize size="1em" />
          </div>
          <div>Text</div>
        </div>
        <div className={cls.item} onClick={() => setShowSub('headings')}>
          <div className={cls.icon}>
            <IconHeading size="1em" />
          </div>
          <div>Titles</div>
          <div className={cls.right}>
            <IconCaretRight size="1em" />
          </div>
        </div>
        <div
          className={cls.item}
          onClick={() => {
            editor.chain().focus().toggleBulletList().run();
            select();
          }}
        >
          <div className={cls.icon}>
            <IconList size="1em" />
          </div>
          <div>Bullet List</div>
        </div>
        <div
          className={cls.item}
          onClick={() => {
            editor.chain().focus().toggleTaskList().run();
            select();
          }}
        >
          <div className={cls.icon}>
            <IconCheckbox size="1em" />
          </div>
          <div>Task List</div>
        </div>
        <div
          className={cls.item}
          onClick={() => {
            editor.chain().focus().toggleBlockquote().run();
            select();
          }}
        >
          <div className={cls.icon}>
            <IconQuote size="1em" />
          </div>
          <div>Quote</div>
        </div>
        <div
          className={cls.item}
          onClick={() => {
            editor.chain().focus().setCodeBlock().run();
            select();
          }}
        >
          <div className={cls.icon}>
            <IconCode size="1em" />
          </div>
          <div>Code Block</div>
        </div>
        <div
          className={cls.item}
          onClick={() => {
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run();
            select();
          }}
        >
          <div className={cls.icon}>
            <IconTable size="1em" />
          </div>
          <div>Table</div>
        </div>
        <div
          className={cls.item}
          onClick={() => {
            editor.chain().focus().setHorizontalRule().run();
            select();
          }}
        >
          <div className={cls.icon}>
            <IconSeparator size="1em" />
          </div>
          <div>Divider</div>
        </div>
      </div>
      <div
        className={classnames(
          cls.menu,
          cls.subHeading,
          showSub === 'headings' && cls.show
        )}
      >
        {[1, 2, 3, 4].map((level: any) => {
          return (
            <div
              key={`heading-lvl-${level}`}
              className={cls.item}
              onClick={() => {
                editor.chain().focus().setHeading({ level }).run();
                select();
              }}
            >
              <div className={cls.icon}>
                <IconHeading size="1em" />
              </div>
              <div>Title {level}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
