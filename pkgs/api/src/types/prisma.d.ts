import type { ComputedFlow } from '../common/flow/types.js';
import type { JobDeployConfig, JobReason } from '../models/jobs/type.js';

import type { BlockLevelZero } from './api/index.js';
import type { DBActivity } from './db/activities.js';
import type { DBBlob } from './db/blobs.js';
import type { DBComponent } from './db/components.js';
import type { DBDocument } from './db/documents.js';
import type { DBPerm } from './db/perms.js';
import type { DBPolicy } from './db/policies.js';
import type { DBProject } from './db/projects.js';
import type { DBRevision } from './db/revisions.js';
import type { DBTypeHasUser } from './db/typeHasUsers.js';

declare global {
  namespace PrismaJson {
    type PrismaProseMirror = BlockLevelZero;

    // Activities
    type PrismaActivitiesAction = DBActivity['action'];

    // Blobs
    type PrismaBlobsCurrent = DBBlob['current'];

    // Components
    type PrismaComponentsType = DBComponent['type'];
    type PrismaComponentsTechs = DBComponent['techs'];
    type PrismaComponentsDisplay = DBComponent['display'];
    type PrismaComponentsEdges = DBComponent['edges'];
    type PrismaComponentsSourcePath = DBComponent['sourcePath'];
    type PrismaComponentsTags = DBComponent['tags'];

    // Documents
    type PrismaDocumentsType = DBDocument['type'];

    // Flows
    type PrismaFlowsFlow = ComputedFlow;

    // Jobs
    type PrismaJobsConfig = JobDeployConfig;
    type PrismaJobsReason = JobReason;

    // Perms
    type PrismaPermsRole = DBPerm['role'];

    // Policies
    type PrismaPoliciesType = DBPolicy['type'];

    // Projects
    type PrismaProjectsLinks = DBProject['links'];

    // Revisions
    type PrismaRevisionsBlobs = DBRevision['blobs'];
    type PrismaRevisionsStatus = DBRevision['status'];

    // TypeHasUsers
    type PrismaTypeHasUsersRole = DBTypeHasUser['role'];
  }
}
