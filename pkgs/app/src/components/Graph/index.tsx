import { ZoomInOutlined, ZoomOutOutlined } from '@ant-design/icons';
import { Graph as AntGraph } from '@antv/x6';
import { Toolbar } from '@antv/x6-react-components';
import type { ApiComponent } from 'api/src/types/api/components';
import { useEffect, useRef } from 'react';

import './Node';
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
        router: {
          name: 'manhattan',
          args: {
            padding: 1,
          },
        },
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
        anchor: 'center',
        // connectionPoint: 'anchor',
        allowBlank: false,
        snap: {
          radius: 20,
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

    graph.on('node:mouseenter', (args) => {
      const ports =
        args.e.target!.parentElement.parentElement.parentElement.parentElement.querySelectorAll(
          '.x6-port-body'
        ) as NodeListOf<SVGElement>;

      const doNotTouch: string[] = [];
      graph.getConnectedEdges(args.node).forEach((edge) => {
        doNotTouch.push(edge.id);
        edge.attr('line/strokeDasharray', 5);
        edge.attr('line/class', cls.animateRunningLine);
        console.log(edge.getTargetCell());
      });
      graph.getEdges().forEach((edge) => {
        if (doNotTouch.includes(edge.id)) {
          return;
        }
        edge.attr('line/class', cls.hideElement);
      });
      showPorts(ports, true);
    });
    graph.on('node:mouseleave', (args) => {
      const ports =
        args.e.target!.parentElement.parentElement.parentElement.parentElement.querySelectorAll(
          '.x6-port-body'
        ) as NodeListOf<SVGElement>;
      graph.getConnectedEdges(args.node)?.forEach((edge) => {
        edge.attr('line/strokeDasharray', '');
        edge.attr('line/class', '');
      });
      graph.getEdges().forEach((edge) => {
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
      <div
        style={{ width: '100%', height: `${height || '350'}px` }}
        ref={container}
      />
    </div>
  );
};
