import type { NodeViewProps } from '@tiptap/core';
import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import classnames from 'classnames';
import { highlight, languages } from 'prismjs';
import { useMemo, useRef, useState } from 'react';
import { useClickAway } from 'react-use';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-bash';
import 'prismjs/themes/prism.css';

import { SelectFull } from '../../../Form/Select';
import { EditorMenu } from '../../Menu';

import cls from './index.module.scss';

export const displayMap = {
  javascript: 'Javascript',
  typescript: 'Typescript',
  css: 'CSS',
  html: 'HTML',
  bash: 'Bash',
};

export const CodeBlockView: React.FC<NodeViewProps> = ({
  node,
  updateAttributes,
}) => {
  const ref = useRef(null);
  const [show, setShow] = useState(false);
  const [type, setType] = useState(() =>
    node.attrs.language in displayMap ? node.attrs.language : 'javascript'
  );

  useClickAway(ref, (e) => {
    if ((e.target as HTMLElement).closest('role=["listbox"]')) {
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
      { value: 'bash', label: 'Bash' },
    ];
  }, []);

  const onChange = (value: string) => {
    setType(value);
    updateAttributes({
      language: value,
    });
  };

  return (
    <NodeViewWrapper onMouseDown={() => setShow(true)} ref={ref}>
      <div className={cls.wrapper}>
        <EditorMenu show={show}>
          <SelectFull
            options={options}
            size="s"
            value={type}
            onValueChange={onChange}
          />
        </EditorMenu>
        <div className={cls.edit} spellCheck="false">
          <pre className={cls.pre}>
            <code className={classnames(cls.code)} spellCheck="false">
              <NodeViewContent />
            </code>
          </pre>
        </div>
        <div className={cls.display}>
          <pre className={cls.pre} spellCheck="false">
            <code
              className={classnames('hljs', `language-${type}`, cls.code)}
              dangerouslySetInnerHTML={{
                __html: highlight(node.textContent, languages[type], type),
              }}
            ></code>
          </pre>
        </div>
      </div>
    </NodeViewWrapper>
  );
};
