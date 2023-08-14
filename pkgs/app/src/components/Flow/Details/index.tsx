import type {
  ComputedFlow,
  EdgeData,
} from '@specfy/api/src/models/flows/types';
import { IconTrash } from '@tabler/icons-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDebounce } from 'react-use';
import type { Node } from 'reactflow';
import { useEdges, useNodes, useOnSelectionChange } from 'reactflow';

import { Button } from '../../Form/Button';
import { Tag } from '../../Tag';
import { PreviewNode } from '../CustomNode';
import type { OnNodesChangeSuper } from '../helpers';

import type { Relation } from './EdgeRelation';
import { EdgeRelation } from './EdgeRelation';
import cls from './index.module.scss';

/**
 * TODO: hamburger menu
 * TODO: revert should revert all sub node?
 */

//   return (
//     <div className={cls.composition}>

//       {isEditing && changed.length > 0 && (
//         <div className={cls.block}>
//           <div
//             className={classnames(cls.title, cls.toggle)}
//             onClick={handleHideShow}
//           >
//             <div className={cls.titleLeft}>
//               <div>{hide ? <IconCaretRight /> : <IconCaretDown />}</div>
//               Changes
//             </div>
//             <Badge count={changed.length} color="#9ca3af" />
//           </div>
//           {!hide && (
//             <div className={classnames(cls.inside, cls.change)}>
//               {changed.map((comp) => {
//                 return (
//                   <div key={comp.id}>
//                     {comp!.name}
//                     <Tooltip title="Revert">
//                       <Button
//                         type="text"
//                         size="small"
//                         icon={<IconHistory />}
//                         onClick={() => handleRevert(comp.id)}
//                       />
//                     </Tooltip>
//                   </div>
//                 );
//               })}
//               {changed.length <= 0 && 'No changes...'}
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// /**
//  * Sort read/write, then read, then write
//  * Then alphabetically.
//  *
//  * Not used right now because when we click it reorders which is painful.
//  */
// function sortRelation(a: Relation, b: Relation): number {
//   if (a.edge.data!.read && a.edge.data!.write && !b.edge.data!.write) {
//     return -1;
//   }
//   if (!a.edge.data!.read && !b.edge.data!.read && b.edge.data!.write) {
//     return 1;
//   }
//   if (
//     a.edge.data!.read &&
//     a.edge.data!.write &&
//     b.edge.data!.read &&
//     b.edge.data!.write
//   ) {
//     return a.component.name > b.component.name ? 1 : -1;
//   }

//   return 0;
// }

