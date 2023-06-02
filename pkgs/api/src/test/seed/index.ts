import { prisma } from '../../db';

import { seedComponents } from './components';
import { seedDocs, seedPlaybook, seedRFC } from './documents';
import { seedOrgs } from './orgs';
import { seedPolicies } from './policies';
import { seedProjects } from './projects';
import { seedRevisions } from './revisions';
import { truncate } from './seed';
import { seedUsers } from './users';

export async function seed() {
  console.log(' - Users...');
  const users = await seedUsers();

  console.log(' - Orgs...');
  const orgs = await seedOrgs(users);

  console.log(' - Projects...');
  const projects = await seedProjects(users);

  console.log(' - Documents...');
  const rfcs = await seedRFC(orgs, projects, users);
  await seedPlaybook(orgs, projects, users);
  await seedDocs(orgs, projects, users);

  console.log(' - Components...');
  const components = await seedComponents(orgs, projects, users);

  console.log(' - Revisions...');
  await seedRevisions(projects, users, rfcs, components);

  console.log(' - Policies...');
  await seedPolicies(users);
}

(async () => {
  console.log('Cleaning');
  await truncate();
  console.log('Seeding');
  await seed();
  console.log('Seeding done');

  await prisma.$disconnect();
})();
