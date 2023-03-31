import { IconCaretDown } from '@tabler/icons-react';
import type { NodeViewProps } from '@tiptap/react';
import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import classnames from 'classnames';

import cls from '../../../Content/BlockStep/index.module.scss';

export const StepView: React.FC<NodeViewProps> = () => {
  return (
    <NodeViewWrapper className={classnames(cls.block)}>
      <div
        className={cls.header}
        tabIndex={0}
        role="group"
        contentEditable={false}
      >
        <IconCaretDown /> Step
      </div>
      <div className={classnames(cls.content)}>
        <NodeViewContent />
      </div>
    </NodeViewWrapper>
  );
};
