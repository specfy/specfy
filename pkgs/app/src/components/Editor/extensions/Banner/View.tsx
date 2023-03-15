import type { NodeViewProps } from '@tiptap/core';
import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import { Select } from 'antd';
import { useMemo, useRef, useState } from 'react';
import { useClickAway } from 'react-use';

import { Banner } from '../../../Banner';
import { EditorMenu } from '../../Menu';

export const BannerView: React.FC<NodeViewProps> = ({
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
      <Banner type={node.attrs.type}>
        <NodeViewContent />
      </Banner>
    </NodeViewWrapper>
  );
};
