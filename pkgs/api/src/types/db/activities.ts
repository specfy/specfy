export type DBActivityType =
  | 'Component'
  | 'Document'
  | 'Org'
  | 'Policy'
  | 'Project'
  | 'Revision'
  | 'User';

export interface DBActivity {
  id: string;

  orgId: string;
  projectId: string | null;

  userId: string;

  activityGroupId: string;
  action:
    | 'Component.created'
    | 'Component.deleted'
    | 'Component.updated'
    | 'Document.created'
    | 'Document.deleted'
    | 'Document.updated'
    | 'Org.created'
    | 'Org.deleted'
    | 'Org.renamed'
    | 'Org.updated'
    | 'Policy.created'
    | 'Policy.deleted'
    | 'Policy.updated'
    | 'Project.created'
    | 'Project.deleted'
    | 'Project.renamed'
    | 'Project.updated'
    | 'Revision.approved'
    | 'Revision.commented'
    | 'Revision.created'
    | 'Revision.deleted'
    | 'Revision.merged'
    | 'Revision.updated'
    | 'User.added'
    | 'User.created'
    | 'User.deleted'
    | 'User.removed'
    | 'User.updated';

  targetOrgId: string | null;
  targetProjectId: string | null;
  targetUserId: string | null;
  targetComponentId: string | null;
  targetDocumentId: string | null;
  targetRevisionId: string | null;
  targetPolicyId: string | null;

  createdAt: string;
}
