import { tech as techDb } from '@specfy/stack-analyser';

import type { Components, Jobs } from '@specfy/db';
import type { AllowedKeys } from '@specfy/stack-analyser';

import type { CatalogTechIndex } from './types.js';

export function componentsToCatalog(
  job: Pick<Jobs, 'orgId' | 'id' | 'projectId'>,
  components: Array<Pick<Components, 'name' | 'techId' | 'techs' | 'type'>>
) {
  const techs = new Map<string, CatalogTechIndex>();
  const base = { orgId: job.orgId, projectId: job.projectId!, jobId: job.id };

  for (const component of components) {
    // Deduplicate techs
    for (const tech of component.techs) {
      if (techs.has(tech.id)) {
        continue;
      }

      if (!(tech.id in techDb.indexed)) {
        // Unknown tech
        techs.set(tech.id, {
          ...base,
          key: tech.id,
          name: tech.id,
          type: 'unknown',
        });
        continue;
      }

      const def = techDb.indexed[tech.id as AllowedKeys];
      techs.set(def.key, { ...base, ...def });
    }

    if (component.techId && !techs.has(component.techId)) {
      if (component.techId === 'unknown') {
        // Unknown tech
        techs.set(component.name, {
          ...base,
          key: component.name,
          name: component.name,
          type: 'unknown',
        });
      } else {
        const def = techDb.indexed[component.techId as AllowedKeys];
        techs.set(def.key, { ...base, ...def });
      }
    }
  }

  return techs;
}
