import { envs } from '@specfy/core';
import { prisma } from '@specfy/db';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';

import type { JWT } from '../../types/auth.js';
import type { Authenticator } from '@fastify/passport';
import type { FastifyInstance } from 'fastify';

// JSON WEB TOKEN
export function registerJwt(fastify: FastifyInstance, passport: Authenticator) {
  const reg = new JwtStrategy(
    {
      secretOrKey: envs.JWT_SECRET,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    },
    async (jwt_payload: JWT, done) => {
      const user = await prisma.users.findUnique({
        where: { id: jwt_payload.id },
      });
      if (user) {
        return done(null, user);
      }

      // No user
      return done(null, false);
    }
  );

  passport.use('jwt', reg);

  // Fallback on Json web token if any
  fastify.addHook(
    'preValidation',
    //@ts-expect-error
    passport.authenticate('jwt', async (req, res, err, user?: Users) => {
      if (req.me) {
        return;
      }

      if (!user) {
        return;
      }

      const perms = await prisma.perms.findMany({
        where: {
          userId: user.id,
        },
        include: { Org: { include: { Projects: { select: { id: true } } } } },
      });
      req.me = user;
      req.perms = perms;
      req.session.set('passport', { id: user.id });
    })
  );
}
