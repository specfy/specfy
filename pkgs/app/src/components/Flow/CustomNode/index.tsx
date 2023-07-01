import type { NodeData } from '@specfy/api/src/common/flow/types';
import { IconCode } from '@tabler/icons-react';
import classNames from 'classnames';
import type * as React from 'react';
import { memo } from 'react';
import type { Node, NodeProps } from 'reactflow';
import { Handle, Position, NodeResizer } from 'reactflow';

import { supportedIndexed } from '../../../common/component';
import { AvatarAuto } from '../../AvatarAuto';

import cls from './index.module.scss';

const CustomNode: React.FC<NodeProps<NodeData>> = ({ data, selected }) => {
  const Icon =
    data.techId &&
    data.techId in supportedIndexed &&
    supportedIndexed[data.techId].Icon;
  return (
    <div className={classNames(cls.node, cls[data.type])}>
      <NodeResizer
        lineClassName={cls.resizerLine}
        isVisible={selected}
        minWidth={100}
        minHeight={30}
        maxWidth={1000}
        maxHeight={1000}
      />
      <div className={cls.title}>
        {data.type === 'project' && (
          <div className={cls.icon}>
            <AvatarAuto name={data.label} size="small" shape="square" />
          </div>
        )}
        {Icon && (
          <div className={cls.icon}>
            <Icon size="1em" />
          </div>
        )}
        {!data.techId && data.type === 'component' && (
          <div className={classNames(cls.icon, cls.service)}>
            <IconCode size="1em" />
          </div>
        )}
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

export const PreviewNode: React.FC<Node<NodeData>> = ({
  data,
  position,
  width,
  height,
}) => {
  const Icon =
    data.techId &&
    data.techId in supportedIndexed &&
    supportedIndexed[data.techId].Icon;
  return (
    <div className={classNames(cls.node, cls.component, cls.preview)}>
      <div className={cls.pos}>
        x:{position.x} y:{position.y}
      </div>
      <div className={cls.size}>
        <div className={cls.sizeWidth}>{width}px</div>
        <div className={cls.sizeHeight}>{height}px</div>
      </div>
      <div className={cls.title}>
        {data.type === 'project' && (
          <div className={cls.icon}>
            <AvatarAuto name={data.label} size="small" shape="square" />
          </div>
        )}
        {Icon && (
          <div className={cls.icon}>
            <Icon size="1em" />
          </div>
        )}
        {!data.techId && data.type === 'component' && (
          <div className={classNames(cls.icon, cls.service)}>
            <IconCode size="1em" />
          </div>
        )}
        <div className={cls.label}>{data.label}</div>
      </div>
    </div>
  );
};

export default memo(CustomNode);
