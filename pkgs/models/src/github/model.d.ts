import type { Activities, Orgs, Prisma, Projects, Users } from '@specfy/db';
import type { ActionGithub } from '../activities/types.js';
export declare function createGithubActivity({ user, action, org, project, tx, activityGroupId, }: {
    user: Users;
    action: ActionGithub;
    org: Orgs;
    project?: Projects;
    tx: Prisma.TransactionClient;
    activityGroupId?: string | null;
}): Promise<Activities>;
