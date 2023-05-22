import type { Orgs } from '@prisma/client';

import type { ApiOrg } from '../../types/api';

export function toApiOrg(org: Orgs): ApiOrg {
  return {
    id: org.id,
    isPersonal: org.isPersonal,
    name: org.name,
    logo: 'https://www.ycombinator.com/packs/static/ycdc/ycombinator-logo-ee6c80faf1d1ce2491d8.png',
  };
}
