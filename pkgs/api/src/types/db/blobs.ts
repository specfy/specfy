import type { DBComponent } from './components';
import type { DBDocument } from './documents';
import type { DBProject } from './projects';

export type DBBlobAll = DBComponent | DBDocument | DBProject;
export type DBBlobBase = {
  id: string;

  orgId: string;
  projectId: string;

  typeId: string;
  parentId: string | null;
  created: boolean;
  deleted: boolean;

  createdAt: string;
  updatedAt: string;
};

export type DBBlobDocument = DBBlobBase & {
  type: 'document';
  blob: DBDocument | null;
};
export type DBBlobComponent = DBBlobBase & {
  type: 'component';
  blob: DBComponent | null;
};
export type DBBlobProject = DBBlobBase & {
  type: 'project';
  blob: DBProject | null;
};

export type DBBlob = DBBlobComponent | DBBlobDocument | DBBlobProject;

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
