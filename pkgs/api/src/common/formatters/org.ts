import type { Orgs } from '@prisma/client';

import type { ApiOrg } from '../../types/api';

export function toApiOrg(org: Orgs): ApiOrg {
  return {
    id: org.id,
    isPersonal: org.isPersonal,
    name: org.name,
    avatarUrl: org.avatarUrl,
    acronym: org.acronym,
    color: org.color,
    githubInstallationId: org.githubInstallationId,
  };
}
