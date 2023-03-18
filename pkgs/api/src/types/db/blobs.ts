import type { DBComponent } from './components';
import type { DBDocument } from './documents';
import type { DBProject } from './projects';

export type DBBlobAll = DBComponent | DBDocument | DBProject;
export type DBBlobBase = {
  id: string;

  orgId: string;
  projectId: string;

  type: 'component' | 'document' | 'project';
  blob: DBBlobAll | null;
  typeId: string;
  parentId: string | null;
  deleted: boolean;

  createdAt: string;
  updatedAt: string;
};

export type DBBlobDocument = {
  type: 'document';
  blob: DBDocument | null;
};
export type DBBlobComponent = {
  type: 'component';
  blob: DBComponent | null;
};
export type DBBlobProject = {
  type: 'project';
  blob: DBProject | null;
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
