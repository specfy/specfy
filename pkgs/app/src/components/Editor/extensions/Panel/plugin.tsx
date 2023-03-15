import type { NodeViewProps } from '@tiptap/core';
import { mergeAttributes, Node } from '@tiptap/core';
import {
  NodeViewContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
} from '@tiptap/react';
import { Alert, Select } from 'antd';
import { useMemo, useRef, useState } from 'react';
import { useClickAway } from 'react-use';

export type PanelOptions = {
  HTMLAttributes: Record<string, any>;
};

import { EditorMenu } from '../../Menu';

declare module '@tiptap/core' {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface Commands<ReturnType> {
    panel: {
      /**
       * Set a blockquote node
       */
      setPanel: () => ReturnType;
      /**
       * Toggle a blockquote node
       */
      togglePanel: () => ReturnType;
      /**
       * Unset a blockquote node
       */
      unsetPanel: () => ReturnType;
    };
  }
}

const EditorAlert: React.FC<NodeViewProps> = ({ node, updateAttributes }) => {
  const ref = useRef(null);
  const [show, setShow] = useState(false);

  useClickAway(ref, (e) => {
    if ((e.target as HTMLElement).closest('.ant-select-dropdown')) {
      return;
    }

    setShow(false);
  });

  const options = useMemo(() => {
    return [
      { value: 'error', label: 'Error' },
      { value: 'info', label: 'Info' },
      { value: 'success', label: 'Success' },
      { value: 'warning', label: 'Warning' },
    ];
  }, []);
  const onChange = (value: string) => {
    updateAttributes({
      type: value,
    });
  };

  return (
    <NodeViewWrapper onMouseDown={() => setShow(true)} ref={ref}>
      <EditorMenu show={show}>
        <Select
          options={options}
          size="small"
          style={{ width: '100px' }}
          value={node.attrs.type}
          onChange={onChange}
        />
      </EditorMenu>
      <Alert type={node.attrs.type} banner description={<NodeViewContent />} />
    </NodeViewWrapper>
  );
};

export const Panel = Node.create<PanelOptions>({
  name: 'panel',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  content: 'paragraph+',

  group: 'block',

  defining: true,

  addAttributes() {
    return {
      type: {
        default: 'info',
        rendered: false,
      },
    };
  },

  renderHTML(a) {
    return ['alert', mergeAttributes(a.HTMLAttributes), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(EditorAlert, {});
  },

  addCommands() {
    return {
      setPanel:
        () =>
        ({ commands }) => {
          return commands.wrapIn(this.name);
        },
      togglePanel:
        () =>
        ({ commands }) => {
          return commands.toggleWrap(this.name);
        },
      unsetPanel:
        () =>
        ({ commands }) => {
          return commands.lift(this.name);
        },
    };
  },
});
