import type { DBComponent } from './components';
import type { DBDocument } from './documents';
import type { DBProject } from './projects';

export type DBBlobAll = DBComponent | DBDocument | DBProject;
export type DBBlobBase = {
  id: string;

  typeId: string;
  parentId: string | null;
  created: boolean;
  deleted: boolean;

  createdAt: string;
  updatedAt: string;
};

export type DBBlobDocumentBase = {
  type: 'document';
  current: DBDocument | null;
};
export type DBBlobDocument = DBBlobBase & DBBlobDocumentBase;

export type DBBlobComponentBase = {
  type: 'component';
  current: DBComponent | null;
};
export type DBBlobComponent = DBBlobBase & DBBlobComponentBase;

export type DBBlobProjectBase = {
  type: 'project';
  current: DBProject | null;
};
export type DBBlobProject = DBBlobBase & DBBlobProjectBase;

export type DBBlob = DBBlobComponent | DBBlobDocument | DBBlobProject;

export function isDocumentBlob(blob: any): blob is DBBlobDocument {
  return blob.type === 'document';
}
export function isComponentBlob(blob: any): blob is DBBlobComponent {
  return blob.type === 'component';
}
export function isProjectBlob(blob: any): blob is DBBlobProject {
  return blob.type === 'project';
}
