import { Prisma } from '@specfy/db';
import type { Jobs } from '@specfy/db';
import type { SetNonNullable } from 'type-fest';
export declare function createJobDeploy({ tx, orgId, projectId, config, userId, ...rest }: Partial<Jobs> & SetNonNullable<Pick<Jobs, 'config' | 'orgId' | 'projectId' | 'userId'>, 'projectId' | 'userId'> & {
    tx: Prisma.TransactionClient;
}): Promise<{
    id: string;
    orgId: string;
    projectId: string | null;
    userId: string | null;
    createdAt: Date;
    config: import("./types").JobDeployConfig;
    updatedAt: Date;
    status: import("@specfy/db").JobsStatus;
    type: "deploy";
    typeId: number;
    reason: import("./types").JobMark | null;
    startedAt: Date | null;
    finishedAt: Date | null;
}>;
export declare function getJobTypeId({ orgId, projectId, tx, }: {
    orgId: string;
    projectId: string;
    tx: Prisma.TransactionClient;
}): Promise<number>;
