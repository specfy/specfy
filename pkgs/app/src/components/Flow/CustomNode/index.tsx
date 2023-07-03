import type { NodeData } from '@specfy/api/src/common/flow/types';
import classNames from 'classnames';
import type * as React from 'react';
import { memo } from 'react';
import type { Node, NodeProps } from 'reactflow';
import { Handle, Position, NodeResizer } from 'reactflow';

import { ComponentIcon } from '../../Component/Icon';

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
        <ComponentIcon {...data} />
        <div className={cls.label}>{data.label}</div>
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

export const PreviewNode: React.FC<Node<NodeData> & { info?: boolean }> = ({
  data,
  positionAbsolute,
  width,
  height,
  info = true,
}) => {
  return (
    <div className={classNames(cls.node, cls.preview)}>
      {info && (
        <>
          <div className={cls.pos}>
            x:{positionAbsolute!.x} y:{positionAbsolute!.y}
          </div>
          <div className={cls.size}>
            <div className={cls.sizeWidth}>{width}px</div>
            <div className={cls.sizeHeight}>{height}px</div>
          </div>
        </>
      )}
      <div className={cls.title}>
        <ComponentIcon {...data} large />
        <div className={cls.label}>{data.label}</div>
      </div>
    </div>
  );
};

export default memo(CustomNode);
