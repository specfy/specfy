import { Typography } from 'antd';
import type { ApiComponent } from 'api/src/types/api';
import { useEffect, useState } from 'react';

import { useComponentsStore } from '../../../common/store';
import {
  ComponentLine,
  ComponentLineTech,
} from '../../../components/ComponentLine';
import type { RouteProject } from '../../../types/routes';

export const TechnicalAspects: React.FC<{
  params: RouteProject;
}> = ({ params }) => {
  const storeComponents = useComponentsStore();

  const [hosts, setHosts] = useState<ApiComponent[]>([]);
  const [techs, setTechs] = useState<string[]>([]);
  const [tp, setTP] = useState<ApiComponent[]>([]);
  const [projects, setProjects] = useState<ApiComponent[]>([]);
  const [components, setComponents] = useState<ApiComponent[]>();

  useEffect(() => {
    setComponents(Object.values(storeComponents.components));
  }, [storeComponents]);

  useEffect(() => {
    if (!components) {
      return;
    }

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

  if (!components) {
    return null;
  }

  return (
    <>
      {techs.length <= 0 &&
        components.length <= 0 &&
        tp.length <= 0 &&
        projects.length <= 0 && (
          <Typography.Text type="secondary">Nothing to show.</Typography.Text>
        )}

      {techs.length > 0 && (
        <ComponentLineTech title="Stack" techs={techs} params={params} />
      )}
      {hosts.length > 0 && (
        <ComponentLine title="Hosts" comps={hosts} params={params} />
      )}
      {components.length > 0 && (
        <ComponentLine
          title="Components"
          comps={components.filter((c) => c.type === 'component')}
          params={params}
        />
      )}
      {tp.length > 0 && (
        <ComponentLine title="Third Parties" comps={tp} params={params} />
      )}
      {projects.length > 0 && (
        <ComponentLine
          title="Depends on projects"
          comps={projects}
          params={params}
        />
      )}
    </>
  );
};
