import type { Node, Graph as AntGraph } from '@antv/x6';
import type { ApiComponent } from 'api/src/types/api/components';

export function showPorts(ports: NodeListOf<SVGElement>, show: boolean) {
  for (let i = 0, len = ports.length; i < len; i = i + 1) {
    ports[i].style.visibility = show ? 'visible' : 'hidden';
  }
}

export function componentsToGraph(graph: AntGraph, components: ApiComponent[]) {
  const nodes = new Map<string, Node<Node.Properties>>();
  const compById = new Map<string, ApiComponent>();

  // Create all nodes
  for (const comp of components) {
    compById.set(comp.id, comp);
    const node = graph.addNode({
      id: comp.id,
      ...comp.display.pos,
      zIndex: comp.display.zIndex || 1,
      label: comp.name,
      shape: 'custom-node',
      data: {
        id: comp.id,
        type: comp.type,
      },
      ports: {},
      attrs: {
        label: {},
        body: {
          strokeWidth: 1,
        },
      },
    });
    nodes.set(comp.id, node);
  }

  // Link all nodes
  let id = 0;
  for (const comp of components) {
    const curr = nodes.get(comp.id)!;

    // Group
    if (comp.inComponent) {
      nodes.get(comp.inComponent)!.addChild(curr);
    }

    for (const edge of comp.edges) {
      id += 1;
      const targetComp = compById.get(edge.to)!;
      const wr = `${edge.read ? 'r' : ''}-${edge.write ? 'w' : ''}`;
      const idPort = `port-${id}-${edge.portSource}-${wr}`;
      const idPortTarget = `port-${edge.portTarget}-${wr}`;
      const target = nodes.get(edge.to)!;
      if (!curr.getPort(idPort)) {
        curr.addPort({ id: idPort, group: edge.portSource });
      }
      if (!target.getPort(idPortTarget)) {
        target.addPort({ id: idPortTarget, group: edge.portTarget });
      }

      const label = [];
      if (edge.read) label.push('Read');
      if (edge.write) label.push('Write');
      graph.addEdge({
        source: { cell: curr, port: idPort },
        target: { cell: target, port: idPortTarget },
        vertices: edge.vertices,
        data: { db: edge },
        attrs: {
          line: {
            stroke: targetComp.type === 'thirdparty' ? '#d3adf7' : '#a0a0a0',
            strokeWidth: 1,
            sourceMarker: {
              name: edge.read ? 'classic' : null,
              size: 3,
            },
            targetMarker: {
              name: edge.write ? 'classic' : null,
              size: 3,
            },
          },
        },
        labels: [
          {
            attrs: {
              label: {
                text: label.join('/'),
                visibility: 'hidden',
                textAnchor: 'middle',
                textVerticalAnchor: 'middle',
              },
              body: {
                visibility: 'hidden',
              },
            },
            position: {
              distance: 0.75,
              offset: {},
              options: {},
            },
          },
        ],
      });
    }
  }
}
