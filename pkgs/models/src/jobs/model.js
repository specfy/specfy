import { nanoid } from '@specfy/core';
import { Prisma } from '@specfy/db';
export async function createJobDeploy({ tx, orgId, projectId, config, userId, ...rest }) {
    const job = await tx.jobs.create({
        data: {
            id: nanoid(),
            ...rest,
            status: rest.status || 'pending',
            reason: rest.reason || Prisma.DbNull,
            config,
            orgId,
            projectId,
            userId,
            type: 'deploy',
            typeId: rest.typeId || (await getJobTypeId({ orgId, projectId, tx })),
        },
    });
    return job;
}
export async function getJobTypeId({ orgId, projectId, tx, }) {
    const count = await tx.jobs.count({
        where: { orgId: orgId, projectId: projectId },
    });
    return count + 1;
}
