// import { Badge, Button, Tooltip } from 'antd';
// import type { ApiComponent, ApiProject } from '@specfy/api/src/types/api';
// import classnames from 'classnames';
// import { useCallback, useState } from 'react';

// import { useComponentsStore, useStagingStore } from '../../../common/store';
// import { useEdit } from '../../../hooks/useEdit';

import type { EdgeData } from '@specfy/api/src/common/flow/types';
import type { ApiComponent, ApiProject } from '@specfy/api/src/types/api';
import {
  IconArrowNarrowLeft,
  IconArrowNarrowRight,
  IconArrowsExchange,
  IconTrash,
} from '@tabler/icons-react';
import { Button, Tooltip } from 'antd';
import classNames from 'classnames';
import { useCallback, useEffect, useState } from 'react';
import { useDebounce } from 'react-use';
import type { Edge, Node, ReactFlowProps } from 'reactflow';
import { useEdges, useNodes, useOnSelectionChange } from 'reactflow';

import { PreviewNode } from '../CustomNode';

import cls from './index.module.scss';

/**
 * TODO: hamburger menu
 * TODO: revert should revert all sub node?
 * TODO: group/ungroup
 * TODO: load edited in other pages
 *
 * TODO: https://github.com/antvis/X6/issues/3327
 */
// export const GraphEdit: React.FC<{
//   proj: ApiProject;
//   comps: ApiComponent[];
// }> = ({ comps }) => {
//   const storeComponents = useComponentsStore();
//   const storeStaging = useStagingStore(); // TODO: it is probably triggering too many render

//   // Edit mode
//   const edit = useEdit();
//   const isEditing = edit.isEditing;

//   // UI
//   const [selected, setSelected] = useState<ApiComponent>();
//   const [info, setInfo] = useState<ApiComponent['display']>();
//   const [changed, setChanged] = useState<ApiComponent[]>([]);
//   const [hide, setHide] = useState<boolean>(true);

//   // This function is outside because it requires "edit" ref
//   const updateEdge = useCallback(
//     (e: Cell.EventArgs['change:*']) => {
//       //     if (!e.cell.isEdge()) {
//       //       return;
//       //     }
//       //     const id = e.cell.getSourceCellId()!;
//       //     const targetId = e.cell.getTargetCellId()!;
//       //     // Find related component
//       //     const comp = comps.find((c) => c.id === id);
//       //     if (!comp) {
//       //       return;
//       //     }
//       //     // Because objects are read only we copy, modify and apply the modification in zustand again
//       //     const edges: ApiComponent['edges'] = JSON.parse(
//       //       JSON.stringify(comp.edges)
//       //     );
//       //     const edge = edges.find((ed) => ed.to === targetId);
//       //     if (!edge) {
//       //       return;
//       //     }
//       //     edge.vertices = e.current;
//       //     storeComponents.updateField(comp.id, 'edges', edges);
//       //     return;
//     },
//     [edit]
//   );

//   // // Debounce change registry
//   // useDebounce(
//   //   () => {
//   //     const json = g.getRef()?.toJSON();
//   //     if (!json) {
//   //       return;
//   //     }

//   //     const tmp: ApiComponent[] = [];
//   //     for (const cell of Object.values(json.cells)) {
//   //       const comp = comps.find((c) => c.id === cell.id);
//   //       if (!comp) {
//   //         continue;
//   //       }

//   //       const has = storeStaging.diffs.find(
//   //         (clean) =>
//   //           clean.blob.type === 'component' && clean.blob.typeId === comp.id
//   //       );
//   //       if (!has || has.blob.deleted) {
//   //         continue;
//   //       }

//   //       tmp.push(comp);
//   //     }

//   //     setChanged(tmp);
//   //   },
//   //   200,
//   //   [storeStaging]
//   // );

//   const handleRevert = (id: string) => {
//     //   const graph = g.getRef();
//     //   if (!graph) {
//     //     return;
//     //   }
//     //   const find = storeStaging.diffs.find((comp) => comp.blob.typeId === id);
//     //   const cell = graph.getCellById(id);
//     //   if (!find || !cell) {
//     //     return;
//     //   }
//     //   if (cell.isNode()) {
//     //     graph.batchUpdate(() => {
//     //       if (!find.blob.previous || find.blob.type === 'document') {
//     //         return;
//     //       }
//     //       cell.setSize({ ...find.blob.previous.display.size });
//     //       cell.setPosition({ ...find.blob.previous.display.pos });
//     //       const outgoing = graph.getOutgoingEdges(cell);
//     //       if (!outgoing) {
//     //         return;
//     //       }
//     //       outgoing.forEach((edge) => {
//     //         if (!find.blob.previous || find.blob.type === 'document') {
//     //           return;
//     //         }
//     //         const old = find.blob.previous.edges.find(
//     //           (prev) => prev.to === edge.getTargetCellId()
//     //         );
//     //         edge.setVertices(old!.vertices);
//     //       });
//     //     });
//     //   }
//   };

