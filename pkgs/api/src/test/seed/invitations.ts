import type { Orgs, Users } from '@prisma/client';

import { prisma } from '../../db';
import { EXPIRES } from '../../models/invitations';

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
