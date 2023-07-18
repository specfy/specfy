import { env } from '../../common/env.js';
import { nanoid } from '../../common/id.js';
import { prisma } from '../../db/index.js';

import { seedComponents } from './components.js';
import { seedDocs, seedPlaybook, seedRFC } from './documents.js';
import { seedInvitations } from './invitations.js';
import { seedJobs } from './jobs.js';
import { seedOrgs } from './orgs.js';
import { seedPolicies } from './policies.js';
import { seedProjects } from './projects.js';
import { seedRevisions } from './revisions.js';
import { truncate } from './seed.js';
import { seedUsers } from './users.js';

export async function seed() {
  console.log(' - Users...');
  const users = await seedUsers();

  console.log(' - Orgs...');
  const orgs = await seedOrgs(users);

  console.log(' - Projects...');
  const projects = await seedProjects(orgs, users);

  console.log(' - Documents...');
  const rfcs = await seedRFC(orgs, projects, users);
  await seedPlaybook(orgs, projects, users);
  await seedDocs(orgs, projects, users);

  console.log(' - Components...');
  const components = await seedComponents(orgs, projects, users);

  console.log(' - Revisions...');
  await seedRevisions(orgs, projects, users, rfcs, components);

  console.log(' - Policies...');
  await seedPolicies(orgs, users);

  console.log(' - Invitations');
  await seedInvitations(users, orgs);

  console.log(' - Jobs');
  await seedJobs(users, orgs, projects);

  const def = env('GIVE_DEFAULT_PERMS_TO_EMAIL');
  if (def) {
    const u = await prisma.users.create({
      data: {
        id: nanoid(),
        name: 'Default Account',
        email: def,
        Accounts: {
          create: {
            id: nanoid(),
            type: 'oauth',
            provider: 'github',
            providerAccountId: '',
            scope: '',
            accessToken: '',
          },
        },
      },
    });
    await prisma.perms.create({
      data: {
        id: nanoid(),
        orgId: orgs.o1.id,
        projectId: null,
        userId: u.id,
        role: 'owner',
      },
    });
  }
}

(async () => {
  console.log('Cleaning');
  await truncate();
  console.log('Seeding');
  await seed();
  console.log('Seeding done');

  await prisma.$disconnect();
})();
