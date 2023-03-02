import type { DBComponent } from './components';
import type { DBDocument } from './documents';
import type { DBProject } from './projects';

export type DBBlobAll = DBComponent | DBDocument | DBProject;
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
    'blobId' | 'createdAt' | 'id' | 'orgId' | 'projectId' | 'updatedAt'
  >;
};
export type DBBlobComponent = {
  type: 'component';
  blob: Omit<
    DBComponent,
    'blobId' | 'createdAt' | 'id' | 'orgId' | 'projectId' | 'updatedAt'
  >;
};
export type DBBlobProject = {
  type: 'project';
  blob: Omit<
    DBProject,
    'blobId' | 'createdAt' | 'id' | 'orgId' | 'projectId' | 'updatedAt'
  >;
};

export type DBBlob = DBBlobBase &
  (DBBlobComponent | DBBlobDocument | DBBlobProject);

export function isDocumentBlob(blob: any): blob is DBBlobBase & DBBlobDocument {
  return blob.type === 'document';
}
export function isComponentBlob(
  blob: any
): blob is DBBlobBase & DBBlobComponent {
  return blob.type === 'component';
}
export function isProjectBlob(blob: any): blob is DBBlobBase & DBBlobProject {
  return blob.type === 'project';
}
