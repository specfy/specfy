import type { Cell } from '@antv/x6';
import { History } from '@antv/x6-plugin-history';
import { Selection } from '@antv/x6-plugin-selection';
import { Transform } from '@antv/x6-plugin-transform';
import {
  IconCaretRight,
  IconCaretDown,
  IconHistory,
} from '@tabler/icons-react';
import { Badge, Button, Tooltip } from 'antd';
import type { ApiComponent, ApiProject } from 'api/src/types/api';
import classnames from 'classnames';
import { useCallback, useEffect, useState } from 'react';
import { useDebounce } from 'react-use';

import { useComponentsStore, useStagingStore } from '../../../common/store';
import { useEdit } from '../../../hooks/useEdit';
import { useGraph } from '../../../hooks/useGraph';

import cls from './edit.module.scss';

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
export const GraphEdit: React.FC<{
  proj: ApiProject;
  comps: ApiComponent[];
}> = ({ comps }) => {
  const storeComponents = useComponentsStore();
  const storeStaging = useStagingStore(); // TODO: it is probably triggering too many render
  const g = useGraph();

  // Edit mode
  const edit = useEdit();
  const isEditing = edit.isEnabled();

  // UI
  const [selected, setSelected] = useState<ApiComponent>();
  const [info, setInfo] = useState<ApiComponent['display']>();
  const [changed, setChanged] = useState<ApiComponent[]>([]);
  const [hide, setHide] = useState<boolean>(true);

  // This function is outside because it requires "edit" ref
  const updateEdge = useCallback(
    (e: Cell.EventArgs['change:*']) => {
      if (!e.cell.isEdge()) {
        return;
      }

      const id = e.cell.getSourceCellId()!;
      const targetId = e.cell.getTargetCellId()!;

      // Find related component
      const comp = comps.find((c) => c.id === id);
      if (!comp) {
        return;
      }

      // Because objects are read only we copy, modify and apply the modification in zustand again
      const edges: ApiComponent['edges'] = JSON.parse(
        JSON.stringify(comp.edges)
      );
      const edge = edges.find((ed) => ed.to === targetId);
      if (!edge) {
        return;
      }

      edge.vertices = e.current;
      storeComponents.updateField(comp.id, 'edges', edges);
      return;
    },
    [edit]
  );

  const updateNode = useCallback(
    (e: Cell.EventArgs['change:*']) => {
      if (!e.cell.isNode()) {
        return;
      }

      const id = e.cell.id;
      // Find related component
      const comp = comps.find((c) => c.id === id);
      if (!comp) {
        return;
      }

      storeComponents.updateField(id, 'display', {
        ...comp.display,
        pos: { ...e.cell.position() },
        size: { ...e.cell.size() },
      });
      return;
    },
    [edit]
  );

  useEffect(() => {
    if (!g) {
      return;
    }

    g.unsetHighlight();
    const graph = g.getRef();
    if (!graph) {
      return;
    }

    const cancel = setTimeout(() => {
      g.recenter(0.4);
    }, 250);

    if (!isEditing) {
      return;
    }

    // ---- PLUGIN
    graph.use(
      new Transform({
        resizing: {
          enabled: true,
          minHeight: 30,
          minWidth: 60,
        },
        rotating: false,
      })
    );
    graph.use(
      new History({
        enabled: true,
        beforeAddCommand: (args, event) => {
          // not sure why sometimes args is correct and sometimes it's event
          const type = (event || args) as any;
          if (type.key === 'attrs' || type.key === 'tools') {
            return false;
          }
          return true;
        },
      })
    );
    graph.use(
      new Selection({
        enabled: true,
        multiple: true,
        rubberband: true,
        movable: true,
        showNodeSelectionBox: true,
      })
    );

    // TODO: fix this
    let localSelected: ApiComponent;

    graph.on('cell:change:*', (e) => {
      if (
        e.key !== 'size' &&
        e.key !== 'position' &&
        e.key !== 'vertices' &&
        e.key !== 'size'
      ) {
        return;
      }

      if (e.key === 'vertices') {
        updateEdge(e);
      } else {
        updateNode(e);
      }
    });

    graph.on('node:change:size', (e) => {
      if (!localSelected || localSelected.id !== e.cell.id) {
        return;
      }

      setInfo({
        zIndex: e.cell.zIndex || 1,
        pos: { ...e.node.position() },
        size: { ...e.current! },
      });
    });

    graph.on('node:change:position', (e) => {
      if (!localSelected || localSelected.id !== e.cell.id) {
        return;
      }

      setInfo({
        zIndex: e.cell.zIndex || 1,
        size: { ...e.node.size() },
        pos: { ...e.current! },
      });
    });

    graph.on('node:mousedown', (e) => {
      const found = comps.find((comp) => comp.id === e.cell.id);
      if (!found) {
        return;
      }

      setSelected(found);
      localSelected = found;
      setInfo({
        zIndex: e.cell.zIndex || 1,
        pos: { ...e.cell.position(), ...e.cell.size() },
      });
    });

    graph.on('edge:mouseenter', ({ cell }) => {
      cell.setTools([
        {
          name: 'vertices',
          args: {
            snapRadius: 1,
            removeRedundancies: false,
            attrs: { fill: '#7dd3fc', r: 4, 'stroke-width': 1 },
          },
        },
      ]);
    });

    graph.on('edge:mouseleave', ({ cell }) => {
      cell.removeTools();
    });

    return () => {
      clearTimeout(cancel);
    };
  }, [g, isEditing]);

  // Debounce change registry
  useDebounce(
    () => {
      const json = g.getRef()?.toJSON();
      if (!json) {
        return;
      }

      const tmp: ApiComponent[] = [];
      for (const cell of Object.values(json.cells)) {
        const comp = comps.find((c) => c.id === cell.id);
        if (!comp) {
          continue;
        }

        const has = storeStaging.diffs.find(
          (clean) =>
            clean.blob.type === 'component' && clean.blob.typeId === comp.id
        );
        if (!has || has.blob.deleted) {
          continue;
        }

        tmp.push(comp);
      }

      setChanged(tmp);
    },
    200,
    [storeStaging]
  );

  // Size change
  const handleSize = (type: 'height' | 'width', value: string) => {
    if (!selected || !info) {
      return;
    }

    const cell = g.getRef()?.getCellById(selected!.id);
    if (!cell) {
      return;
    }

    const replace = {
      ...info,
      pos: { ...info.pos, [type]: parseInt(value) || 0 },
    };

    if (cell.isNode()) {
      cell.setSize({ height: replace.size.height, width: replace.size.width });
    }

    setInfo(replace);
  };

  const handleHideShow = () => {
    setHide(!hide);
  };

  const handleRevert = (id: string) => {
    const graph = g.getRef();
    if (!graph) {
      return;
    }

    const find = storeStaging.diffs.find((comp) => comp.blob.typeId === id);
    const cell = graph.getCellById(id);
    if (!find || !cell) {
      return;
    }

    if (cell.isNode()) {
      graph.batchUpdate(() => {
        if (!find.blob.previous || find.blob.type === 'document') {
          return;
        }

        cell.setSize({ ...find.blob.previous.display.size });
        cell.setPosition({ ...find.blob.previous.display.pos });
        const outgoing = graph.getOutgoingEdges(cell);

        if (!outgoing) {
          return;
        }

        outgoing.forEach((edge) => {
          if (!find.blob.previous || find.blob.type === 'document') {
            return;
          }

          const old = find.blob.previous.edges.find(
            (prev) => prev.to === edge.getTargetCellId()
          );
          edge.setVertices(old!.vertices);
        });
      });
    }
  };

  return (
    <div className={cls.composition}>
      {selected && info && (
        <div className={cls.block}>
          <div className={cls.title}>{selected.name}</div>
          <div className={cls.inside}>
            <div className={cls.xy}>
              <div>x: {info.pos.x.toFixed(0)}</div>
              <div>y: {info.pos.y.toFixed(0)}</div>
            </div>
            <div>
              <div className={cls.label}>Size</div>
              <div className={cls.inputs}>
                Width
                <input
                  className={cls.input}
                  value={info.size.width}
                  onChange={(e) => {
                    handleSize('width', e.target.value);
                  }}
                />
                Height
                <input
                  className={cls.input}
                  value={info.size.height}
                  onChange={(e) => {
                    handleSize('height', e.target.value);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {isEditing && changed.length > 0 && (
        <div className={cls.block}>
          <div
            className={classnames(cls.title, cls.toggle)}
            onClick={handleHideShow}
          >
            <div className={cls.titleLeft}>
              <div>{hide ? <IconCaretRight /> : <IconCaretDown />}</div>
              Changes
            </div>
            <Badge count={changed.length} color="#9ca3af" />
          </div>
          {!hide && (
            <div className={classnames(cls.inside, cls.change)}>
              {changed.map((comp) => {
                return (
                  <div key={comp.id}>
                    {comp!.name}
                    <Tooltip title="Revert">
                      <Button
                        type="text"
                        size="small"
                        icon={<IconHistory />}
                        onClick={() => handleRevert(comp.id)}
                      />
                    </Tooltip>
                  </div>
                );
              })}
              {changed.length <= 0 && 'No changes...'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
