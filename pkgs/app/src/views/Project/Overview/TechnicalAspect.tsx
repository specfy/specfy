import { isHosting } from '@specfy/models/src/components/isHosting';
import { useEffect, useState } from 'react';

import type { ApiComponent, ComponentType } from '@specfy/models';

import { useComponentsStore } from '@/common/store';
import { ComponentLine, ComponentLineTech } from '@/components/Component/Line';
import { Subdued } from '@/components/Text';
import type { RouteProject } from '@/types/routes';

const groupTech: ComponentType[] = ['tool', 'language'];
const groupData: ComponentType[] = [
  'api',
  'app',
  'db',
  'etl',
  'messaging',
  'network',
  'storage',
];

export const TechnicalAspects: React.FC<{
  params: RouteProject;
}> = ({ params }) => {
  const storeComponents = useComponentsStore();
  const [components, setComponents] = useState<ApiComponent[]>();
  const [techs, setTechs] = useState<ApiComponent['techs']>([]);
  const [empty, setEmtpy] = useState<boolean>(false);
  const [groups, setGroups] = useState<Record<
    'saas' | 'hosting' | 'data' | 'project' | 'service' | 'monitoring',
    ApiComponent[]
  > | null>(null);

  useEffect(() => {
    setComponents(Object.values(storeComponents.components));
  }, [storeComponents]);

  useEffect(() => {
    if (!components) {
      return;
    }

    const _techs = new Set<string>();
    const _groups: typeof groups = {
      data: [],
      hosting: [],
      project: [],
      monitoring: [],
      saas: [],
      service: [],
    };

    for (const comp of components) {
      if (comp.techs) {
        for (const tech of comp.techs) {
          _techs.add(tech.id);
        }
      }

      if (groupTech.includes(comp.type)) {
        _techs.add(comp.techId!);
        continue;
      }

      if (groupData.includes(comp.type)) {
        _groups.data.push(comp);
      } else if (isHosting(comp.type)) {
        _groups.hosting.push(comp);
      } else if (comp.type === 'project' || comp.type === 'service') {
        _groups[comp.type].push(comp);
      } else if (comp.type === 'saas' || comp.type === 'ci') {
        _groups.saas.push(comp);
      } else if (comp.type === 'monitoring' || comp.type === 'analytics') {
        _groups.monitoring.push(comp);
      } else {
        throw new Error('unknown tech type');
      }
    }

    setGroups(_groups);
    setTechs(
      Array.from(_techs.values())
        .sort()
        .map((id) => {
          return { id };
        })
    );
    setEmtpy(
      !(Object.keys(_groups) as Array<keyof typeof _groups>).find(
        (k) => _groups[k]!.length > 0
      )
    );
  }, [components]);

  if (!components || !groups) {
    return null;
  }

  return (
    <>
      {empty && <Subdued>Nothing to show</Subdued>}

      {groups.service.length > 0 && (
        <ComponentLine
          title="Service"
          titlePlural="Services"
          comps={groups.service}
          params={params}
          count={true}
        />
      )}
      {groups.data.length > 0 && (
        <ComponentLine
          title="Data store"
          titlePlural="Data stores"
          comps={groups.data}
          params={params}
          count={true}
        />
      )}
      {groups.hosting.length > 0 && (
        <ComponentLine
          title="Host"
          titlePlural="Hosts"
          comps={groups.hosting}
          params={params}
          count={true}
        />
      )}
      {groups.saas.length > 0 && (
        <ComponentLine
          title="Third-Party"
          titlePlural="Third-Parties"
          comps={groups.saas}
          params={params}
          count={true}
        />
      )}
      {groups.monitoring.length > 0 && (
        <ComponentLine
          title="Monitoring"
          titlePlural="Monitoring & Analytics"
          comps={groups.monitoring}
          params={params}
          count={true}
        />
      )}
      {groups.project.length > 0 && (
        <ComponentLine
          title="Project"
          titlePlural="Projects"
          comps={groups.project}
          params={params}
          count={true}
        />
      )}

      {techs.length > 0 && (
        <ComponentLineTech title="Stack" techs={techs} params={params} />
      )}
    </>
  );
};
