import type { Orgs } from '@prisma/client';

import type { ApiOrg } from '../../types/api';

export function toApiOrg(org: Orgs): ApiOrg {
  return {
    id: org.id,
    isPersonal: org.isPersonal,
    name: org.name,
  };
}
