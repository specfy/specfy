import type { Orgs } from '@specfy/db';
import type { ApiOrg, ApiOrgPublic } from './types.api';
export declare function toApiOrgPublic(org: Orgs): ApiOrgPublic;
export declare function toApiOrgList(org: Orgs): ApiOrg;
