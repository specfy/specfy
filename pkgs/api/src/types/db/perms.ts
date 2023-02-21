export interface DBPerm {
  id: string;
  orgId: string;
  projectId: string | null;

  userId: string;
  role: 'contributor' | 'owner' | 'reviewer' | 'viewer';

  createdAt: string;
  updatedAt: string;
}
