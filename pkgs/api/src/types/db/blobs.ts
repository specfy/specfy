import type { DBComponent } from './components.js';
import type { DBDocument } from './documents.js';
import type { DBProject } from './projects.js';

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
  current: DBDocument;
};
export type DBBlobDocument = DBBlobBase & DBBlobDocumentBase;

export type DBBlobComponentBase = {
  type: 'component';
  current: DBComponent;
};
export type DBBlobComponent = DBBlobBase & DBBlobComponentBase;

export type DBBlobProjectBase = {
  type: 'project';
  current: DBProject;
};
export type DBBlobProject = DBBlobBase & DBBlobProjectBase;

export type DBBlob = DBBlobComponent | DBBlobDocument | DBBlobProject;

export function isDocumentBlob(
  blob: Record<string, unknown>
): blob is DBBlobDocument {
  return blob.type === 'document';
}
export function isComponentBlob(
  blob: Record<string, unknown>
): blob is DBBlobComponent {
  return blob.type === 'component';
}
export function isProjectBlob(
  blob: Record<string, unknown>
): blob is DBBlobProject {
  return blob.type === 'project';
}
