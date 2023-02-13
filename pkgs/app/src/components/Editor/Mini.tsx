import type { BlockLevelZero } from 'api/src/types/api';
import { useState } from 'react';

import type { EditContextSub } from '../../hooks/useEdit';

import { ToolbarMini } from './Toolbar';
import cls from './index.module.scss';

import { Editor } from '.';

interface Prop<T extends Record<string, any>> {
  curr: EditContextSub<T>;
  field: string;
  originalContent: BlockLevelZero;
}

export const EditorMini: <T extends Record<string, any>>(
  p: Prop<T>
) => React.ReactElement<Prop<T>> = ({ curr, field, originalContent }) => {
  const [content, setContent] = useState<BlockLevelZero>(() => {
    return curr?.edits[field] || originalContent;
  });

  const [isUpdated, setIsUpdated] = useState(false);

  const handleRevert = () => {
    curr?.remove(field);
    setContent({ ...originalContent });
    setIsUpdated(false);
  };

  return (
    <div className={cls.mini}>
      <ToolbarMini isUpdated={isUpdated} onRevert={handleRevert} />
      <Editor
        content={content}
        onUpdate={(json) => {
          curr?.set(field, json);
          setIsUpdated(true);
        }}
      />
    </div>
  );
};
