import type { NodeData } from '@specfy/models';
import { useState } from 'react';

import { ComponentIcon } from '../../Component/Icon';
import * as Popover from '../../Popover';
import type { TechSearchItem } from '../../StackSearch/TechSearch';
import { TechSearch } from '../../StackSearch/TechSearch';
import type { OnNodesChangeSuper } from '../types';

import cls from './index.module.scss';

export const TechPopover: React.FC<{
  techId: string | null;
  id: string;
  data: Partial<Pick<NodeData, 'name' | 'techId' | 'type'>>;
  onNodesChange?: OnNodesChangeSuper;
}> = ({ techId, id, data, onNodesChange }) => {
  const [open, setOpen] = useState(false);

  const onTechChange = (tech: TechSearchItem | null) => {
    onNodesChange?.([{ id, type: 'tech', tech }]);
    setOpen(false);
  };

  const onOpenChange = (val: boolean) => {
    setOpen(val);
  };

  return (
    <Popover.Popover onOpenChange={onOpenChange} open={open}>
      <Popover.Trigger asChild>
        <button className={cls.iconEdit}>
          <ComponentIcon data={data} large noEmpty />
        </button>
      </Popover.Trigger>
      <Popover.Content sideOffset={5}>
        <TechSearch selected={techId} onPick={onTechChange} />
      </Popover.Content>
    </Popover.Popover>
  );
};
