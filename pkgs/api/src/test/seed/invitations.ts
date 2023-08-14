import type { Orgs, Users } from '@specfy/db';
import { prisma } from '@specfy/db';

import { EXPIRES } from '../../models/invitations/model.js';

export async function seedInvitations(users: Users[], orgs: { o1: Orgs }) {
  await prisma.invitations.create({
    data: {
      id: '81M8QGeqlabl',
      email: 'john.doe@example.com',
      orgId: orgs.o1.id,
      role: 'viewer',
      expiresAt: new Date(Date.now() + EXPIRES),
      token: 'hVMqYstyfxBHbXjkvV4TKZjPsL9Xd4Xn',
      userId: users[0].id,
    },
  });
}
