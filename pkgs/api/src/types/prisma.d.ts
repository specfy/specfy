import type { DBActivity } from '../models/activities/types.js';
import type { DBBlob } from '../models/blobs/types.js';
import type { DBComponent } from '../models/components/types.js';
import type { DBDocument } from '../models/documents/types.js';
import type { ComputedFlow } from '../models/flows/types.js';
import type { JobDeployConfig, JobReason } from '../models/jobs/type.js';
import type { DBPerm } from '../models/perms/types.js';
import type { DBPolicy } from '../models/policies/types.js';
import type { DBProject } from '../models/projects/types.js';
import type { DBRevision } from '../models/revisions/types.js';
import type { DBTypeHasUser } from '../models/typesHasUsers/types.js';

import type { BlockLevelZero } from './api/index.js';

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
    type PrismaProjectsConfig = DBProject['config'];

    // Revisions
    type PrismaRevisionsBlobs = DBRevision['blobs'];
    type PrismaRevisionsStatus = DBRevision['status'];

    // TypeHasUsers
    type PrismaTypeHasUsersRole = DBTypeHasUser['role'];
  }
}
