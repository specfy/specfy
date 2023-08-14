import type { Prisma, Activities, Components, Users } from '@specfy/db';
import type { ActionComponent } from '../activities/types.js';
export declare function createComponentBlob({ data, blob, tx, }: {
    data?: Partial<Pick<Prisma.BlobsCreateInput, 'created' | 'deleted'>>;
    blob: Components | Prisma.ComponentsUncheckedCreateInput;
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
    current: import("../index.js").DBDocument | import("./types.js").DBComponent | import("../index.js").DBProject | null;
}>;
export declare function createComponent({ data, user, tx, }: {
    data: Omit<Prisma.ComponentsUncheckedCreateInput, 'blobId' | 'slug'>;
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
    description: PrismaJson.PrismaProseMirror;
    updatedAt: Date;
    source: string | null;
    sourcePath: string[] | null;
    type: import("./types.js").ComponentType;
    typeId: string | null;
    techId: string | null;
    techs: string[];
    display: import("../index.js").FlowItemDisplay;
    inComponent: string | null;
    edges: import("../index.js").FlowEdge[];
    sourceName: string | null;
    show: boolean;
    tags: string[];
}>;
export declare function createComponentActivity({ user, action, target, tx, activityGroupId, }: {
    user: Users;
    action: ActionComponent;
    target: Components;
    tx: Prisma.TransactionClient;
    activityGroupId?: string | null;
}): Promise<Activities>;
