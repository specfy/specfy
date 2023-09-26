import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import { useMemo, useRef, useState } from 'react';
import { useClickAway } from 'react-use';

import { Banner } from '@/components/Banner';
import { EditorMenu } from '@/components/Editor/Menu';
import { SelectFull } from '@/components/Form/Select';

import type { NodeViewProps } from '@tiptap/core';

export const BannerView: React.FC<NodeViewProps> = ({
  node,
  updateAttributes,
}) => {
  // TODO: handle cursor focus
  const ref = useRef(null);
  const [show, setShow] = useState(false);

  useClickAway(ref, (e) => {
    if ((e.target as HTMLElement).closest('role=["listbox"]')) {
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
        <SelectFull
          options={options}
          size="s"
          value={node.attrs.type}
          onValueChange={onChange}
        />
      </EditorMenu>
      <Banner type={node.attrs.type}>
        <NodeViewContent />
      </Banner>
    </NodeViewWrapper>
  );
};
