import fastifyCookie from '@fastify/cookie';
import { Authenticator } from '@fastify/passport';
import fastifySession from '@fastify/session';
import type { FastifyInstance } from 'fastify';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';

import type { JWT } from '../common/auth';
import { JWT_SECRET } from '../common/auth';
import { env } from '../common/env';
import { unauthorized } from '../common/errors';
import { Perm, User } from '../models';

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
        const user = await User.findOne({ where: { id: jwt_payload.id } });
        if (user) {
          return done(null, user);
        }

        // No user
        return done(null, false);
      }
    )
  );

  fastifyPassport.registerUserSerializer(async (user: User) => {
    console.log('on serialize');
    return user.id;
  });

  // Deserializer will fetch the user from the database when a request with an id in the session arrives
  fastifyPassport.registerUserDeserializer(async (id: string) => {
    console.log('on deserialise');
    return await User.findOne({ where: { id } });
  });

  f.addHook(
    'preHandler',
    // @ts-expect-error
    fastifyPassport.authenticate('jwt', async (req, res, err, user?: User) => {
      if (!user || err) {
        if (!user && !env('DEFAULT_ACCOUNT')) {
          unauthorized(res);
          return;
        }

        // In dev we can auto-load the default user
        user = (await User.findOne({
          where: { email: env('DEFAULT_ACCOUNT')! },
        }))!;
      }

      const perms = await Perm.scope('withOrg').findAll({
        where: {
          userId: user.id,
        },
      });
      req.user = user;
      req.perms = perms;
    })
  );
}
