import { ZoomInOutlined, ZoomOutOutlined } from '@ant-design/icons';
import { Graph as AntGraph } from '@antv/x6';
import { Toolbar } from '@antv/x6-react-components';
import type { ApiComponent } from 'api/src/types/api/components';
import { useEffect, useRef, useState } from 'react';

import './CustomNode';
import '@antv/x6-react-components/es/toolbar/style/index.css';
import { useDebounce } from 'react-use';

import { componentsToGraph, highlightCell, unHighlightCell } from './helpers';

export const Graph: React.FC<{
  components: ApiComponent[];
  height?: number;
  highlight?: string;
}> = ({ components, height, highlight }) => {
  const container = useRef<HTMLDivElement>(null);
  const [g, setG] = useState<AntGraph>();
  const [hostsById, setHostsById] = useState<Set<string>>();
  const prevHighlight = useRef<string>();

  const [revertHighlight, setRevertHighlight] = useState(false);
  const [drawed, setDrawed] = useState(false);

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

    // graph.center();
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
      drawed ? 1 : 500
    );
    prevHighlight.current = highlight;
  }, [g, highlight]);

  useDebounce(
    () => {
      if (!revertHighlight) {
        return;
      }

      highlightCell({
        cell: g!.getCellById(highlight!)!,
        container: container.current!,
        graph: g!,
        hostsById: hostsById!,
      });
    },
    50,
    [revertHighlight]
  );

  return (
    <div>
      <Toolbar>
        <Toolbar.Group>
          <Toolbar.Item
            name="zoomIn"
            tooltip="Zoom In (Cmd +)"
            icon={<ZoomInOutlined />}
          />
          <Toolbar.Item
            name="zoomOut"
            tooltip="Zoom Out (Cmd -)"
            icon={<ZoomOutOutlined />}
          />
        </Toolbar.Group>
      </Toolbar>
      <div
        style={{ width: '100%', height: `${height || '350'}px` }}
        ref={container}
      />
    </div>
  );
};
