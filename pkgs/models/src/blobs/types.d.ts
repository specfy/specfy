import type { DBComponent } from '../components/types.js';
import type { DBDocument } from '../documents/types.js';
import type { DBProject } from '../projects/types.js';
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
export declare function isDocumentBlob(blob: Record<string, unknown>): blob is DBBlobDocument;
export declare function isComponentBlob(blob: Record<string, unknown>): blob is DBBlobComponent;
export declare function isProjectBlob(blob: Record<string, unknown>): blob is DBBlobProject;
