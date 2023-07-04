import * as Popover from '@radix-ui/react-popover';
import type { NodeData } from '@specfy/api/src/common/flow/types';
import classNames from 'classnames';
import type { ChangeEventHandler, KeyboardEventHandler } from 'react';
import { useEffect, memo, useRef, useState } from 'react';
import type { Node, NodeProps } from 'reactflow';
import { Handle, Position, NodeResizer } from 'reactflow';

import { ComponentIcon } from '../../Component/Icon';
import type { TechSearchItem } from '../../StackSearch/TechSearch';
import { TechSearch } from '../../StackSearch/TechSearch';
import type { OnNodesChangeSuper } from '../helpers';

import cls from './index.module.scss';

const CustomNode: React.FC<NodeProps<NodeData>> = ({ data, selected }) => {
  return (
    <div
      className={classNames(cls.node, data.type === 'hosting' && cls.hosting)}
    >
      <NodeResizer
        lineClassName={cls.resizerLine}
        isVisible={selected}
        minWidth={100}
        minHeight={30}
        maxWidth={1000}
        maxHeight={1000}
      />
      <div className={cls.title}>
        <ComponentIcon data={data} />
        <div className={cls.label}>{data.name}</div>
      </div>

      <Handle
        type="source"
        position={Position.Top}
        id="top"
        className={classNames(cls.handle, cls.source, cls.top)}
      />
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className={classNames(cls.handle, cls.target, cls.top)}
      />

      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className={classNames(cls.handle, cls.source, cls.right)}
      />
      <Handle
        type="target"
        position={Position.Right}
        id="right"
        className={classNames(cls.handle, cls.target, cls.right)}
      />

      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className={classNames(cls.handle, cls.source, cls.bottom)}
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom"
        className={classNames(cls.handle, cls.target, cls.bottom)}
      />

      <Handle
        type="source"
        position={Position.Left}
        id="left"
        className={classNames(cls.handle, cls.source, cls.left)}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className={classNames(cls.handle, cls.target, cls.left)}
      />
    </div>
  );
};

export const PreviewNode: React.FC<{
  node: Pick<
    Node<NodeData>,
    'data' | 'height' | 'id' | 'positionAbsolute' | 'width'
  >;
  info?: boolean;
  editable?: boolean;
  onNodesChange?: OnNodesChangeSuper;
}> = ({ node, info = true, editable = false, onNodesChange }) => {
  const input = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(node.data.name);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (document.activeElement === input.current) {
      return;
    }
    setValue(node.data.name);
  }, [node]);

  const onChange: ChangeEventHandler<HTMLInputElement> = (el) => {
    setValue(el.target.value);
  };
  const onBlur: ChangeEventHandler<HTMLInputElement> = () => {
    if (value !== node.data.name) {
      onNodesChange!([{ id: node.id, type: 'rename', name: value }]);
    }
  };
  const onKeyDown: KeyboardEventHandler<HTMLInputElement> = (evt) => {
    if (evt.code === 'Enter') {
      onNodesChange!([{ id: node.id, type: 'rename', name: value }]);
    }
  };

  const onTechChange = (tech: TechSearchItem | null) => {
    onNodesChange!([{ id: node.id, type: 'tech', tech }]);
    setOpen(false);
  };
  const onOpenChange = (val: boolean) => {
    setOpen(val);
  };

  return (
    <div className={classNames(cls.node, cls.preview)}>
      {info && (
        <>
          <div className={cls.pos}>
            x:{node.positionAbsolute!.x} y:{node.positionAbsolute!.y}
          </div>
          <div className={cls.size}>
            <div className={cls.sizeWidth}>{node.width}px</div>
            <div className={cls.sizeHeight}>{node.height}px</div>
          </div>
        </>
      )}
      <div className={cls.title}>
        {editable ? (
          <Popover.Root onOpenChange={onOpenChange} open={open}>
            <Popover.Trigger asChild>
              <button className={cls.iconEdit}>
                <ComponentIcon data={node.data} large noEmpty />
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content className="rx_popoverContent" sideOffset={5}>
                <TechSearch
                  selected={node.data.techId || node.data.typeId}
                  onPick={onTechChange}
                />
                <Popover.Arrow className="rx_popoverArrow" />
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        ) : (
          <ComponentIcon data={node.data} large />
        )}
        <input
          ref={input}
          readOnly={!editable || node.data.type === 'project'}
          className={classNames(cls.label, editable && cls.editable)}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
        />
      </div>
    </div>
  );
};

export default memo(CustomNode);