//   return (
//     <div className={cls.composition}>
//       {selected && info && (
//         <div className={cls.block}>
//           <div className={cls.title}>{selected.name}</div>
//           <div className={cls.inside}>
//             <div className={cls.xy}>
//               <div>x: {info.pos.x.toFixed(0)}</div>
//               <div>y: {info.pos.y.toFixed(0)}</div>
//             </div>
//             <div>
//               <div className={cls.label}>Size</div>
//               <div className={cls.inputs}>
//                 Width
//                 <input
//                   className={cls.input}
//                   value={info.size.width}
//                   onChange={(e) => {
//                     handleSize('width', e.target.value);
//                   }}
//                 />
//                 Height
//                 <input
//                   className={cls.input}
//                   value={info.size.height}
//                   onChange={(e) => {
//                     handleSize('height', e.target.value);
//                   }}
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

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

export interface Relation {
  edge: Edge<EdgeData>;
  source?: ApiComponent;
  target?: ApiComponent;
}

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

const EdgeRelation: React.FC<
  Relation & {
    readonly: boolean;
    onDirection: (rel: Relation) => void;
  }
> = ({ edge, source, target, readonly, onDirection }) => {
  const onClick: React.ComponentProps<typeof Button>['onClick'] = (e) => {
    e.preventDefault();
    if (readonly) {
      return;
    }

    onDirection({ edge, source, target });
  };

  return (
    <tr className={classNames(cls.relation)}>
      <td className={cls.source}>{source?.name}</td>

      <td className={cls.to}>
        <Tooltip title="Click to change direction" placement="left">
          {edge.data!.write && edge.data!.read && (
            <Button
              className={cls.direction}
              size="small"
              type="ghost"
              onClick={onClick}
            >
              <IconArrowsExchange />
              <span className={cls.english}>read/write</span>
            </Button>
          )}
          {!edge.data!.write && edge.data!.read && (
            <Button
              className={cls.direction}
              size="small"
              type="ghost"
              onClick={onClick}
            >
              <IconArrowNarrowLeft />
              <span className={cls.english}>read</span>
            </Button>
          )}
          {edge.data!.write && !edge.data!.read && (
            <Button
              className={cls.direction}
              size="small"
              type="ghost"
              onClick={onClick}
            >
              <IconArrowNarrowRight />
              <span className={cls.english}>write</span>
            </Button>
          )}
        </Tooltip>
      </td>
      {target && <td className={cls.target}>{target.name}</td>}
    </tr>
  );
};

export const FlowDetails: React.FC<{
  proj: ApiProject;
  components: ApiComponent[];
  readonly: boolean;
  // Events
  onNodesChange?: ReactFlowProps['onNodesChange'];
  onRelationChange: (type: 'delete' | 'update', relation: Relation) => void;
}> = ({ components, readonly, onNodesChange, onRelationChange }) => {
  const nodes = useNodes();
  const edges = useEdges<EdgeData>();

  const [component, setComponent] = useState<ApiComponent | null>(null);
  const [currNode, setNode] = useState<Node | null>(null);
  const [from, setFrom] = useState<Relation[]>([]);
  const [to, setTo] = useState<Relation[]>([]);
  const [relation, setRelation] = useState<Relation | null>(null);

  // Select Nodes / Edges
  useOnSelectionChange({
    onChange: ({ nodes: nds, edges: eds }) => {
      // Nodes
      if (nds.length === 0 || nds.length > 1) {
        // No selection or more than one
        setComponent(null);
        setNode(null);
      } else {
        // Only one
        const nd = nds[0];
        const comp = components.find((c) => c.id === nd.id)!;

        setComponent(comp);
        setNode(nd);
      }

      // Edges
      if (eds.length === 0 || eds.length > 1) {
        // No selection or more than one
        setRelation(null);
      } else {
        const edge = eds[0];
        const source = components.find((c) => c.id === edge.source);
        const target = components.find((c) => c.id === edge.target);

        setRelation({ edge, source, target });
      }
    },
  });

  // Update current node information
  // Useful if we resize or delete it in the flow
  useDebounce(
    () => {
      if (!component) {
        return;
      }

      const find = nodes.find((n) => n.id === component.id);
      if (!find) {
        return;
      }

      const comp = components.find((c) => c.id === component.id) || null;
      setComponent(comp);
      setNode(find);
    },
    150,
    [nodes, component]
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
          source: component!,
          target: components.find((c) => c.id === edge.target)!,
        });
      } else if (edge.target === currNode.id) {
        t.push({
          edge,
          source: components.find((c) => c.id === edge.source)!,
          target: component!,
        });
      }
    }

    setFrom(f);
    setTo(t);
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

  return (
    <div className={cls.composition}>
      {component && currNode && (
        <>
          <div className={cls.block}>
            <div className={cls.title}>
              Component
              {!readonly && (
                <div>
                  <Button
                    icon={<IconTrash />}
                    size="small"
                    type="ghost"
                    onClick={deleteComponent}
                  />
                </div>
              )}
            </div>
            <div className={cls.preview}>
              <PreviewNode {...currNode} />
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
