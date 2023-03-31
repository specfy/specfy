import { db } from '../../db';

import { seedComponents } from './components';
import { seedPlaybook, seedRFC } from './documents';
import { seedOrgs } from './orgs';
import { seedPolicies } from './policies';
import { seedProjects } from './projects';
import { seedRevisions } from './revisions';
import { truncate } from './seed';
import { seedUsers } from './users';

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
  await truncate();
  console.log('Seeding');
  await seed();
  console.log('Seeding done');

  await db.close();
})();
