import type { NodeViewProps } from '@tiptap/core';
import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import { Select } from 'antd';
import { highlight, languages } from 'prismjs';
import { useMemo, useRef, useState } from 'react';
import Editor from 'react-simple-code-editor';
import { useClickAway } from 'react-use';

import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/themes/prism.css';

import { EditorMenu } from '../../Menu';

import cls from './index.module.scss';

export const CodeBlockView: React.FC<NodeViewProps> = ({
  node,
  updateAttributes,
}) => {
  const ref = useRef(null);
  const [show, setShow] = useState(false);
  const [content, setContent] = useState(
    () => (node.content as any).content[0].text
  );

  useClickAway(ref, (e) => {
    if ((e.target as HTMLElement).closest('.ant-select-dropdown')) {
      return;
    }

    setShow(false);
  });

  const options = useMemo(() => {
    return [
      { value: 'javascript', label: 'Javascript' },
      { value: 'typescript', label: 'Typescript' },
      { value: 'css', label: 'CSS' },
      { value: 'html', label: 'HTML' },
    ];
  }, []);

  const onChange = (value: string) => {
    updateAttributes({
      language: value,
    });
  };
  const onUpdate = (value: string) => {
    setContent(value);
  };

  return (
    <NodeViewWrapper onMouseDown={() => setShow(true)} ref={ref}>
      <EditorMenu show={show}>
        <Select
          options={options}
          size="small"
          style={{ width: '100px' }}
          value={node.attrs.language}
          onChange={onChange}
        />
      </EditorMenu>
      <Editor
        value={content}
        onValueChange={onUpdate}
        highlight={(code) =>
          highlight(code, languages[node.attrs.language], node.attrs.language)
        }
        padding={10}
        className={cls.code}
      />
    </NodeViewWrapper>
  );
};
