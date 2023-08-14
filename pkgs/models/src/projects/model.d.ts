import type { Projects, Prisma, Activities, Users } from '@specfy/db';
import type { ActionProject } from '../activities/types.js';
import type { DBProject } from './types.js';
export declare function createProjectBlob({ data, blob, tx, }: {
    data?: Partial<Omit<Prisma.BlobsUncheckedCreateInput, 'blob'>>;
    blob: Prisma.ProjectsUncheckedCreateInput | Projects;
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
    current: import("../index.js").DBDocument | import("../index.js").DBComponent | DBProject | null;
}>;
export declare function createProject({ data, user, tx, }: {
    data: Omit<Prisma.ProjectsUncheckedCreateInput, 'blobId' | 'id' | 'slug'> & Partial<Pick<Prisma.ProjectsUncheckedCreateInput, 'id' | 'slug'>>;
    user: Users;
    tx: Prisma.TransactionClient;
}): Promise<{
    id: string;
    orgId: string;
    createdAt: Date;
    blobId: string | null;
    name: string;
    slug: string;
    description: PrismaJson.PrismaProseMirror;
    links: import("./types.js").DBProjectLink[];
    githubRepository: string | null;
    config: import("type-fest/source/required-deep.js").RequiredObjectDeep<Omit<import("@specfy/sync").Config, "orgId" | "projectId">>;
    updatedAt: Date;
}>;
export declare function createProjectActivity({ user, action, target, tx, activityGroupId, }: {
    user: Users;
    action: ActionProject;
    target: Projects;
    tx: Prisma.TransactionClient;
    activityGroupId?: string | null;
}): Promise<Activities>;
export declare function getDefaultConfig(): DBProject['config'];
