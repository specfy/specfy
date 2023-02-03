import { ZoomInOutlined, ZoomOutOutlined } from '@ant-design/icons';
import { Graph as AntGraph } from '@antv/x6';
import { Toolbar } from '@antv/x6-react-components';
import type { ApiComponent } from 'api/src/types/api/components';
import { useEffect, useRef } from 'react';

import './CustomNode';
import '@antv/x6-react-components/es/toolbar/style/index.css';
import { componentsToGraph, showPorts } from './helpers';
import cls from './index.module.scss';

export const Graph: React.FC<{
  components: ApiComponent[];
  height?: number;
}> = ({ components, height }) => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) {
      return;
    }

    const compById = new Map<string, ApiComponent>();
    const hostsById = new Set<string>();

    for (const comp of components) {
      compById.set(comp.id, comp);
      if (comp.type === 'hosting') {
        hostsById.add(comp.id);
      }
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

    graph.on('node:mouseenter', (args) => {
      if (args.cell?.getData().type === 'hosting') {
        return;
      }

      const ports =
        args.e.target.parentElement.parentElement.parentElement.parentElement.querySelectorAll(
          '.x6-port-body'
        ) as NodeListOf<SVGElement>;

      const cellsHighlighted = new Set<string>([args.cell.id]);

      graph.getConnectedEdges(args.node).forEach((edge) => {
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
        hosts.forEach((id) => {
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

      container.current?.querySelectorAll('.x6-cell').forEach((cell) => {
        const id = cell.dataset.cellId;
        if (cellsHighlighted.has(id)) {
          return;
        }

        const tmp = graph.getCellById(id);
        if (tmp && tmp.getData()?.type === 'hosting') {
          if (tmp.contains(args.cell)) {
            return;
          }
        }
        cell.classList.add(cls.hideElement);
      });

      showPorts(ports, true);
    });

    graph.on('node:mouseleave', (args) => {
      const ports =
        args.e.target!.parentElement.parentElement.parentElement.parentElement.querySelectorAll(
          '.x6-port-body'
        ) as NodeListOf<SVGElement>;

      container.current?.querySelectorAll('.x6-cell').forEach((cell) => {
        cell.classList.remove(cls.hideElement);
      });
      graph.getConnectedEdges(args.node)?.forEach((edge) => {
        edge.attr('line/strokeDasharray', '');
        edge.attr('line/class', '');
      });
      showPorts(ports, false);
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
