import type { ComputedNode } from '@specfy/models';
import {
  IconEye,
  IconEyeOff,
  IconPackageImport,
  IconTrash,
} from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import { useStoreApi } from 'reactflow';

import { Button } from '../../Form/Button';
import { Tag } from '../../Tag';
import { PreviewNode } from '../CustomNode';

import type { Relation } from './EdgeRelation';
import { EdgeRelation } from './EdgeRelation';
import cls from './index.module.scss';

import { useFlowStore } from '@/common/store';
import { Flex } from '@/components/Flex';
import { TooltipFull } from '@/components/Tooltip';

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

export const FlowDetails: React.FC = () => {
  const {
    nodes,
    edges,
    readOnly,
    nodeSelected,
    edgeSelected,
    onNodesChange,
    onEdgesChange,
  } = useFlowStore();
  const store = useStoreApi();

  const [currNode, setNode] = useState<ComputedNode | null>(null);
  const [from, setFrom] = useState<Relation[]>([]);
  const [to, setTo] = useState<Relation[]>([]);
  const [relation, setRelation] = useState<Relation | null>(null);

  useEffect(() => {
    if (nodeSelected) {
      // Only one
      setNode(store.getState().nodeInternals.get(nodeSelected)!);
      setRelation(null);
      return;
    } else {
      setNode(null);
    }

    if (edgeSelected) {
      const edge = edges.find((e) => e.id === edgeSelected)!;
      const source = nodes.find((c) => c.id === edge.source);
      const target = nodes.find((c) => c.id === edge.target);
      setRelation({ edge, source, target });
      setNode(null);
      console.log(edge);
    } else {
      setRelation(null);
    }
  }, [nodeSelected, edgeSelected, edges, nodes]);

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
          target: nodes.find((c) => c.id === edge.target)!,
        });
      } else if (edge.target === currNode.id) {
        t.push({
          edge,
          source: nodes.find((c) => c.id === edge.source)!,
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

    return nodes.find((c) => c.id === currNode.parentNode);
  }, [currNode]);

  const deleteComponent = () => {
    onNodesChange(store)([{ id: currNode!.id, type: 'remove' }]);
  };
  const removeParent = () => {
    onNodesChange(store)([{ id: currNode!.id, type: 'ungroup' }]);
  };
  const visibilityComponent = () => {
    onNodesChange(store)([{ id: currNode!.id, type: 'visibility' }]);
  };
  const deleteEdge = () => {
    onEdgesChange([{ id: relation!.edge.id, type: 'remove' }]);
  };
  const visibilityEdge = () => {
    onEdgesChange([{ id: relation!.edge.id, type: 'visibility' }]);
  };

  return (
    <div className={cls.composition}>
      {currNode && (
        <>
          <div className={cls.block}>
            <div className={cls.title}>
              {currNode.data.type === 'hosting' ? 'Hosting' : 'Component'}
              <Flex gap="m">
                {currNode.data.source && (
                  <TooltipFull
                    msg={`This component is managed by: ${currNode.data.source}`}
                    side="bottom"
                  >
                    <IconPackageImport />
                  </TooltipFull>
                )}

                <Flex>
                  {!readOnly && (
                    <Button
                      size="s"
                      display="ghost"
                      onClick={visibilityComponent}
                    >
                      {currNode.hidden ? (
                        <>
                          <IconEyeOff />
                        </>
                      ) : (
                        <>
                          <IconEye />
                        </>
                      )}
                    </Button>
                  )}
                  {!readOnly && !currNode.data.source && (
                    <Button size="s" display="ghost" onClick={deleteComponent}>
                      <IconTrash />
                    </Button>
                  )}
                </Flex>
              </Flex>
            </div>
            <div className={cls.preview}>
              <PreviewNode
                key={currNode.id}
                node={currNode}
                editable={!readOnly}
                onNodesChange={onNodesChange(store)}
              />
            </div>
          </div>

          <div className={cls.block}>
            <div className={cls.inside}>
              <div className={cls.info}>
                <div className={cls.caption}>Parent</div>
                {parent ? (
                  <Tag closable={!readOnly} onClose={removeParent}>
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
                          readonly={readOnly}
                          onEdgesChange={onEdgesChange}
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
                          readonly={readOnly}
                          onEdgesChange={onEdgesChange}
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
          <div className={cls.title}>
            Edge
            <Flex gap="m">
              {relation.edge.data!.source && (
                <TooltipFull
                  msg={`This edge is managed by: ${relation.edge.data!.source}`}
                  side="bottom"
                >
                  <IconPackageImport />
                </TooltipFull>
              )}

              <Flex>
                {!readOnly && (
                  <Button size="s" display="ghost" onClick={visibilityEdge}>
                    {relation.edge.hidden ? (
                      <>
                        <IconEyeOff />
                      </>
                    ) : (
                      <>
                        <IconEye />
                      </>
                    )}
                  </Button>
                )}
                {!readOnly && !relation.edge.data!.source && (
                  <Button size="s" display="ghost" onClick={deleteEdge}>
                    <IconTrash />
                  </Button>
                )}
              </Flex>
            </Flex>
          </div>
          <table className={cls.relations}>
            <tbody>
              <EdgeRelation
                {...relation}
                readonly={readOnly}
                onEdgesChange={onEdgesChange}
              />
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
