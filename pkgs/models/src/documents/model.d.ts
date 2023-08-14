import type { Prisma, Activities, Documents, Users } from '@specfy/db';
import type { ActionDocument } from '../activities/types.js';
export declare function getDocumentTypeId({ data, tx, }: {
    data: Pick<Documents, 'orgId' | 'projectId' | 'type'>;
    tx: Prisma.TransactionClient;
}): Promise<number>;
export declare function createDocumentBlob({ blob, data, tx, }: {
    blob: Documents | Prisma.DocumentsUncheckedCreateInput;
    data?: Partial<Pick<Prisma.BlobsCreateInput, 'created' | 'deleted'>>;
    tx: Prisma.TransactionClient;
}): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    parentId: string | null;
    type: string;
    typeId: string;
    created: boolean;
    deleted: boolean;
    current: import("./types.js").DBDocument | import("../index.js").DBComponent | import("../index.js").DBProject | null;
}>;
export declare function createDocument({ data, user, tx, }: {
    data: Omit<Prisma.DocumentsUncheckedCreateInput, 'blobId' | 'slug'>;
    user: Users;
    tx: Prisma.TransactionClient;
}): Promise<{
    id: string;
    orgId: string;
    projectId: string;
    createdAt: Date;
    blobId: string | null;
    name: string;
    slug: string;
    updatedAt: Date;
    locked: boolean;
    source: string | null;
    sourcePath: string | null;
    parentId: string | null;
    type: "pb" | "rfc" | "doc";
    typeId: number | null;
    tldr: string;
    content: PrismaJson.PrismaProseMirror;
}>;
export declare function createDocumentActivity({ user, action, target, tx, activityGroupId, }: {
    user: Users;
    action: ActionDocument;
    target: Documents;
    tx: Prisma.TransactionClient;
    activityGroupId?: string | null;
}): Promise<Activities>;
