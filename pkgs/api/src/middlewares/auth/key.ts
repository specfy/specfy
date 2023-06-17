import type { Authenticator } from '@fastify/passport';
import type { Keys } from '@prisma/client';
import type { FastifyInstance } from 'fastify';
import { Strategy as KeyStrategy } from 'passport-http-bearer';

import { prisma } from '../../db';

// API KEY
export function registerKey(fastify: FastifyInstance, passport: Authenticator) {
  const reg = new KeyStrategy(async (token, done) => {
    if (!token.startsWith('spfy_') || token.length !== 29) {
      return done('key is invalid', false);
    }

    const key = await prisma.keys.findUnique({
      where: { id: token },
    });
    if (key) {
      return done(null, key);
    }

    // No user
    return done(null, false);
  });

  passport.use('key', reg);

  // Fallback on Json web token if any
  fastify.addHook(
    'preValidation',
    //@ts-expect-error
    passport.authenticate('key', async (req, res, err, key?: Keys) => {
      if (req.user) {
        return;
      }

      if (!key) {
        return;
      }

      const last = key.id.substring(24);
      req.user = {
        id: `spfy_${last}`,
        name: `API [...${last}]`,
        email: 'support@specfy.io',
        password: null,
        avatarUrl: null,
        githubLogin: null,
        createdAt: key.createdAt,
        emailVerifiedAt: key.createdAt,
        updatedAt: key.createdAt,
      };
      req.key = key;
      req.perms = [
        {
          id: '',
          orgId: key.orgId,
          projectId: null,
          role: 'owner',
          userId: key.userId,
          createdAt: key.createdAt,
          updatedAt: key.createdAt,
          Org: {} as any,
        },
      ];
      if (key.projectId) {
        req.perms.push({
          id: '',
          orgId: key.orgId,
          projectId: key.projectId,
          role: 'owner',
          userId: key.userId,
          createdAt: key.createdAt,
          updatedAt: key.createdAt,
          Org: {} as any,
        });
      }
    })
  );
}
