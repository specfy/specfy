import type { Res } from '@specfy/core';

import type { ApiOrg } from '../orgs';

// POST /
export type PostDemo = Res<{
  Success: { data: ApiOrg };
}>;
