import { db } from '../../db';
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

import { seedComponents } from './components';
import { seedPlaybook, seedRFC } from './documents';
import { seedOrgs } from './orgs';
import { seedPolicies } from './policies';
import { seedProjects } from './projects';
import { seedRevisions } from './revisions';
import { seedUsers } from './users';

export async function clean() {
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

export async function seed() {
  const users = await seedUsers();

  const orgs = await seedOrgs(users);

  const projects = await seedProjects(users);

  const rfcs = await seedRFC(projects, users);
  await seedPlaybook(projects, users);

  const components = await seedComponents(orgs, projects, users);

  await seedRevisions(projects, users, rfcs, components);

  await seedPolicies(users);
}

(async () => {
  console.log('Cleaning');
  await clean();
  console.log('Seeding');
  await seed();
  console.log('Seeding done');

  await db.close();
})();
