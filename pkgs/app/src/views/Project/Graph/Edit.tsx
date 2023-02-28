import {
  CaretRightOutlined,
  CaretDownOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import { Badge, Button, Tooltip } from 'antd';
import type { ApiComponent, ApiProject } from 'api/src/types/api';
import classnames from 'classnames';
import { useEffect, useState } from 'react';
import { useDebounce } from 'react-use';

import { useEdit } from '../../../hooks/useEdit';
import { useGraph } from '../../../hooks/useGraph';

import cls from './index.module.scss';

export const GraphEdit: React.FC<{
  proj: ApiProject;
  comps: ApiComponent[];
}> = ({ comps }) => {
  const g = useGraph();

  // Edit mode
  const edit = useEdit();
  const isEditing = edit.isEnabled();

  // UI
  const [selected, setSelected] = useState<ApiComponent>();
  const [info, setInfo] = useState<ApiComponent['display']>();
  const [changed, setChanged] = useState<string[]>([]);
  const [hide, setHide] = useState<boolean>(true);

  useEffect(() => {
    if (!g) {
      return;
    }

    const graph = g.getRef();
    if (!graph) {
      return;
    }

    const cancel = setTimeout(() => {
      g.recenter(0.4);
    }, 250);

    graph.on('cell:change:*', (e) => {
      if (e.key !== 'size' && e.key !== 'position' && e.key !== 'vertices') {
        return;
      }

      setChanged((old) => {
        if (old.includes(e.cell.id)) {
          return old;
        }
        return [...old, e.cell.id];
      });
    });

    graph.on('node:change:position', (e) => {
      if (!selected || selected.id !== e.cell.id) {
        return;
      }

      setInfo({
        zIndex: e.cell.zIndex || 1,
        pos: { ...e.node.size(), ...e.current },
      });
    });

    graph.on('node:mousedown', (e) => {
      const found = comps.find((comp) => comp.id === e.cell.id);
      setSelected(found);
      setInfo({
        zIndex: e.cell.zIndex || 1,
        pos: { ...e.cell.position(), ...e.cell.size() },
      });
    });

    graph.on('node:dblclick', ({ node }) => {
      node.setTools([
        {
          name: 'node-editor',
        },
      ]);
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

      for (const cell of Object.values(json.cells)) {
        if (!changed.includes(cell.id!)) {
          continue;
        }
        const comp = comps.find((c) => c.id === cell.id);
        if (!comp) {
          continue;
        }

        const ec = edit.get('component', comp.id, comp);
        ec.set('display' as any, {
          ...comp.display,
          pos: { ...cell.position, ...cell.size },
        });
      }
    },
    500,
    [changed]
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
      cell.setSize({ height: replace.pos.height, width: replace.pos.width });
    }
    setInfo(replace);
  };

  const handleHideShow = () => {
    setHide(!hide);
  };
  const handleRevert = (id: string) => {
    const find = edit.changes.find((comp) => comp.typeId === id);
    const cell = g.getRef()?.getCellById(id);
    if (!find || !cell) {
      return;
    }

    if (cell.isNode()) {
      cell.setSize({ ...find.previous.display.pos });
      cell.setPosition({ ...find.previous.display.pos });
      setChanged(changed.filter((changedId) => changedId !== id));
    }
  };

  return (
    <div className={cls.composition}>
      {selected && info && (
        <div className={cls.block}>
          <div className={cls.title}>{selected.name}</div>
          <div className={cls.inside}>
            <div className={cls.xy}>
              <div>x: {info.pos.x}</div>
              <div>y: {info.pos.y}</div>
            </div>
            <div>
              <div className={cls.label}>Size</div>
              <div className={cls.inputs}>
                <input
                  className={cls.input}
                  value={info.pos.width}
                  onChange={(e) => {
                    handleSize('width', e.target.value);
                  }}
                />
                <span>x</span>
                <input
                  className={cls.input}
                  value={info.pos.height}
                  onChange={(e) => {
                    handleSize('height', e.target.value);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {isEditing && (
        <div className={cls.block}>
          <div
            className={classnames(cls.title, cls.toggle)}
            onClick={handleHideShow}
          >
            <div className={cls.titleLeft}>
              <div>{hide ? <CaretRightOutlined /> : <CaretDownOutlined />}</div>
              Changes
            </div>
            <Badge count={changed.length} color="#9ca3af" />
          </div>
          {!hide && (
            <div className={classnames(cls.inside, cls.change)}>
              {changed.map((id) => {
                const comp = comps.find((c) => c.id === id);
                return (
                  <div key={id}>
                    {comp!.name}
                    <Tooltip title="Revert">
                      <Button
                        type="text"
                        size="small"
                        icon={<HistoryOutlined />}
                        onClick={() => handleRevert(id)}
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