export const FlowDetails: React.FC<{
  flow: ComputedFlow;
  readonly: boolean;
  // Events
  onNodesChange?: OnNodesChangeSuper;
  onRelationChange: (type: 'delete' | 'update', relation: Relation) => void;
}> = ({ flow, readonly, onNodesChange, onRelationChange }) => {
  const nodes = useNodes();
  const edges = useEdges<EdgeData>();

  const [currNode, setNode] = useState<Node | null>(null);
  const [from, setFrom] = useState<Relation[]>([]);
  const [to, setTo] = useState<Relation[]>([]);
  const [relation, setRelation] = useState<Relation | null>(null);

  // Select Nodes / Edges
  useOnSelectionChange({
    /**
     * Be careful `nds` is stall.
     * Maybe it's my fault I don't know, but sometimes the nodes are not up to date.
     * So prefer selecting back again from `nodes`.
     */
    onChange: ({ nodes: nds, edges: eds }) => {
      // Nodes
      if (nds.length === 0 || nds.length > 1) {
        // No selection or more than one
        setNode(null);
      } else {
        // Only one
        setNode(nodes.find((n) => n.id === nds[0].id)!);
      }

      // Edges
      if (eds.length === 0 || eds.length > 1) {
        // No selection or more than one
        setRelation(null);
      } else {
        const edge = eds[0];
        const source = flow.nodes.find((c) => c.id === edge.source);
        const target = flow.nodes.find((c) => c.id === edge.target);

        setRelation({ edge, source, target });
      }
    },
  });

  // Update current node information
  // Useful if we resize or delete it in the flow
  useDebounce(
    () => {
      if (!currNode) {
        return;
      }

      const find = nodes.find((n) => n.id === currNode.id);
      if (!find) {
        return;
      }

      setNode(find);
    },
    16,
    [nodes, currNode]
  );

  // List relations of a node
  useEffect(() => {
    if (!currNode) {
      setFrom([]);
      setTo([]);
      return;
    }

    const f: Relation[] = [];
    const t: Relation[] = [];
    for (const edge of edges) {
      if (edge.source === currNode.id) {
        f.push({
          edge,
          source: currNode,
          target: flow.nodes.find((c) => c.id === edge.target)!,
        });
      } else if (edge.target === currNode.id) {
        t.push({
          edge,
          source: flow.nodes.find((c) => c.id === edge.source)!,
          target: currNode,
        });
      }
    }

    setFrom(f);
    setTo(t);
  }, [currNode]);

  const parent = useMemo(() => {
    if (!currNode?.parentNode) {
      return null;
    }

    return flow.nodes.find((c) => c.id === currNode.parentNode);
  }, [currNode]);

  const onRelationDirection = useCallback(
    (rel: Relation) => {
      if (rel.edge.data!.write && rel.edge.data!.read) {
        rel.edge.data!.write = false;
      } else if (!rel.edge.data!.write && rel.edge.data!.read) {
        rel.edge.data!.read = false;
        rel.edge.data!.write = true;
      } else {
        rel.edge.data!.read = true;
        rel.edge.data!.write = true;
      }

      onRelationChange('update', rel);
    },
    [nodes]
  );

  const deleteComponent = () => {
    if (onNodesChange) {
      onNodesChange([{ id: currNode!.id, type: 'remove' }]);
    }
  };
  const removeParent = () => {
    if (onNodesChange) {
      onNodesChange([{ id: currNode!.id, type: 'ungroup' }]);
    }
  };

  return (
    <div className={cls.composition}>
      {currNode && (
        <>
          <div className={cls.block}>
            <div className={cls.title}>
              {currNode.data.type === 'hosting' ? 'Hosting' : 'Component'}
              {!readonly && (
                <div>
                  <Button size="s" display="ghost" onClick={deleteComponent}>
                    <IconTrash />
                  </Button>
                </div>
              )}
            </div>
            <div className={cls.preview}>
              <PreviewNode
                key={currNode.id}
                node={currNode}
                editable={!readonly}
                onNodesChange={onNodesChange}
              />
            </div>
          </div>

          <div className={cls.block}>
            <div className={cls.inside}>
              <div className={cls.info}>
                <div className={cls.caption}>Parent</div>
                {parent ? (
                  <Tag closable={!readonly} onClose={removeParent}>
                    {parent.data.name}
                  </Tag>
                ) : (
                  <div className={cls.noValue}>none</div>
                )}
              </div>
            </div>
          </div>

          <div className={cls.block}>
            <div className={cls.title}>Outgoing</div>
            <div>
              {from.length ? (
                <table className={cls.relations}>
                  <tbody>
                    {from.map((rel) => {
                      return (
                        <EdgeRelation
                          key={rel.edge.id}
                          {...rel}
                          readonly={readonly}
                          onDirection={onRelationDirection}
                        />
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className={cls.empty}>Nothing to show.</div>
              )}
            </div>
          </div>

          <div className={cls.block}>
            <div className={cls.title}>Incoming</div>
            <div>
              {to.length ? (
                <table className={cls.relations}>
                  <tbody>
                    {to.map((rel) => {
                      return (
                        <EdgeRelation
                          key={rel.edge.id}
                          {...rel}
                          readonly={readonly}
                          onDirection={onRelationDirection}
                        />
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className={cls.empty}>Nothing to show.</div>
              )}
            </div>
          </div>
        </>
      )}
      {relation && (
        <div className={cls.block}>
          <div className={cls.title}>Edge</div>
          <table className={cls.relations}>
            <tbody>
              <EdgeRelation
                {...relation}
                readonly={readonly}
                onDirection={onRelationDirection}
              />
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
