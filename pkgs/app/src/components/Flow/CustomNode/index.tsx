import type { ComputedNode, NodeData } from '@specfy/api/src/common/flow/types';
import { Tooltip } from 'antd';
import classNames from 'classnames';
import type { ChangeEventHandler, KeyboardEventHandler } from 'react';
import { useMemo, useEffect, memo, useRef, useState } from 'react';
import type { NodeProps, ReactFlowState } from 'reactflow';
import {
  useUpdateNodeInternals,
  useEdges,
  useStore,
  Handle,
  Position,
  NodeResizer,
} from 'reactflow';

import { ComponentIcon } from '../../Component/Icon';
import { TechPopover } from '../TechPopover';
import type { OnNodesChangeSuper } from '../helpers';

import cls from './index.module.scss';

const connectionNodeIdSelector = (state: ReactFlowState) =>
  state.connectionNodeId;

const CustomNode: React.FC<NodeProps<NodeData>> = ({
  id,
  data,
  selected,
  isConnectable,
}) => {
  const updateNodeInternals = useUpdateNodeInternals();
  const connectionNodeId = useStore(connectionNodeIdSelector);
  const isConnecting = !!connectionNodeId;
  const edges = useEdges();

  const { hasTT, hasTR, hasTB, hasTL, hasST, hasSR, hasSB, hasSL } =
    useMemo(() => {
      const filtered = edges.filter(
        (edge) => edge.target === id || edge.source === id
      );

      return {
        hasTT:
          filtered.findIndex(
            (edge) => edge.targetHandle === 'tt' && edge.target === id
          ) > -1,
        hasTR:
          filtered.findIndex(
            (edge) => edge.targetHandle === 'tr' && edge.target === id
          ) > -1,
        hasTB:
          filtered.findIndex(
            (edge) => edge.targetHandle === 'tb' && edge.target === id
          ) > -1,
        hasTL:
          filtered.findIndex(
            (edge) => edge.targetHandle === 'tl' && edge.target === id
          ) > -1,
        hasST:
          filtered.findIndex(
            (edge) => edge.sourceHandle === 'st' && edge.source === id
          ) > -1,
        hasSR:
          filtered.findIndex(
            (edge) => edge.sourceHandle === 'sr' && edge.source === id
          ) > -1,
        hasSB:
          filtered.findIndex(
            (edge) => edge.sourceHandle === 'sb' && edge.source === id
          ) > -1,
        hasSL:
          filtered.findIndex(
            (edge) => edge.sourceHandle === 'sl' && edge.source === id
          ) > -1,
      };
    }, [edges]);

  useEffect(() => {
    updateNodeInternals(id);
  }, [isConnecting, hasTT, hasTR, hasTB, hasTL, hasST, hasSR, hasSB, hasSL]);

  return (
    <div
      className={classNames(
        cls.node,
        selected && cls.selected,
        data.type === 'hosting' && cls.hosting,
        isConnecting && cls.isConnecting
      )}
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

      <div className={cls.top}>
        <Handle
          type="source"
          position={Position.Top}
          id="st"
          className={classNames(
            cls.handle,
            cls.source,
            cls.top,
            hasST && cls.show
          )}
          isConnectable={isConnectable}
        />
        <Handle
          type="target"
          position={Position.Top}
          id="tt"
          className={classNames(
            cls.handle,
            cls.target,
            cls.top,
            (hasTT || isConnecting) && cls.show
          )}
          isConnectable={isConnectable}
        />
      </div>

      <div className={cls.right}>
        <Handle
          type="source"
          position={Position.Right}
          id="sr"
          className={classNames(
            cls.handle,
            cls.source,
            cls.right,
            hasSR && cls.show
          )}
          isConnectable={isConnectable}
        />
        <Handle
          type="target"
          position={Position.Right}
          id="tr"
          className={classNames(
            cls.handle,
            cls.target,
            cls.right,
            (hasTR || isConnecting) && cls.show
          )}
          isConnectable={isConnectable}
        />
      </div>

      <div className={cls.bottom}>
        <Handle
          type="source"
          position={Position.Bottom}
          id="sb"
          className={classNames(
            cls.handle,
            cls.source,
            cls.bottom,
            hasSB && cls.show
          )}
          isConnectable={isConnectable}
        />
        <Handle
          type="target"
          position={Position.Bottom}
          id="tb"
          className={classNames(
            cls.handle,
            cls.target,
            cls.bottom,
            (hasTB || isConnecting) && cls.show
          )}
          isConnectable={isConnectable}
        />
      </div>

      <div className={cls.left}>
        <Handle
          type="source"
          position={Position.Left}
          id="sl"
          className={classNames(
            cls.handle,
            cls.source,
            cls.left,
            hasSL && cls.show
          )}
          isConnectable={isConnectable}
        />
        <Handle
          type="target"
          position={Position.Left}
          id="tl"
          className={classNames(
            cls.handle,
            cls.target,
            cls.left,
            (hasTL || isConnecting) && cls.show
          )}
          isConnectable={isConnectable}
        />
      </div>
    </div>
  );
};

export const PreviewNode: React.FC<{
  node: Pick<
    ComputedNode,
    'data' | 'height' | 'id' | 'positionAbsolute' | 'width'
  >;
  info?: boolean;
  editable?: boolean;
  onNodesChange?: OnNodesChangeSuper;
}> = ({ node, info = true, editable = false, onNodesChange }) => {
  const input = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(node.data.name);

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
          <TechPopover
            id={node.id}
            techId={node.data.techId || node.data.typeId}
            data={node.data}
            onNodesChange={onNodesChange}
          />
        ) : (
          <ComponentIcon data={node.data} large />
        )}
        <Tooltip
          title={
            editable &&
            node.data.type === 'project' &&
            "Can't edit Project name"
          }
          placement="top"
        >
          <input
            ref={input}
            readOnly={!editable || node.data.type === 'project'}
            className={classNames(cls.label, editable && cls.editable)}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
          />
        </Tooltip>
      </div>
    </div>
  );
};

export default memo(CustomNode);
