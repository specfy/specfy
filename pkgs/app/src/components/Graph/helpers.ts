import type { Node, Cell, Graph as AntGraph } from '@antv/x6';
import type { ApiComponent } from 'api/src/types/api';

import cls from './index.module.scss';

export type ComponentForGraph = Pick<
  ApiComponent,
  'display' | 'edges' | 'id' | 'inComponent' | 'name' | 'type'
>;

export function showPorts(ports: NodeListOf<SVGElement>, show: boolean) {
  for (let i = 0, len = ports.length; i < len; i = i + 1) {
    ports[i].style.visibility = show ? 'visible' : 'hidden';
  }
}

export function componentsToGraph(
  graph: AntGraph,
  components: ComponentForGraph[]
) {
  const nodes = new Map<string, Node<Node.Properties>>();
  const compById = new Map<string, ComponentForGraph>();

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

export function highlightCell({
  graph,
  cell,
  container,
  hostsById,
}: {
  graph: AntGraph;
  cell: Cell;
  container: HTMLDivElement;
  hostsById: Set<string>;
}) {
  if (cell?.getData().type === 'hosting') {
    return;
  }

  const $node = container.querySelector(`.x6-cell[data-cell-id="${cell.id}"]`);
  if (!$node) {
    return;
  }

  const ports = $node.querySelectorAll<SVGElement>('.x6-port-body');

  const cellsHighlighted = new Set<string>([cell.id]);

  graph.batchUpdate(() => {
    graph.getConnectedEdges(cell).forEach((edge) => {
      // doNotTouch.push(edge.id);
      let animation = cls.animateRunningLine;
      const data = edge.data.db;
      if (!data.write) {
        animation = cls.animateRunningLineReverse;
      } else if (data.write && data.read) {
        animation = cls.animateExchangeLine;
      }

      // Highlight other nodes from/to this node
      const tmpTarget = edge.getTargetCell()!;
      const tmpSource = edge.getSourceCell()!;
      cellsHighlighted.add(edge.id);
      cellsHighlighted.add(tmpTarget.id);
      cellsHighlighted.add(tmpSource.id);

      // Keep all related hosts highlighted
      hostsById.forEach((id) => {
        const host = graph.getCellById(id);
        if (host.contains(tmpTarget)) {
          cellsHighlighted.add(id);
        } else if (host.contains(tmpSource)) {
          cellsHighlighted.add(id);
        }
      });

      edge.attr('line/strokeDasharray', 5);
      edge.attr('line/class', animation);
      // edge.setLabels(
      //   edge.getLabels().map((label, i) => {
      //     edge.removeLabelAt(i);
      //     label.attrs!.body.visibility = 'visible';
      //     label.attrs!.label.visibility = 'visible';
      //     return label;
      //   })
      // );
    });

    container.querySelectorAll('.x6-cell').forEach((cel) => {
      const id = cel.dataset.cellId;
      if (cellsHighlighted.has(id)) {
        return;
      }

      const tmp = graph.getCellById(id);
      if (tmp && tmp.getData()?.type === 'hosting') {
        if (tmp.contains(cell)) {
          return;
        }
      }
      cel.classList.add(cls.hideElement);
    });

    showPorts(ports, true);
  });
}

export function unHighlightCell({
  graph,
  cell,
  container,
}: {
  graph: AntGraph;
  container: HTMLDivElement;
  cell?: Cell;
}) {
  graph.batchUpdate(() => {
    if (cell) {
      const $node = container.querySelector(
        `.x6-cell[data-cell-id="${cell.id}"]`
      );
      if (!$node) {
        return;
      }

      const ports = $node.querySelectorAll<SVGElement>('.x6-port-body');

      graph.getConnectedEdges(cell)?.forEach((edge) => {
        edge.attr('line/strokeDasharray', '');
        edge.attr('line/class', '');
      });
      showPorts(ports, false);
    }

    container.querySelectorAll('.x6-cell').forEach((cel) => {
      cel.classList.remove(cls.hideElement);
    });
  });
}
