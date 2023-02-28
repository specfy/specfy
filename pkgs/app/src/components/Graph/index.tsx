import { Graph as AntGraph } from '@antv/x6';
import { IconZoomIn, IconZoomReplace, IconZoomOut } from '@tabler/icons-react';
import { Button, Tooltip } from 'antd';
import type { ApiComponent } from 'api/src/types/api';
import classnames from 'classnames';
import { useEffect, useRef, useState } from 'react';
import { useDebounce } from 'react-use';

import { useGraph } from '../../hooks/useGraph';

import { registerCustomNode } from './CustomNode';
import { componentsToGraph, highlightCell, unHighlightCell } from './helpers';
import cls from './index.module.scss';

import '@antv/x6-react-components/es/toolbar/style/index.css';

export interface GraphProps {
  components: ApiComponent[];
  readonly?: boolean;
  toolbarFull?: boolean;
}
export const Graph: React.FC<GraphProps> = ({
  components,
  readonly,
  toolbarFull,
}) => {
  const gref = useGraph();

  const container = useRef<HTMLDivElement>(null);
  const [g, setG] = useState<AntGraph>();
  const [hostsById, setHostsById] = useState<Set<string>>();

  const [revertHighlight, setRevertHighlight] = useState(false);
  const [drawed, setDrawed] = useState(false);
  const [mouseover, setMouseOver] = useState(false);

  // ---- Init
  useEffect(() => {
    const compById = new Map<string, ApiComponent>();
    const _hostsById = new Set<string>();

    for (const comp of components) {
      compById.set(comp.id, comp);
      if (comp.type === 'hosting') {
        _hostsById.add(comp.id);
      }
    }
    setHostsById(_hostsById);
  }, [components]);

  useEffect(() => {
    if (!container.current || !hostsById) {
      return;
    }

    const graph = new AntGraph({
      container: container.current,
      autoResize: true,
      grid: {
        size: 10,
        visible: true,
        type: 'dot',
        args: {
          color: '#d9d9d9',
          thickness: 1,
        },
      },
      interacting: function () {
        if (readonly) {
          return false;
        }

        return true;
      },
      background: {
        color: '#fff',
      },
      mousewheel: {
        enabled: true,
        modifiers: ['ctrl', 'meta'],
        factor: 1.03,

        minScale: 0.5,
        maxScale: 2,
      },
      panning: {
        enabled: true,
      },
      connecting: {
        router: {
          name: 'normal',
          args: {
            padding: 5,
            endDirections: ['left', 'right'],
          },
        },
        // // This one is good
        // router: {
        //   name: 'orth',
        //   args: {
        //     padding: 5,
        //     endDirections: ['left', 'right'],
        //   },
        // },
        // router: {
        //   name: 'manhattan',
        //   args: {
        //     padding: 100,
        //     startDirections: ['bottom'],
        //     endDirections: ['top'],
        //   },
        // },
        // router: {
        //   name: 'metro',
        //   args: {
        //     padding: 1,
        //     endDirections: ['left', 'right'],
        //   },
        // },
        connector: {
          name: 'smooth',
        },
      },
      translating: {
        restrict(view) {
          const cell = view!.cell;
          if (cell.isNode()) {
            const parent = cell.getParent();
            if (parent) {
              return parent.getBBox();
            }
          }

          return null;
        },
      },
    });
    setG(graph);
    gref.setRef(graph);
    registerCustomNode();

    graph.on('node:mouseenter', (args) => {
      highlightCell({
        cell: args.cell,
        container: container.current!,
        graph,
        hostsById: hostsById,
      });
      setRevertHighlight(false);
    });

    graph.on('node:mouseleave', (args) => {
      unHighlightCell({
        cell: args.cell,
        container: container.current!,
        graph,
      });
      setRevertHighlight(true);
    });

    graph.on('graph:mouseenter', () => {
      setMouseOver(true);
    });
    graph.on('graph:mouseleave', () => {
      setMouseOver(false);
    });

    // graph.use(
    //   new Scroller({
    //     enabled: true,
    //     autoResize: true,
    //     pageBreak: true,
    //     pageVisible: true,
    //     pannable: true,
    //     pageWidth: 600,
    //     pageHeight: 600,
    //   })
    // );
    componentsToGraph(graph, components);

    const cancel = setTimeout(() => {
      // console.log('on zoom');
      graph.center();
      graph.zoomToFit();
      graph.zoomTo(graph.zoom() - 0.15);
    }, 150);

    return () => {
      clearTimeout(cancel);
      graph.off();
      graph.dispose();
    };
  }, [container, hostsById, readonly]);

  // ---- Highlight
  useEffect(() => {
    if (!g) {
      return;
    }

    unHighlightCell({
      container: container.current!,
      graph: g,
      cell: gref.prevHighlight ? g.getCellById(gref.prevHighlight) : undefined,
    });
    setDrawed(true);

    let cancel: number;
    if (gref.highlight) {
      cancel = setTimeout(
        () => {
          highlightCell({
            cell: g.getCellById(gref.highlight!)!,
            container: container.current!,
            graph: g,
            hostsById: hostsById!,
          });
        },
        drawed ? 1 : 500
      );
    }
    return () => {
      clearTimeout(cancel);
    };
  }, [g, gref]);

  useDebounce(
    () => {
      if (!revertHighlight || !gref.highlight || mouseover) {
        return;
      }

      highlightCell({
        cell: g!.getCellById(gref.highlight!)!,
        container: container.current!,
        graph: g!,
        hostsById: hostsById!,
      });
    },
    100,
    [revertHighlight, mouseover]
  );

  function handleZoomIn() {
    g?.zoom(0.2);
  }
  function handleZoomOut() {
    g?.zoom(-0.2);
  }
  function handmeZoomReset() {
    g?.center();
    g?.zoomToFit();
    g?.zoomTo(g?.zoom() - 0.3);
  }

  return (
    <div className={cls.container}>
      <div className={classnames(cls.top, toolbarFull && cls.full)}>
        <div className={cls.toolbar}>
          <Tooltip title="Zoom In (Cmd +)" placement="bottom">
            <Button
              className={cls.toolbarItem}
              icon={<IconZoomIn />}
              type="text"
              onClick={handleZoomIn}
            />
          </Tooltip>
          <Tooltip title="Zoom Reset" placement="bottom">
            <Button
              className={cls.toolbarItem}
              icon={<IconZoomReplace />}
              type="text"
              onClick={handmeZoomReset}
            />
          </Tooltip>
          <Tooltip title="Zoom Out (Cmd -)" placement="bottom">
            <Button
              className={cls.toolbarItem}
              icon={<IconZoomOut />}
              type="text"
              onClick={handleZoomOut}
            />
          </Tooltip>
        </div>
      </div>
      <div style={{ width: '100%', minHeight: `100%` }} ref={container} />
    </div>
  );
};
