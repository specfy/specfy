import type { Authenticator } from '@fastify/passport';
import type { FastifyInstance } from 'fastify';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';

import type { JWT } from '../../common/auth.js';
import { JWT_SECRET } from '../../common/auth.js';
import { prisma } from '../../db/index.js';

// JSON WEB TOKEN
export function registerJwt(fastify: FastifyInstance, passport: Authenticator) {
  const reg = new JwtStrategy(
    {
      secretOrKey: JWT_SECRET,
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
      if (req.user) {
        return;
      }

      if (!user) {
        return;
      }

      const perms = await prisma.perms.findMany({
        where: {
          userId: user.id,
        },
        include: { Org: true },
      });
      req.user = user;
      req.perms = perms;
      req.session.set('passport', { id: user.id });
    })
  );
}
