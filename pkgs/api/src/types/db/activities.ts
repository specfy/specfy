import type { Prisma } from '@prisma/client';

export type DBActivityType =
  | 'Component'
  | 'Document'
  | 'Org'
  | 'Policy'
  | 'Project'
  | 'Revision'
  | 'User';

export type ActionComponent =
  | 'Component.created'
  | 'Component.deleted'
  | 'Component.updated';

export type ActionDocument =
  | 'Document.created'
  | 'Document.deleted'
  | 'Document.updated';

export type ActionOrg =
  | 'Org.created'
  | 'Org.deleted'
  | 'Org.renamed'
  | 'Org.updated';

export type ActionPolicy =
  | 'Policy.created'
  | 'Policy.deleted'
  | 'Policy.updated';

export type ActionProject =
  | 'Project.created'
  | 'Project.deleted'
  | 'Project.renamed'
  | 'Project.updated';

export type ActionRevision =
  | 'Revision.approved'
  | 'Revision.closed'
  | 'Revision.commented'
  | 'Revision.created'
  | 'Revision.deleted'
  | 'Revision.locked'
  | 'Revision.merged'
  | 'Revision.rebased'
  | 'Revision.updated';

export type ActionUser =
  | 'User.added'
  | 'User.created'
  | 'User.deleted'
  | 'User.removed'
  | 'User.updated';

export type ActionKey = 'Key.created' | 'Key.deleted';

export interface DBActivity {
  id: string;

  orgId: string | null;
  projectId: string | null;

  userId: string;

  activityGroupId: string;
  action:
    | ActionComponent
    | ActionDocument
    | ActionKey
    | ActionOrg
    | ActionPolicy
    | ActionProject
    | ActionRevision
    | ActionUser;

  targetUserId: string | null;
  targetComponentId: string | null;
  targetDocumentId: string | null;
  targetRevisionId: string | null;
  targetPolicyId: string | null;

  createdAt: string;
}

export type ActivitiesList = Prisma.ActivitiesGetPayload<{
  include: {
    User: true;
    Project: { select: { id: true; name: true; slug: true } };
    Blob: true;
  };
}>;
