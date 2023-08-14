import type { Prisma, Projects } from '@specfy/db';
import type { DBComponent } from '../components/types.js';
import type { ComputedFlow, OrgFlowUpdates, ProjectRelation, ProjectRelations } from './types.js';
/**
 * Completely recompute the organization graph's edges.
 * Output an up to date map of all edges.
 */
export declare function recomputeOrgGraph({ orgId, updates, tx, }: {
    orgId: string;
    updates?: OrgFlowUpdates;
    tx: Prisma.TransactionClient;
}): Promise<{
    id: string;
    orgId: string;
    createdAt: Date;
    updatedAt: Date;
    flow: ComputedFlow;
}>;
/**
 * Compute one project relations to any projects inside the same project.
 */
export declare function computeRelationsToProjects({ components, }: {
    components: Array<Pick<DBComponent, 'edges' | 'id' | 'type' | 'typeId'>>;
}): Record<string, ProjectRelation>;
export declare function rebuildFlow({ projects, relations, oldFlow, updates, }: {
    projects: Array<Pick<Projects, 'id' | 'name'>>;
    relations: ProjectRelations;
    oldFlow?: ComputedFlow | undefined;
    updates?: OrgFlowUpdates | undefined;
}): ComputedFlow;
