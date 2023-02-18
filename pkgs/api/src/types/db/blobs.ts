export interface DBBlob {
  id: string;

  orgId: string;
  projectId: string;

  type: 'component' | 'document' | 'graph' | 'project';
  typeId: string;
  parentId: string | null;
  blob: Record<string, any>;
  deleted: boolean;

  createdAt: string;
  updatedAt: string;
}
