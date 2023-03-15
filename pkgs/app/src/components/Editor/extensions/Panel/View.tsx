import type { NodeViewProps } from '@tiptap/core';
import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import { Alert, Select } from 'antd';
import { useMemo, useRef, useState } from 'react';
import { useClickAway } from 'react-use';

export type PanelOptions = {
  HTMLAttributes: Record<string, any>;
};

import { EditorMenu } from '../../Menu';

export const PanelView: React.FC<NodeViewProps> = ({
  node,
  updateAttributes,
}) => {
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
