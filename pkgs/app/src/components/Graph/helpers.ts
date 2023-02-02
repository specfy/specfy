import type { Node, Graph as AntGraph } from '@antv/x6';
import type { ApiComponent } from 'api/src/types/api/components';

export function showPorts(ports: NodeListOf<SVGElement>, show: boolean) {
  for (let i = 0, len = ports.length; i < len; i = i + 1) {
    ports[i].style.visibility = show ? 'visible' : 'hidden';
  }
}

export function componentsToGraph(graph: AntGraph, components: ApiComponent[]) {
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
      ports: {},
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
          source: { cell: nodes.get(from)!, port: 'output' },
          target: { cell: curr, port: 'output' },
          attrs: {
            line: {
              stroke: '#a0a0a0',
              strokeWidth: 1,
              targetMarker: {
                name: 'classic',
                size: 3,
              },
              sourceMarker: {
                size: 8,
              },
            },
          },
        });
      }
    }

    // if (comp.toComponents) {
    //   for (const to of comp.toComponents) {
    //     graph.addEdge({
    //       source: { cell: curr, port: 'input' },
    //       target: { cell: nodes.get(to)!, port: 'output' },
    //       attrs: {
    //         line: {
    //           stroke: '#a0a0a0',
    //           strokeWidth: 1,
    //           targetMarker: {
    //             name: 'classic',
    //             size: 3,
    //           },
    //         },
    //       },
    //     });
    //   }
    // }
  }
}
