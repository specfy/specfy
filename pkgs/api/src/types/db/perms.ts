export enum PermType {
  'contributor' = 'contributor',
  'owner' = 'owner',
  'reviewer' = 'reviewer',
  'viewer' = 'viewer',
}

export interface DBPerm {
  id: string;
  orgId: string;
  projectId: string | null;

  userId: string;
  role: 'contributor' | 'owner' | 'reviewer' | 'viewer';

  createdAt: string;
  updatedAt: string;
}
