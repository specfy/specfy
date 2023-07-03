import type { ApiComponent } from '@specfy/api/src/types/api';
import type { ComponentType } from '@specfy/api/src/types/db';
import { Typography } from 'antd';
import { useEffect, useState } from 'react';

import { useComponentsStore } from '../../../common/store';
import {
  ComponentLine,
  ComponentLineTech,
} from '../../../components/Component/Line';
import type { RouteProject } from '../../../types/routes';

export const TechnicalAspects: React.FC<{
  params: RouteProject;
}> = ({ params }) => {
  const storeComponents = useComponentsStore();
  const [components, setComponents] = useState<ApiComponent[]>();
  const [techs, setTechs] = useState<string[]>([]);
  const [empty, setEmtpy] = useState<boolean>(false);
  const [groups, setGroups] = useState<Record<
    ComponentType | 'others',
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
      hosting: [],
      sass: [],
      project: [],
      service: [],
      app: [],
      ci: [],
      db: [],
      language: [],
      messaging: [],
      network: [],
      tool: [],
      others: [],
    };

    for (const comp of components) {
      if (comp.techs) {
        for (const t of comp.techs) {
          _techs.add(t);
        }
      }

      if (comp.type === 'ci' || comp.type === 'tool') {
        _techs.add(comp.techId!);
        continue;
      }
      if (
        comp.type === 'app' ||
        comp.type === 'db' ||
        comp.type === 'messaging'
      ) {
        _groups.others.push(comp);
        continue;
      }

      _groups[comp.type].push(comp);
    }

    setGroups(_groups);
    setTechs(Array.from(_techs.values()));
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
      {empty && (
        <Typography.Text type="secondary">Nothing to show</Typography.Text>
      )}

      {groups.service.length > 0 && (
        <ComponentLine
          title="Services"
          comps={groups.service}
          params={params}
        />
      )}
      {groups.others && groups.others.length > 0 && (
        <ComponentLine title="Data" comps={groups.others} params={params} />
      )}
      {groups.hosting && groups.hosting.length > 0 && (
        <ComponentLine title="Hosts" comps={groups.hosting} params={params} />
      )}
      {groups.sass && groups.sass!.length > 0 && (
        <ComponentLine
          title="Third Parties"
          comps={groups.sass}
          params={params}
        />
      )}
      {groups.project && groups.project.length > 0 && (
        <ComponentLine
          title="Depends on projects"
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
