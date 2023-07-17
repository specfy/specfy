import * as Popover from '@radix-ui/react-popover';
import type { NodeData } from '@specfy/api/src/models/flows/types';
import { useState } from 'react';

import { ComponentIcon } from '../../Component/Icon';
import type { TechSearchItem } from '../../StackSearch/TechSearch';
import { TechSearch } from '../../StackSearch/TechSearch';
import type { OnNodesChangeSuper } from '../helpers';

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
    <Popover.Root onOpenChange={onOpenChange} open={open}>
      <Popover.Trigger asChild>
        <button className={cls.iconEdit}>
          <ComponentIcon data={data} large noEmpty />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className="rx_popoverContent" sideOffset={5}>
          <TechSearch selected={techId} onPick={onTechChange} />
          <Popover.Arrow className="rx_popoverArrow" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};
