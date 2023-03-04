import { Graph as AntGraph } from '@antv/x6';
import { Keyboard } from '@antv/x6-plugin-keyboard';
import type { ApiComponent } from 'api/src/types/api';
import { useEffect, useRef, useState } from 'react';
import { useDebounce } from 'react-use';

import { useComponentsStore } from '../../common/store';
import { useGraph } from '../../hooks/useGraph';

import { registerCustomNode } from './CustomNode';
import { componentsToGraph, highlightCell, unHighlightCell } from './helpers';
import cls from './index.module.scss';

import '@antv/x6-react-components/es/toolbar/style/index.css';

export const Graph: React.FC<{
  memoize?: boolean;
  readonly?: boolean;
}> = ({ memoize, readonly }) => {
  // Data
  const [components, setComponents] = useState<ApiComponent[]>();
  const storeComponents = useComponentsStore();

  // Graph
  const gref = useGraph();

  const container = useRef<HTMLDivElement>(null);
  const [g, setG] = useState<AntGraph>();
  const [hostsById, setHostsById] = useState<Set<string>>();

  const [revertHighlight, setRevertHighlight] = useState(false);
  const [drawed, setDrawed] = useState(false);
  const [mouseover, setMouseOver] = useState(false);

  // ---- Init
  useEffect(() => {
    if (memoize && components) {
      return;
    }
    setComponents(Object.values(storeComponents.components));
  }, [storeComponents]);

  useEffect(() => {
    if (!components) {
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
      // panning: {
      //   enabled: true,
      // },
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
          if (!view) {
            return null;
          }

          const cell = view.cell;
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

    graph.use(
      new Keyboard({
        enabled: true,
      })
    );

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

    componentsToGraph(graph, components!);

    const cancel = setTimeout(() => {
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

    let cancel: any;
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

  return <div style={{ width: '100%', minHeight: `100%` }} ref={container} />;
};

export const GraphContainer: React.FC<{
  children: React.ReactElement | React.ReactElement[];
}> = ({ children }) => {
  return <div className={cls.container}>{children}</div>;
};
