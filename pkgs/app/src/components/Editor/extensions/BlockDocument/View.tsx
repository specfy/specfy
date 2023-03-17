import type { NodeViewProps } from '@tiptap/react';
import { NodeViewWrapper } from '@tiptap/react';
import { Input } from 'antd';

export const BlockDocumentView: React.FC<NodeViewProps> = ({ node }) => {
  return (
    <NodeViewWrapper>
      <Input value={node.attrs.id} />
    </NodeViewWrapper>
  );
};