import { IconThumbUp } from '@tabler/icons-react';
import type { ApiActivity } from 'api/src/types/api';
import type {
  ActionAll,
  ActionComponent,
  ActionDocument,
  ActionKey,
  ActionOrg,
  ActionPolicy,
  ActionProject,
  ActionRevision,
  ActionUser,
} from 'api/src/types/db';
import { Link } from 'react-router-dom';

import { AvatarAuto } from '../components/AvatarAuto';
import { Flex } from '../components/Flex';
import { ActivityCard } from '../components/ListActivity/Details';
import { StatusTag } from '../components/StatusTag';

import { TYPE_TO_READABLE } from './document';

export type ActivityContext = {
  orgId: string;
  projectId?: string;
  revisionId?: string;
};

export type ActivityParams = {
  icon?: React.ReactNode;
  Target: React.FC<{ act: ApiActivity }>;
  Text: React.FC<{
    act: ApiActivity;
    ctx: ActivityContext;
    user: React.ReactNode;
    target: React.ReactNode;
  }>;
  Card?: React.FC<{
    act: ApiActivity;
    ctx: ActivityContext;
  }>;
};

export const DocumentTarget: React.FC<{
  act: ApiActivity;
}> = ({ act }) => {
  return (
    <Link
      to={`/${act.orgId}/${act.project!.slug}/content/${
        act.targetDocument!.id
      }-${act.targetDocument!.slug}`}
    >
      {act.targetDocument!.name}
    </Link>
  );
};
export const mapDocument: Record<ActionDocument, ActivityParams> = {
  'Document.created': {
    Target: DocumentTarget,
    Text: ({ user, act }) => (
      <>
        {user} created a new ${TYPE_TO_READABLE[act.targetDocument!.type]}{' '}
      </>
    ),
  },
  'Document.deleted': {
    Target: DocumentTarget,
    Text: ({ user, act }) => (
      <>
        {user} deleted ${TYPE_TO_READABLE[act.targetDocument!.type]}{' '}
      </>
    ),
  },
  'Document.updated': {
    Target: DocumentTarget,
    Text: ({ user, act }) => (
      <>
        {user} updated ${TYPE_TO_READABLE[act.targetDocument!.type]}{' '}
      </>
    ),
  },
};

export const ComponentTarget: React.FC<{
  act: ApiActivity;
}> = ({ act }) => {
  return (
    <Link
      to={`/${act.orgId}/${act.project!.slug}/c/${act.targetComponent!.slug}`}
    >
      {act.targetComponent!.name}
    </Link>
  );
};
export const mapComponent: Record<ActionComponent, ActivityParams> = {
  'Component.created': {
    Target: ComponentTarget,
    Text: ({ user, target }) => {
      return (
        <>
          {user} created a new component {target}
        </>
      );
    },
  },
  'Component.deleted': {
    Target: ComponentTarget,
    Text: ({ user, target }) => {
      return (
        <>
          {user} deleted a component {target}
        </>
      );
    },
  },
  'Component.updated': {
    Target: ComponentTarget,
    Text: ({ user, target }) => {
      return (
        <>
          {user} updated a component {target}
        </>
      );
    },
  },
};

export const OrgTarget: React.FC<{
  act: ApiActivity;
}> = ({ act }) => {
  return <Link to={`/${act.orgId}`}>{act.orgId}</Link>;
};
export const mapOrg: Record<ActionOrg, ActivityParams> = {
  'Org.created': {
    Target: OrgTarget,
    Text: ({ user }) => {
      return <>{user} created this organization</>;
    },
  },
  'Org.deleted': {
    Target: OrgTarget,
    Text: ({ user }) => {
      return <>{user} deleted this organization</>;
    },
  },
  'Org.renamed': {
    Target: OrgTarget,
    Text: ({ user }) => {
      return <>{user} renamed this organization</>;
    },
  },
  'Org.updated': {
    Target: OrgTarget,
    Text: ({ user }) => {
      return <>{user} updated this organization</>;
    },
  },
};

export const PolicityTarget: React.FC<{
  act: ApiActivity;
}> = ({ act }) => {
  return (
    <Link to={`/${act.orgId}/_/policies/${act.targetPolicy!.id}`}>
      {act.targetPolicy!.name}
    </Link>
  );
};
export const mapPolicy: Record<ActionPolicy, ActivityParams> = {
  'Policy.created': {
    Target: PolicityTarget,
    Text: ({ user }) => {
      return <>{user} created a new policy</>;
    },
  },
  'Policy.deleted': {
    Target: PolicityTarget,
    Text: ({ user }) => {
      return <>{user} deleted policy</>;
    },
  },
  'Policy.updated': {
    Target: PolicityTarget,
    Text: ({ user }) => {
      return <>{user} updated policy</>;
    },
  },
};

export const ProjectTarget: React.FC<{
  act: ApiActivity;
  children?: React.ReactNode;
}> = ({ act, children }) => {
  return (
    <Link to={`/${act.orgId}/${act.project!.slug}`}>
      {children || act.project!.name}
    </Link>
  );
};
export const mapProject: Record<ActionProject, ActivityParams> = {
  'Project.created': {
    Target: ProjectTarget,
    Text: ({ user }) => {
      return <>{user} created a new project</>;
    },
    Card: ({ act, ctx }) => {
      if (!act.project || ctx.projectId) {
        return null;
      }

      return (
        <ActivityCard>
          <Flex direction="column" alignItems="flex-start" gap="l">
            <Flex gap="l">
              <AvatarAuto name={act.project.name} />
              <ProjectTarget act={act}>{act.project.name}</ProjectTarget>
            </Flex>
          </Flex>
        </ActivityCard>
      );
    },
  },
  'Project.deleted': {
    Target: ProjectTarget,
    Text: ({ user }) => {
      return <>{user} deleted project</>;
    },
  },
  'Project.renamed': {
    Target: ProjectTarget,
    Text: ({ user }) => {
      return <>{user} renamed project</>;
    },
  },
  'Project.updated': {
    Target: ProjectTarget,
    Text: ({ user }) => {
      return <>{user} updated project</>;
    },
  },
};

