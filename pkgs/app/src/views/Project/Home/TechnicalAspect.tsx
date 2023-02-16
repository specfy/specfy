import { Typography } from 'antd';
import type { ApiComponent } from 'api/src/types/api/components';
import { useEffect, useState } from 'react';

import type { RouteProject } from '../../../types/routes';
import { Line } from '../Component/Line';

export const TechnicalAspects: React.FC<{
  components: ApiComponent[];
  params: RouteProject;
}> = ({ components, params }) => {
  const [hosts, setHosts] = useState<ApiComponent[]>([]);
  const [techs, setTechs] = useState<string[]>([]);
  const [tp, setTP] = useState<ApiComponent[]>([]);
  const [projects, setProjects] = useState<ApiComponent[]>([]);

  useEffect(() => {
    const _techs = new Set<string>();
    const _hosts = [];
    const _tp = [];
    const _projects = [];

    for (const comp of components) {
      if (comp.type === 'hosting') {
        _hosts.push(comp);
      } else if (comp.type === 'thirdparty') {
        _tp.push(comp);
      } else if (comp.type === 'project') {
        _projects.push(comp);
      }
      if (comp.tech) {
        for (const t of comp.tech) {
          _techs.add(t);
        }
      }
    }

    setTechs(Array.from(_techs.values()));
    setHosts(_hosts);
    setTP(_tp);
    setProjects(_projects);
  }, [components]);

  return (
    <>
      {techs.length <= 0 &&
        components.length <= 0 &&
        tp.length <= 0 &&
        projects.length <= 0 && (
          <Typography.Text type="secondary">Nothing to show.</Typography.Text>
        )}

      {techs.length > 0 && (
        <Line title="Stack" comps={hosts} techs={techs} params={params} />
      )}
      {components.length > 0 && (
        <Line
          title="Components"
          comps={components.filter((c) => c.type === 'component')}
          params={params}
        />
      )}
      {tp.length > 0 && (
        <Line title="Third Parties" comps={tp} params={params} />
      )}
      {projects.length > 0 && (
        <Line title="Depends on projects" comps={projects} params={params} />
      )}
    </>
  );
};
