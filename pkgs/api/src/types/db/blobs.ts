import type { DBComponent } from './components';
import type { DBDocument } from './documents';
import type { DBProject } from './projects';

export type DBBlobContent = DBComponent | DBDocument | DBProject;
export type DBBlobBase = {
  id: string;

  orgId: string;
  projectId: string;

  type: 'component' | 'document' | 'project';
  typeId: string;
  parentId: string | null;
  deleted: boolean;

  createdAt: string;
  updatedAt: string;
};

export type DBBlobDocument = {
  type: 'document';
  blob: Omit<
    DBDocument,
    'createdAt' | 'id' | 'orgId' | 'projectId' | 'updatedAt'
  >;
};
export type DBBlobComponent = {
  type: 'component';
  blob: Omit<
    DBComponent,
    'createdAt' | 'id' | 'orgId' | 'projectId' | 'updatedAt'
  >;
};
export type DBBlobProject = {
  type: 'project';
  blob: Omit<
    DBProject,
    'createdAt' | 'id' | 'orgId' | 'projectId' | 'updatedAt'
  >;
};

export type DBBlob = DBBlobBase &
  (DBBlobComponent | DBBlobDocument | DBBlobProject);
