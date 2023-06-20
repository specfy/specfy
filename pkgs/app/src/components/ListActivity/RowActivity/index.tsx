import type { ApiActivity, ApiActivityGrouped, ApiMe } from 'api/src/types/api';
import type {
  ActionComponent,
  ActionDocument,
  ActionKey,
  ActionOrg,
  ActionPolicy,
  ActionProject,
  ActionRevision,
  ActionUser,
  DBActivityType,
} from 'api/src/types/db';
import classNames from 'classnames';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { TYPE_TO_READABLE } from '../../../common/document';
import { AvatarAuto } from '../../AvatarAuto';
import { Flex } from '../../Flex';
import { Time } from '../../Time';

import cls from './index.module.scss';

type TargetComponent = Exclude<ApiActivity['targetComponent'], undefined>;
type TargetDocument = Exclude<ApiActivity['targetDocument'], undefined>;
type TargetPolicy = Exclude<ApiActivity['targetPolicy'], undefined>;
type TargetRevision = Exclude<ApiActivity['targetRevision'], undefined>;
type TargetUser = Exclude<ApiActivity['targetUser'], undefined>;

const mapDocument: Record<ActionDocument, (target: TargetDocument) => string> =
  {
    'Document.created': (target: TargetDocument) =>
      `created a new ${TYPE_TO_READABLE[target.type]}`,
    'Document.deleted': (target: TargetDocument) =>
      `deleted ${TYPE_TO_READABLE[target.type]}`,
    'Document.updated': (target: TargetDocument) =>
      `updated ${TYPE_TO_READABLE[target.type]}`,
  };

const mapComponent: Record<
  ActionComponent,
  (target: TargetComponent) => string
> = {
  'Component.created': () => 'created a new component',
  'Component.deleted': () => 'deleted a component',
  'Component.updated': () => 'updated a component',
};

const mapOrg: Record<ActionOrg, () => string> = {
  'Org.created': () => `created this organization`,
  'Org.deleted': () => `deleted this organization`,
  'Org.renamed': () => `renamed this organization`,
  'Org.updated': () => `updated this organization`,
};

const mapPolicy: Record<ActionPolicy, (target: TargetPolicy) => string> = {
  'Policy.created': () => `created a new policy`,
  'Policy.deleted': () => `deleted policy`,
  'Policy.updated': () => `updated policy`,
};

const mapProject: Record<ActionProject, () => string> = {
  'Project.created': () => `created a new project`,
  'Project.deleted': () => `deleted project`,
  'Project.renamed': () => `renamed project`,
  'Project.updated': () => `updated project`,
};

const mapRevision: Record<ActionRevision, (target: TargetRevision) => string> =
  {
    'Revision.approved': () => `approved revision`,
    'Revision.commented': () => `commented on revision`,
    'Revision.created': () => `created a new revision`,
    'Revision.deleted': () => `deleted revision`,
    'Revision.merged': () => `merged revision`,
    'Revision.updated': () => `updated revision`,
    'Revision.closed': () => `closed revision`,
    'Revision.locked': () => `locked revision`,
    'Revision.rebased': () => `rebased revision`,
  };

const mapUser: Record<ActionUser, (target: TargetUser) => string> = {
  'User.added': () => ``,
  'User.created': () => ``,
  'User.deleted': () => ``,
  'User.removed': () => ``,
  'User.updated': () => ``,
};

const mapKey: Record<ActionKey, () => string> = {
  'Key.created': () => `created an api key`,
  'Key.deleted': () => `deleted an api key`,
};

export const RowActivity: React.FC<{
  me: ApiMe['id'];
  act: ApiActivityGrouped;
  orgId: string;
  projectId?: string;
  isChild?: boolean;
}> = ({ me, act, orgId, projectId, isChild }) => {
  const type = act.action.split('.')[0] as DBActivityType;
  let target: ReactNode | null = null;
  let text: string = '';

  if (type === 'Document' && act.targetDocument) {
    target = (
      <Link
        to={`/${orgId}/${act.project!.slug}/content/${act.targetDocument.id}-${
          act.targetDocument.slug
        }`}
        className={cls.target}
      >
        {act.targetDocument.name}
      </Link>
    );
    text = mapDocument[act.action as ActionDocument](act.targetDocument);
  } else if (type === 'Component' && act.targetComponent) {
    target = (
      <Link
        to={`/${orgId}/${act.project!.slug}/c/${act.targetComponent.slug}`}
        className={cls.target}
      >
        {act.targetComponent.name}
      </Link>
    );
    text = mapComponent[act.action as ActionComponent](act.targetComponent);
  } else if (type === 'Revision' && act.targetRevision) {
    target = (
      <Link
        to={`/${orgId}/${act.project!.slug}/revisions/${act.targetRevision.id}`}
        className={cls.target}
      >
        {act.targetRevision.name}
      </Link>
    );
    text = mapRevision[act.action as ActionRevision](act.targetRevision);
  } else if (type === 'Project' && act.project) {
    if (act.action !== 'Project.created') {
      target = (
        <Link to={`/${orgId}/${act.project.slug}`} className={cls.target}>
          {act.project.name}
        </Link>
      );
    }
    text = mapProject[act.action as ActionProject]();
  } else if (type === 'Policy' && act.targetPolicy) {
    target = (
      <Link
        to={`/${orgId}/_/policies/${act.targetPolicy.id}`}
        className={cls.target}
      >
        {act.targetPolicy.name}
      </Link>
    );
    text = mapPolicy[act.action as ActionPolicy](act.targetPolicy);
  } else if (type === 'Org') {
    text = mapOrg[act.action as ActionOrg]();
  } else if (type === 'User' && act.targetUser) {
    text = mapUser[act.action as ActionUser](act.targetUser);
  } else if (type === 'Key') {
    text = mapKey[act.action as ActionKey]();
  } else {
    text = 'error';
  }

  return (
    <div
      className={classNames(cls.row, isChild && cls.isChild)}
      data-action={act.action}
    >
      <div className={cls.main}>
        {!isChild ? (
          <Link to={`/_/user/${act.user.id}`}>
            <AvatarAuto
              name={act.user.name}
              src={act.user.avatarUrl}
              single={true}
              size="small"
            />
          </Link>
        ) : (
          <div className={cls.dot}></div>
        )}
        <div className={cls.desc}>
          {isChild ? (
            'and'
          ) : (
            <Link to={`/_/user/${act.user.id}`}>{act.user.name}</Link>
          )}
          <span>
            {' '}
            {text} {target}
          </span>
        </div>
        <div className={cls.date}>
          {!isChild && <Time time={act.createdAt} />}
        </div>
      </div>
      {act.childrens && (
        <div>
          {act.childrens.map((child) => {
            return (
              <RowActivity
                key={child.id}
                act={child}
                me={me}
                orgId={orgId}
                projectId={projectId}
                isChild={true}
              />
            );
          })}
        </div>
      )}
      {act.action === 'Project.created' && act.project && (
        <Flex
          className={cls.details}
          direction="column"
          alignItems="flex-start"
          gap="l"
        >
          <Flex gap="l">
            <AvatarAuto name={act.project.name} />
            {act.project.name}
          </Flex>
        </Flex>
      )}
    </div>
  );
};
