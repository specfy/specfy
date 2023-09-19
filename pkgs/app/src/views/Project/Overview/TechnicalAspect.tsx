import type { ApiComponent, ComponentType } from '@specfy/models';
import { useEffect, useState } from 'react';

import {
  ComponentLine,
  ComponentLineTech,
} from '../../../components/Component/Line';
import { Subdued } from '../../../components/Text';
import type { RouteProject } from '../../../types/routes';

import { useComponentsStore } from '@/common/store';

const groupTech: ComponentType[] = ['tool', 'language'];
const groupData: ComponentType[] = [
  'analytics',
  'api',
  'app',
  'db',
  'etl',
  'messaging',
  'monitoring',
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
    'saas' | 'hosting' | 'data' | 'project' | 'service',
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
      } else if (
        comp.type === 'hosting' ||
        comp.type === 'project' ||
        comp.type === 'service'
      ) {
        _groups[comp.type].push(comp);
      } else if (comp.type === 'saas' || comp.type === 'ci') {
        _groups.saas.push(comp);
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
          title="Services"
          comps={groups.service}
          params={params}
        />
      )}
      {groups.data && groups.data.length > 0 && (
        <ComponentLine title="Data" comps={groups.data} params={params} />
      )}
      {groups.hosting && groups.hosting.length > 0 && (
        <ComponentLine title="Hosts" comps={groups.hosting} params={params} />
      )}
      {groups.saas && groups.saas!.length > 0 && (
        <ComponentLine
          title="Third-Parties"
          comps={groups.saas}
          params={params}
        />
      )}
      {groups.project && groups.project.length > 0 && (
        <ComponentLine
          title="Projects"
          comps={groups.project}
          params={params}
        />
      )}

      {techs.length > 0 && (
        <ComponentLineTech title="Stack" techs={techs} params={params} />
      )}
    </>
  );
};
