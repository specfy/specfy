import fastifyCookie from '@fastify/cookie';
import { Authenticator } from '@fastify/passport';
import fastifySession from '@fastify/session';
import type { Users } from '@prisma/client';
import type { FastifyInstance } from 'fastify';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';

import type { JWT } from '../common/auth';
import { JWT_SECRET } from '../common/auth';
import { env } from '../common/env';
import { unauthorized } from '../common/errors';
import { prisma } from '../db';

export function registerAuth(f: FastifyInstance) {
  // f.decorateRequest('user', null);

  const fastifyPassport = new Authenticator();

  f.register(fastifyCookie);
  f.register(fastifySession, {
    secret: 'secret with minimum length of 32 characters',
  });
  f.register(fastifyPassport.initialize());
  f.register(fastifyPassport.secureSession());

  fastifyPassport.use(
    'jwt',
    new JwtStrategy(
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
    )
  );

  fastifyPassport.registerUserSerializer(async (user: Users) => {
    console.log('on serialize');
    return user.id;
  });

  // Deserializer will fetch the user from the database when a request with an id in the session arrives
  fastifyPassport.registerUserDeserializer(async (id: string) => {
    console.log('on deserialise');
    return await prisma.users.findUnique({ where: { id } });
  });

  f.addHook(
    'preHandler',
    //@ts-expect-error
    fastifyPassport.authenticate('jwt', async (req, res, err, user?: Users) => {
      if (!user || err) {
        if (!user && !env('DEFAULT_ACCOUNT')) {
          unauthorized(res);
          return;
        }

        // In dev we can auto-load the default user
        user = (await prisma.users.findUnique({
          where: { email: env('DEFAULT_ACCOUNT')! },
        }))!;
      }

      const perms = await prisma.perms.findMany({
        where: {
          userId: user.id,
        },
        include: { Org: true },
      });
      req.user = user;
      req.perms = perms;
    })
  );
}
