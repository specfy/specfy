import type { NodeViewProps } from '@tiptap/react';
import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import classnames from 'classnames';

import cls from '../../../Content/BlockVoteItem/index.module.scss';

export const VoteItemView: React.FC<NodeViewProps> = ({ node }) => {
  return (
    <NodeViewWrapper className={classnames(cls.item)}>
      <div className={cls.header} tabIndex={0} role="group">
        <div className={cls.label}>Choice {node.attrs.voteChoice}</div>
      </div>
      <div className={classnames(cls.content)}>
        <NodeViewContent />
      </div>
    </NodeViewWrapper>
  );
};
