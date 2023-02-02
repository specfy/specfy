import { ZoomInOutlined, ZoomOutOutlined } from '@ant-design/icons';
import type { Node } from '@antv/x6';
import { Graph as AntGraph } from '@antv/x6';
import { Toolbar } from '@antv/x6-react-components';
import type { ApiComponent } from 'api/src/types/api/components';
import { useEffect, useRef } from 'react';

import './Node';
import '@antv/x6-react-components/es/toolbar/style/index.css';

function componentsToGraph(graph: AntGraph, components: ApiComponent[]) {
  const nodes = new Map<string, Node<Node.Properties>>();
  // const copy = components.slice(0);

  // Create all nodes

  for (const comp of components) {
    const node = graph.addNode({
      ...comp.display.pos,
      zIndex: comp.display.zIndex || 1,
      label: comp.name,
      shape: 'custom-node',
      data: {
        type: comp.type,
      },
      ports: {
        groups: {
          left: {
            position: 'left',
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: '#C2C8D5',
                strokeWidth: 1,
                fill: '#fff',
              },
            },
          },
          bottom: {
            position: 'bottom',
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: '#C2C8D5',
                strokeWidth: 1,
                fill: '#fff',
              },
            },
          },
        },
      },
      attrs: {
        label: {},
        body: {
          rx: 3,
          ry: 3,
          strokeWidth: 1,
        },
      },
    });
    nodes.set(comp.id, node);
  }

  // Link all nodes
  for (const comp of components) {
    const curr = nodes.get(comp.id)!;

    // Group
    if (comp.inComponent) {
      nodes.get(comp.inComponent)!.addChild(curr);
    }

    // Arrows
    // if (true == 1) {
    //   continue;
    // }
    if (comp.fromComponents) {
      for (const from of comp.fromComponents) {
        graph.addEdge({
          source: nodes.get(from)!,
          target: curr,
          attrs: {
            line: {
              stroke: '#a0a0a0',
              strokeWidth: 1,
              targetMarker: {
                name: 'classic',
                size: 3,
              },
            },
          },
        });
      }
    }

    if (comp.toComponents) {
      for (const to of comp.toComponents) {
        graph.addEdge({
          source: curr,
          target: nodes.get(to)!,
          attrs: {
            line: {
              stroke: '#a0a0a0',
              strokeWidth: 1,
              targetMarker: {
                name: 'classic',
                size: 3,
              },
            },
          },
        });
      }
    }
  }
}

export const Graph: React.FC<{ components: ApiComponent[] }> = ({
  components,
}) => {
  const container = useRef(null);

  useEffect(() => {
    if (!container.current) {
      return;
    }

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
        // router: {
        // name: 'metro',
        // args: {
        // startDirections: ['bottom'],
        // endDirections: ['top'],
        // },
        // },
        connector: {
          name: 'rounded',
        },
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
    graph.zoomTo(graph.zoom() - 0.05);
    // console.log(graph.zoom());
  }, [container, components]);

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
      <div style={{ width: '100%', height: '350px' }} ref={container} />
    </div>
  );
};
