import { type ComputedNode, type NodeData } from '@specfy/models';
import { hMax, hMin, wMax, wMin } from '@specfy/models/src/flows/constants';
import { IconEye, IconLayersDifference, IconTrash } from '@tabler/icons-react';
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
  NodeToolbar,
  useStoreApi,
  useReactFlow,
} from 'reactflow';

import { ComponentIcon } from '../../Component/Icon';
import { TooltipFull } from '../../Tooltip';
import { TechPopover } from '../TechPopover';
import type { OnNodesChangeSuper } from '../types';

import cls from './index.module.scss';

import { useFlowStore } from '@/common/store';
import { useEdit } from '@/hooks/useEdit';

const connectionNodeIdSelector = (state: ReactFlowState) =>
  state.connectionNodeId;

const CustomNode: React.FC<NodeProps<NodeData>> = ({
  id,
  data,
  selected,
  isConnectable,
}) => {
  const { deleteElements } = useReactFlow();
  const storeFlow = useFlowStore();
  const store = useStoreApi();
  const { isEditing } = useEdit();
  const parent = useStore((state: ReactFlowState) => {
    return state.nodeInternals.get(id)?.parentNode;
  });
  const updateNodeInternals = useUpdateNodeInternals();
  const connectionNodeId = useStore(connectionNodeIdSelector);
  const isConnecting = !!connectionNodeId;
  const edges = useEdges();

  const disableHandle = isConnecting && data?.moving === false;

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
        disableHandle && cls.disableHandle
      )}
    >
      <NodeResizer
        lineClassName={cls.resizerLine}
        isVisible={selected}
        minHeight={hMin}
        maxHeight={hMax}
        minWidth={wMin}
        maxWidth={wMax}
      />
      {isEditing && (
        <NodeToolbar
          style={{ width: `${data.originalSize.width}px` }}
          position={Position.Bottom}
          align={'start'}
          offset={5}
          className={cls.toolbar}
        >
          {parent && (
            <TooltipFull msg="Ungroup" side="bottom">
              <button
                className={cls.button}
                onClick={() =>
                  storeFlow.onNodesChange(store)([
                    {
                      type: 'ungroup',
                      id,
                    },
                  ])
                }
              >
                <IconLayersDifference />
              </button>
            </TooltipFull>
          )}
          <TooltipFull msg="Hide" side="bottom">
            <button
              className={cls.button}
              onClick={() =>
                storeFlow.onNodesChange(store)([
                  {
                    type: 'visibility',
                    id,
                  },
                ])
              }
            >
              <IconEye />
            </button>
          </TooltipFull>
          {!data.source && (
            <TooltipFull msg="Delete" side="bottom">
              <button
                className={cls.button}
                onClick={() => {
                  deleteElements({ nodes: [{ id }] });
                }}
              >
                <IconTrash />
              </button>
            </TooltipFull>
          )}
        </NodeToolbar>
      )}

      <div className={cls.title}>
        <ComponentIcon data={data} noEmpty />
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
  forceDisplay?: 'hosting' | 'node';
  onNodesChange?: OnNodesChangeSuper;
}> = ({ node, info = true, editable = false, forceDisplay, onNodesChange }) => {
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
    <div
      className={classNames(
        cls.node,
        cls.preview,
        forceDisplay === 'hosting' && cls.hosting
      )}
    >
      {info && (
        <>
          <div className={cls.pos}>
            x:{Math.round(node.positionAbsolute!.x)} y:
            {Math.round(node.positionAbsolute!.y)}
          </div>
          <div className={cls.size}>
            <div className={cls.sizeWidth}>{node.width}px</div>
            <div className={cls.sizeHeight}>{node.height}px</div>
          </div>
        </>
      )}
      <div className={cls.title}>
        {node.data.source ? (
          <TooltipFull
            msg={`This component is managed by: ${node.data.source}`}
            side="bottom"
          >
            <div>
              <ComponentIcon data={node.data} large noEmpty />
            </div>
          </TooltipFull>
        ) : (
          <div>
            {editable ? (
              <TechPopover
                id={node.id}
                techId={node.data.techId || node.data.typeId}
                data={node.data}
                onNodesChange={onNodesChange}
              />
            ) : (
              <ComponentIcon data={node.data} large noEmpty />
            )}
          </div>
        )}
        <TooltipFull
          msg={
            editable &&
            node.data.type === 'project' &&
            "Can't edit Project name"
          }
          side="bottom"
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
        </TooltipFull>
      </div>
    </div>
  );
};

export default memo(CustomNode);
