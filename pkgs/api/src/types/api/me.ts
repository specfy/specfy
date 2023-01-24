import type { ApiOrg } from './orgs';

export interface ApiMe {
  id: string;
  name: string;
  email: string;
  orgs: ApiOrg[];
  createdAt: string;
  updatedAt: string;
}
