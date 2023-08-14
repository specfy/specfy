import type { DBActivity } from '@specfy/api/src/models/activities/types.js';
import type { DBBlob } from '@specfy/api/src/models/blobs/types.js';
import type { DBComponent } from '@specfy/api/src/models/components/types.js';
import type { DBDocument } from '@specfy/api/src/models/documents/types.js';
import type { ComputedFlow } from '@specfy/api/src/models/flows/types.js';
import type {
  JobDeployConfig,
  JobReason,
} from '@specfy/api/src/models/jobs/type.js';
import type { DBPerm } from '@specfy/api/src/models/perms/types.js';
import type { DBPolicy } from '@specfy/api/src/models/policies/types.js';
import type { DBProject } from '@specfy/api/src/models/projects/types.js';
import type { DBRevision } from '@specfy/api/src/models/revisions/types.js';
import type { DBTypeHasUser } from '@specfy/api/src/models/typesHasUsers/types.js';
import type { BlockLevelZero } from '@specfy/api/src/types/api/index.js';

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
