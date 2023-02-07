import { ZoomInOutlined, ZoomOutOutlined } from '@ant-design/icons';
import { Graph as AntGraph } from '@antv/x6';
import { Button, Tooltip } from 'antd';
import type { ApiComponent } from 'api/src/types/api/components';
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { useDebounce } from 'react-use';

import { registerCustomNode } from './CustomNode';
import { componentsToGraph, highlightCell, unHighlightCell } from './helpers';
import cls from './index.module.scss';

import '@antv/x6-react-components/es/toolbar/style/index.css';

export interface GraphProps {
  components: ApiComponent[];
  highlight?: string;
}
export interface GraphRef {
  recenter: () => void;
}

export const Graph = forwardRef<GraphRef, GraphProps>(function Graph(
  { components, highlight },
  ref
) {
  const container = useRef<HTMLDivElement>(null);
  const [g, setG] = useState<AntGraph>();
  const [hostsById, setHostsById] = useState<Set<string>>();
  const prevHighlight = useRef<string>();

  const [revertHighlight, setRevertHighlight] = useState(false);
  const [drawed, setDrawed] = useState(false);
  const [mouseover, setMouseOver] = useState(false);

  useImperativeHandle(
    ref,
    () => {
      return {
        recenter: () => {
          if (!g) return;

          g!.zoomToFit();
          g!.zoomTo(g!.zoom() - 0.1);
        },
      };
    },
    [g]
  );

  useEffect(() => {
    if (!container.current) {
      return;
    }

    const compById = new Map<string, ApiComponent>();
    const _hostsById = new Set<string>();

    for (const comp of components) {
      compById.set(comp.id, comp);
      if (comp.type === 'hosting') {
        _hostsById.add(comp.id);
      }
    }
    setHostsById(_hostsById);

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
        // // This one is good
        // router: {
        //   name: 'orth',
        //   args: {
        //     padding: 5,
        //   },
        // },
        // router: {
        //   name: 'er',
        //   args: {
        //     offset: 40,
        //   },
        // },
        // router: {
        //   name: 'manhattan',
        //   args: {
        //     padding: 1,
        //     endDirections: ['left', 'right'],
        //   },
        // },
        router: {
          name: 'metro',
          args: {
            endDirections: ['left', 'right'],
          },
        },
        connector: {
          name: 'rounded',
        },
        // anchor: 'center',
        // connectionPoint: 'anchor',
        // allowBlank: false,
        // snap: {
        //   radius: 20,
        // },
      },
      // translating: {
      //   restrict(view) {
      //     const cell = view!.cell;
      //     if (cell.isNode()) {
      //       const parent = cell.getParent();
      //       if (parent) {
      //         return parent.getBBox();
      //       }
      //     }

      //     return null;
      //   },
      // },
    });
    setG(graph);
    registerCustomNode();

    graph.on('node:mouseenter', (args) => {
      highlightCell({
        cell: args.cell,
        container: container.current!,
        graph,
        hostsById: _hostsById,
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

    graph.center();
    graph.zoomToFit();
    graph.zoomTo(graph.zoom() - 0.1);

    return () => {
      graph.off();
    };
  }, [container, components]);

  useEffect(() => {
    if (!g || !highlight) {
      return;
    }

    unHighlightCell({
      container: container.current!,
      graph: g,
      cell: prevHighlight.current
        ? g.getCellById(prevHighlight.current)
        : undefined,
    });
    setDrawed(true);
    setTimeout(
      () => {
        highlightCell({
          cell: g.getCellById(highlight)!,
          container: container.current!,
          graph: g,
          hostsById: hostsById!,
        });
      },
      drawed ? 100 : 500
    );
    prevHighlight.current = highlight;
  }, [g, highlight]);

  useDebounce(
    () => {
      if (!revertHighlight || !highlight || mouseover) {
        return;
      }

      highlightCell({
        cell: g!.getCellById(highlight!)!,
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

  return (
    <div className={cls.container}>
      <div className={cls.toolbar}>
        <Tooltip title="Zoom In (Cmd +)" placement="bottom">
          <Button
            className={cls.toolbarItem}
            icon={<ZoomInOutlined />}
            type="text"
            onClick={handleZoomIn}
          />
        </Tooltip>
        <Tooltip title="Zoom Out (Cmd -)" placement="bottom">
          <Button
            className={cls.toolbarItem}
            icon={<ZoomOutOutlined />}
            type="text"
            onClick={handleZoomOut}
          />
        </Tooltip>
      </div>
      <div style={{ width: '100%', height: `350px` }} ref={container} />
    </div>
  );
});
