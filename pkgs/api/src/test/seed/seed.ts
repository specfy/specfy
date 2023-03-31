import '../../db';
import {
  Activity,
  Component,
  Document,
  Org,
  Perm,
  Policy,
  Project,
  Revision,
  RevisionBlob,
  TypeHasUser,
  User,
} from '../../models';

import { seedOrg } from './orgs';
import { seedUser } from './users';

export async function seedSimpleUser(): Promise<{ user: User; token: string }> {
  const user = await seedUser();
  const token = user.getJwtToken();

  return { user, token };
}

export async function seedWithOrg(): Promise<{
  user: User;
  org: Org;
  token: string;
}> {
  const user = await seedUser();
  const org = await seedOrg(user);
  await Perm.create({
    orgId: org.id,
    projectId: null,
    userId: user.id,
    role: 'owner',
  });

  const token = user.getJwtToken();

  return { user, org, token };
}

export async function truncate() {
  await Promise.all([
    User.truncate(),
    Org.truncate(),
    Project.truncate(),
    Document.truncate(),
    Component.truncate(),
    Perm.truncate(),
    Revision.truncate(),
    RevisionBlob.truncate(),
    TypeHasUser.truncate(),
    Policy.truncate(),
    Activity.truncate(),
  ]);
}