export const UserTarget: React.FC<{
  act: ApiActivity;
  children?: React.ReactNode;
}> = ({ act, children }) => {
  return (
    <Link to={`/${act.orgId}/_/${act.targetUser!.id}`}>
      {children || act.targetUser!.name}
    </Link>
  );
};
export const mapUser: Record<ActionUser, ActivityParams> = {
  'User.added': {
    Target: UserTarget,
    Text: ({ user }) => {
      return <>{user} </>;
    },
  },
  'User.created': {
    Target: UserTarget,
    Text: ({ user }) => {
      return <>{user} </>;
    },
  },
  'User.deleted': {
    Target: UserTarget,
    Text: ({ user }) => {
      return <>{user} </>;
    },
  },
  'User.removed': {
    Target: UserTarget,
    Text: ({ user }) => {
      return <>{user} </>;
    },
  },
  'User.updated': {
    Target: UserTarget,
    Text: ({ user }) => {
      return <>{user} </>;
    },
  },
};

export const mapKey: Record<ActionKey, ActivityParams> = {
  'Key.created': {
    Target: () => null,
    Text: ({ user }) => {
      return <>{user} created an api key</>;
    },
  },
  'Key.deleted': {
    Target: () => null,
    Text: ({ user }) => {
      return <>{user} deleted an api key</>;
    },
  },
};

export const RevisionTarget: React.FC<{
  act: ApiActivity;
  children?: React.ReactNode;
}> = ({ act, children }) => {
  return (
    <Link
      to={`/${act.orgId}/${act.project!.slug}/revisions/${
        act.targetRevision!.id
      }`}
    >
      {children || act.targetRevision!.name}
    </Link>
  );
};
export const mapRevision: Record<ActionRevision, ActivityParams> = {
  'Revision.approved': {
    icon: <IconThumbUp />,
    Target: RevisionTarget,
    Text: ({ ctx, user, target }) => {
      if (ctx.revisionId) {
        return <>{user} approved</>;
      }
      return (
        <>
          {user} approved revision {target}
        </>
      );
    },
  },
  'Revision.commented': {
    Target: RevisionTarget,
    Text: ({ ctx, user, target }) => {
      if (ctx.revisionId) {
        return <>{user} commented</>;
      }
      return (
        <>
          {user} commented on revision {target}
        </>
      );
    },
  },
  'Revision.deleted': {
    Target: RevisionTarget,
    Text: ({ ctx, user, target }) => {
      if (ctx.revisionId) {
        return <>{user} deleted</>;
      }
      return (
        <>
          {user} deleted revision {target}
        </>
      );
    },
  },
  'Revision.merged': {
    Target: RevisionTarget,
    Text: ({ ctx, user, target }) => {
      if (ctx.revisionId) {
        return <>{user} merged</>;
      }
      return (
        <>
          {user} merged revision {target}
        </>
      );
    },
  },
  'Revision.updated': {
    Target: RevisionTarget,
    Text: ({ ctx, user, target }) => {
      if (ctx.revisionId) {
        return <>{user} updated</>;
      }
      return (
        <>
          {user} updated revision {target}
        </>
      );
    },
  },
  'Revision.closed': {
    Target: RevisionTarget,
    Text: ({ ctx, user, target }) => {
      if (ctx.revisionId) {
        return <>{user} closed</>;
      }
      return (
        <>
          {user} closed revision {target}
        </>
      );
    },
  },
  'Revision.locked': {
    Target: RevisionTarget,
    Text: ({ ctx, user, target }) => {
      if (ctx.revisionId) {
        return <>{user} locked</>;
      }
      return (
        <>
          {user} locked revision {target}
        </>
      );
    },
  },
  'Revision.rebased': {
    Target: RevisionTarget,
    Text: ({ ctx, user, target }) => {
      if (ctx.revisionId) {
        return <>{user} rebased</>;
      }
      return (
        <>
          {user} rebased revision {target}
        </>
      );
    },
  },
  'Revision.created': {
    Target: RevisionTarget,
    Text: ({ user, ctx }) => {
      if (ctx.revisionId) {
        return <>{user} created this revision</>;
      }
      return <>{user} created a new revision</>;
    },
    Card: ({ act, ctx }) => {
      if (!act.targetRevision || ctx.revisionId) {
        return null;
      }

      return (
        <ActivityCard>
          <Flex direction="column" alignItems="flex-start" gap="s">
            <h4>
              <RevisionTarget act={act}>
                {act.targetRevision.name}
              </RevisionTarget>
            </h4>
            <StatusTag
              status={act.targetRevision.status}
              locked={act.targetRevision.locked}
            />
          </Flex>
        </ActivityCard>
      );
    },
  },
};

export const mapActivites: Record<ActionAll, ActivityParams> = {
  ...mapDocument,
  ...mapComponent,
  ...mapOrg,
  ...mapPolicy,
  ...mapProject,
  ...mapUser,
  ...mapKey,
  ...mapRevision,
};
