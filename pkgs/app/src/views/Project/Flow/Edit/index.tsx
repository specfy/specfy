// import {
//   IconCaretRight,
//   IconCaretDown,
//   IconHistory,
// } from '@tabler/icons-react';
// import { Badge, Button, Tooltip } from 'antd';
// import type { ApiComponent, ApiProject } from 'api/src/types/api';
// import classnames from 'classnames';
// import { useCallback, useState } from 'react';

// import { useComponentsStore, useStagingStore } from '../../../common/store';
// import { useEdit } from '../../../hooks/useEdit';

import {
  IconArrowNarrowLeft,
  IconArrowNarrowRight,
  IconArrowsExchange,
} from '@tabler/icons-react';
import {
  wMin,
  wMax,
  hMax,
  hMin,
} from 'api/src/common/validators/flow.constants';
import type { ApiComponent, ApiProject } from 'api/src/types/api';
import { useEffect, useState } from 'react';
import { useDebounce } from 'react-use';
import type { Edge, Node } from 'reactflow';
import {
  useStoreApi,
  useEdges,
  useNodes,
  useOnSelectionChange,
} from 'reactflow';

import { ComputedFlow } from '../../../../components/Flow/helpers';

import cls from './index.module.scss';

/**
 * TODO: hamburger menu
 * TODO: revert should revert all sub node?
 * TODO: group/ungroup
 * TODO: clear listComponents after merge
 * TODO: load edited in other pages
 * TODO: disable highlight when transforming / moving
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
//   const isEditing = edit.isEnabled();

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

//   const updateNode = useCallback(
//     (e: Cell.EventArgs['change:*']) => {
//       //     if (!e.cell.isNode()) {
//       //       return;
//       //     }
//       //     const id = e.cell.id;
//       //     // Find related component
//       //     const comp = comps.find((c) => c.id === id);
//       //     if (!comp) {
//       //       return;
//       //     }
//       //     storeComponents.updateField(id, 'display', {
//       //       ...comp.display,
//       //       pos: { ...e.cell.position() },
//       //       size: { ...e.cell.size() },
//       //     });
//       //     return;
//     },
//     [edit]
//   );

//   // useEffect(() => {
//   //   if (!g) {
//   //     return;
//   //   }

//   //   g.unsetHighlight();
//   //   const graph = g.getRef();
//   //   if (!graph) {
//   //     return;
//   //   }

//   //   const cancel = setTimeout(() => {
//   //     g.recenter(0.4);
//   //   }, 250);

//   //   if (!isEditing) {
//   //     return;
//   //   }

//   //   // ---- PLUGIN
//   //   graph.use(
//   //     new Transform({
//   //       resizing: {
//   //         enabled: true,
//   //         minHeight: 30,
//   //         minWidth: 60,
//   //       },
//   //       rotating: false,
//   //     })
//   //   );
//   //   graph.use(
//   //     new History({
//   //       enabled: true,
//   //       beforeAddCommand: (args, event) => {
//   //         // not sure why sometimes args is correct and sometimes it's event
//   //         const type = (event || args) as any;
//   //         if (type.key === 'attrs' || type.key === 'tools') {
//   //           return false;
//   //         }
//   //         return true;
//   //       },
//   //     })
//   //   );
//   //   graph.use(
//   //     new Selection({
//   //       enabled: true,
//   //       multiple: true,
//   //       rubberband: true,
//   //       movable: true,
//   //       showNodeSelectionBox: true,
//   //     })
//   //   );

//   //   // TODO: fix this
//   //   let localSelected: ApiComponent;

//   //   graph.on('cell:change:*', (e) => {
//   //     if (
//   //       e.key !== 'size' &&
//   //       e.key !== 'position' &&
//   //       e.key !== 'vertices' &&
//   //       e.key !== 'size'
//   //     ) {
//   //       return;
//   //     }

//   //     if (e.key === 'vertices') {
//   //       updateEdge(e);
//   //     } else {
//   //       updateNode(e);
//   //     }
//   //   });

//   //   graph.on('node:change:size', (e) => {
//   //     if (!localSelected || localSelected.id !== e.cell.id) {
//   //       return;
//   //     }

//   //     setInfo({
//   //       zIndex: e.cell.zIndex || 1,
//   //       pos: { ...e.node.position() },
//   //       size: { ...e.current! },
//   //     });
//   //   });

//   //   graph.on('node:change:position', (e) => {
//   //     if (!localSelected || localSelected.id !== e.cell.id) {
//   //       return;
//   //     }

//   //     setInfo({
//   //       zIndex: e.cell.zIndex || 1,
//   //       size: { ...e.node.size() },
//   //       pos: { ...e.current! },
//   //     });
//   //   });

//   //   graph.on('node:mousedown', (e) => {
//   //     const found = comps.find((comp) => comp.id === e.cell.id);
//   //     if (!found) {
//   //       return;
//   //     }

//   //     setSelected(found);
//   //     localSelected = found;
//   //     setInfo({
//   //       zIndex: e.cell.zIndex || 1,
//   //       pos: { ...e.cell.position(), ...e.cell.size() },
//   //     });
//   //   });

//   //   graph.on('edge:mouseenter', ({ cell }) => {
//   //     cell.setTools([
//   //       {
//   //         name: 'vertices',
//   //         args: {
//   //           snapRadius: 1,
//   //           removeRedundancies: false,
//   //           attrs: { fill: '#7dd3fc', r: 4, 'stroke-width': 1 },
//   //         },
//   //       },
//   //     ]);
//   //   });

//   //   graph.on('edge:mouseleave', ({ cell }) => {
//   //     cell.removeTools();
//   //   });

//   //   return () => {
//   //     clearTimeout(cancel);
//   //   };
//   // }, [g, isEditing]);

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

//   // // Size change
//   const handleSize = (type: 'height' | 'width', value: string) => {
//     //   if (!selected || !info) {
//     //     return;
//     //   }
//     //   const cell = g.getRef()?.getCellById(selected!.id);
//     //   if (!cell) {
//     //     return;
//     //   }
//     //   const replace = {
//     //     ...info,
//     //     pos: { ...info.pos, [type]: parseInt(value) || 0 },
//     //   };
//     //   if (cell.isNode()) {
//     //     cell.setSize({ height: replace.size.height, width: replace.size.width });
//     //   }
//     //   setInfo(replace);
//   };

//   const handleHideShow = () => {
//     //   setHide(!hide);
//   };

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

const EdgeRelation: React.FC<{
  edge: Edge;
  source: ApiComponent;
  target: ApiComponent;
}> = ({ edge, source, target }) => {
  return (
    <div className={cls.relation}>
      {source.name}

      {edge.data.write && edge.data.read && (
        <div className={cls.direction}>
          <IconArrowsExchange />
          <span className={cls.english}>read/write</span>
        </div>
      )}
      {!edge.data.write && edge.data.read && (
        <div className={cls.direction}>
          <IconArrowNarrowLeft />
          <span className={cls.english}>read</span>
        </div>
      )}
      {edge.data.write && !edge.data.read && (
        <div className={cls.direction}>
          <IconArrowNarrowRight />
          <span className={cls.english}>write</span>
        </div>
      )}
      {target.name}
    </div>
  );
};

export const FlowEdit: React.FC<{
  proj: ApiProject;
  components: ApiComponent[];
}> = ({ components }) => {
  const store = useStoreApi();
  const nodes = useNodes();
  const edges = useEdges();

  const [component, setComponent] = useState<ApiComponent | null>(null);
  const [edge, setEdge] = useState<Edge | null>(null);
  const [node, setNode] = useState<Node | null>(null);
  const [relation, setRelation] = useState<
    Array<{ edge: Edge; source: ApiComponent; target: ApiComponent }>
  >([]);
  const [source, setSource] = useState<ApiComponent | null>(null);
  const [target, setTarget] = useState<ApiComponent | null>(null);

  // Node Display
  const [editingDimensions, setEditingDimensions] = useState<boolean>(false);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);

  // Select Nodes / Edges
  useOnSelectionChange({
    onChange: ({ nodes: nds, edges: eds }) => {
      if (nds.length <= 0 || nds.length > 1) {
        setComponent(null);
        setNode(null);

        if (eds.length <= 0 || eds.length > 1) {
          return;
        }

        const fEdge = eds[0];
        const fSource = components.find((c) => c.id === fEdge.source) || null;
        const fTarget = components.find((c) => c.id === fEdge.target) || null;

        setEdge(fEdge);
        setSource(fSource);
        setTarget(fTarget);
        return;
      }

      const find = nds[0];
      const comp = components.find((c) => c.id === find.id) || null;

      setEdge(null);
      setComponent(comp);
      setNode(find);
      setWidth(find.width || wMin);
      setHeight(find.height || hMin);
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
      if (!editingDimensions) {
        setWidth(find.width || wMin);
        setHeight(find.height || hMin);
      }
    },
    150,
    [nodes, component]
  );

  // List relations of a node
  useEffect(() => {
    if (!node) {
      setRelation([]);
      return;
    }

    const list = edges
      .filter((edg) => {
        return edg.source === node.id || edg.target === node.id;
      })
      .map((edg) => {
        return {
          edge: edg,
          source: components.find((c) => c.id === edg.source)!,
          target: components.find((c) => c.id === edg.target)!,
        };
      });

    setRelation(list);
  }, [node]);

  // Update node dimensions
  useEffect(() => {
    if (!node || !width || !height) {
      return;
    }

    store.getState().triggerNodeChanges([
      {
        id: node.id,
        type: 'dimensions',
        updateStyle: true,
        resizing: true,
        dimensions: {
          width: Math.min(wMax, Math.max(wMin, width)),
          height: Math.min(hMax, Math.max(hMin, height)),
        },
      },
    ]);
  }, [width, height]);

  return (
    <div className={cls.composition}>
      {component && node && (
        <div className={cls.block}>
          <div className={cls.title}>{component.name}</div>
          <div className={cls.inside}>
            <div className={cls.xy}>
              <div>x: {node.position.x.toFixed(0)}</div>
              <div>y: {node.position.y.toFixed(0)}</div>
            </div>
            <div>
              <div className={cls.label}>Size</div>
              <div className={cls.inputs}>
                Width
                <input
                  className={cls.input}
                  value={width}
                  onChange={(e) => {
                    setEditingDimensions(true);
                    setWidth(parseInt(e.target.value, 10) || 0);
                  }}
                  onBlur={() => setEditingDimensions(false)}
                />
                Height
                <input
                  className={cls.input}
                  value={height}
                  onChange={(e) => {
                    setEditingDimensions(true);
                    setHeight(parseInt(e.target.value, 10) || 0);
                  }}
                  onBlur={() => setEditingDimensions(false)}
                />
              </div>
            </div>
            <div>
              <div className={cls.label}>Relations</div>
              <div className={cls.relations}>
                {relation.map((rel) => {
                  return <EdgeRelation key={rel.edge.id} {...rel} />;
                })}
                {relation.length <= 0 && (
                  <div className={cls.empty}>Empty...</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {edge && (
        <div className={cls.block}>
          <div className={cls.title}>Edge</div>
          <div className={cls.inside}>
            <EdgeRelation
              key={edge.id}
              edge={edge}
              source={source!}
              target={target!}
            />
          </div>
        </div>
      )}
    </div>
  );
};
