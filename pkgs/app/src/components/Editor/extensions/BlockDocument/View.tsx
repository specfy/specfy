import { NodeViewWrapper } from '@tiptap/react';

import { Input } from '@/components/Form/Input';

import type { NodeViewProps } from '@tiptap/react';

export const BlockDocumentView: React.FC<NodeViewProps> = ({ node }) => {
  return (
    <NodeViewWrapper>
      <Input value={node.attrs.id} />
    </NodeViewWrapper>
  );
};
