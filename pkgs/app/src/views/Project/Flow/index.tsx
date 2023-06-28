import { LoadingOutlined } from '@ant-design/icons';
import { computeLayout } from '@specfy/api/src/common/flow/layout';
import type { ComputedFlow } from '@specfy/api/src/common/flow/transform';
import { componentsToFlow } from '@specfy/api/src/common/flow/transform';
import type { ApiProject, ApiComponent } from '@specfy/api/src/types/api';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';

import { useComponentsStore } from '../../../common/store';
import { titleSuffix } from '../../../common/string';
import { Flow, FlowWrapper } from '../../../components/Flow';
import { Toolbar } from '../../../components/Flow/Toolbar';
import type { RouteProject } from '../../../types/routes';

import { FlowEdit } from './Edit';
import cls from './index.module.scss';

export const ProjectFlow: React.FC<{
  proj: ApiProject;
  params: RouteProject;
}> = ({ proj }) => {
  const storeComponents = useComponentsStore();
  const [flow, setFlow] = useState<ComputedFlow>();

  // const isEditing = edit.isEnabled();
  const [loading, setLoading] = useState<boolean>(true);
  const [components, setComponents] = useState<ApiComponent[]>();

  useEffect(() => {
    setComponents(Object.values(storeComponents.components));
  }, [storeComponents]);

  useEffect(() => {
    if (!components) {
      return;
    }

    const list = [
      'GCP',
      'Kubernetes',
      'Manager',
      'Worker',
      'Frontend',
      'API',
      'RabbitMQ',
      'Algolia',
      'Postgresql',
      'GCE',
    ];
    // const filtered = components.filter((c) => list.includes(c.name));
    const filtered = components;
    const tmp = componentsToFlow(filtered);
    const g = computeLayout(tmp);

    for (const node of tmp.nodes) {
      const next = g.node(node.id);
      const pos = {
        x: next.x,
        y: next.y,
      };
      const prev = JSON.stringify(node.position);
      // if (node.data.type !== 'hosting') {
      //   continue;
      // }
      if (node.parentNode) {
        // const parent = tmp.nodes.find((t) => t.id === node.parentNode)!;
        const parent = g.node(node.parentNode)!;
        node.position = {
          x: Math.abs(pos.x - 25 - parent.x) - next.width / 2,
          y: Math.abs(pos.y - 25 - parent.y) - next.height / 2,
        };
        if (node.data.type !== 'hosting') {
          node.position.y += 10;
          node.position.x += 10;
        }
      } else {
        node.position = pos;
      }
      console.log(
        JSON.stringify({
          name: node.data.label,
          '1prev': JSON.parse(prev),
          '2next': pos,
          '3end': node.position,
        })
      );
      if (node.data.type === 'hosting') {
        node.style = {
          width: `${next.width}px`,
          height: `${next.height}px`,
        };
      }
    }

    // g.nodes().forEach((id) => {
    //   const prev = tmp.nodes.find((n) => n.id === id)!;
    //   const next = g.node(id);
    //   console.log('updating', id, prev, next);
    //   if (prev.parentNode) {
    //     const parent = g.node(prev.parentNode);
    //     prev.position.x = parent.x - next.x;
    //     prev.position.y = parent.y - next.y;
    //   } else {
    //     prev.position.x = next.x;
    //     prev.position.y = next.y;
    //   }
    // });

    setFlow(tmp);
    setLoading(false);
  }, [components]);

  if (loading) {
    return <LoadingOutlined />;
  }

  return (
    <div className={cls.flow}>
      <Helmet title={`Flow - ${proj.name} ${titleSuffix}`} />

      <FlowEdit components={components!} proj={proj} />
      {flow && (
        <>
          <FlowWrapper>
            <Flow
              flow={flow}
              downlightOther={false}
              keepHighlightOnSelect={true}
            />
            <Toolbar position="top" visible>
              <Toolbar.Main />
            </Toolbar>
            <Toolbar position="bottom" visible>
              <Toolbar.Zoom />
              {/* <Toolbar.History /> */}
            </Toolbar>
          </FlowWrapper>
        </>
      )}
    </div>
  );
};
