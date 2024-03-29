import type {
  DBBlob,
  DBComponent,
  ComputedFlow,
  JobDeployConfig,
  JobReason,
  DBPerm,
  DBPolicy,
  DBProject,
  DBRevision,
  DBTypeHasUser,
  BlockLevelZero,
  DBActivity,
  DocumentType,
  JobProjectIndexConfig,
  JobBackfillGithubConfig,
} from './index.js';
import type { SourceSettingsGithub } from './sources/types.js';

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
    type PrismaComponentsInComponent = DBComponent['inComponent'];

    // Documents
    type PrismaDocumentsType = keyof typeof DocumentType;

    // Flows
    type PrismaFlowsFlow = ComputedFlow;

    // Jobs
    type PrismaJobsConfig =
      | JobDeployConfig
      | JobProjectIndexConfig
      | JobBackfillGithubConfig;
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
    type PrismaRevisionsStack = DBRevision['stack'];

    // Sources
    type PrismaSourcesSettings = SourceSettingsGithub;

    // TypeHasUsers
    type PrismaTypeHasUsersRole = DBTypeHasUser['role'];
  }
}
